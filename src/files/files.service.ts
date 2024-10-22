import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ObjectCannedACL,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { PromisePool } from '@supercharge/promise-pool';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Op, WhereOptions } from 'sequelize';

import { File } from './entities/file.entity';
import { applicationConfig } from 'config';
import { InvalidArguments } from 'src/utils/exceptions';

@Injectable()
export class FilesService {
  private s3: S3Client;
  private readonly bucketName = applicationConfig.aws.bucketName;
  private readonly expiryTime = applicationConfig.aws.expiryTime;

  constructor(
    @InjectModel(File)
    private readonly fileModel: typeof File,
  ) {
    this.s3 = new S3Client({
      region: applicationConfig.aws.region,
      credentials: {
        accessKeyId: applicationConfig.aws.accessKeyId,
        secretAccessKey: applicationConfig.aws.secretAccessKey,
      },
    });
  }

  async uploadFileToS3(file: Express.Multer.File, isSigned: boolean) {
    const params = {
      Bucket: this.bucketName,
      Key: `${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ...(!isSigned ? { ACL: ObjectCannedACL.public_read } : {}),
    };

    const command = new PutObjectCommand(params);

    const s3Result = await this.s3.send(command);
    return { s3Result, key: params.Key };
  }

  async create(userId: string, file: Express.Multer.File, isSigned: boolean) {
    const s3Result = await this.uploadFileToS3(file, isSigned);

    let url = `https://${this.bucketName}.s3.${applicationConfig.aws.region}.amazonaws.com/${s3Result.key}`;
    let expiryTime = null;

    if (isSigned) {
      const signedUrl = await this.getSignedUrl(s3Result.key);
      url = signedUrl;
      expiryTime = new Date(Date.now() + this.expiryTime * 1000);
    }

    return this.fileModel.create({
      userId,
      key: s3Result.key,
      url,
      isSigned,
      expiryTime,
    });
  }

  async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    return await getSignedUrl(this.s3, command, { expiresIn: this.expiryTime });
  }

  async findOne(filter: WhereOptions<File> = {}) {
    return this.fileModel.findOne({
      where: filter,
    });
  }

  async findAndCountAll(limit: number, offset: number, userId: string) {
    return this.fileModel.findAndCountAll({
      where: { userId },
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });
  }

  async remove(filter: WhereOptions<File> = {}) {
    const file = await this.findOne(filter);

    if (!file) {
      throw new InvalidArguments();
    }

    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: file.key,
      }),
    );

    await file.destroy();
    return { deleted: true };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async regenerateSignedUrls() {
    Logger.log('Called regenerateSignedUrls cron');

    const limit = 100; // Number of records to fetch per batch
    let offset = 0;
    let files: File[];

    do {
      files = await this.fileModel.findAll({
        where: {
          isSigned: true,
          expiryTime: {
            [Op.lte]: new Date(Date.now() + 2 * 3600 * 1000), // Expired or expiring in the next 2 hours
          },
        },
        limit,
        offset,
      });

      await PromisePool.for(files)
        .withConcurrency(10) // Adjust concurrency as needed
        .process(async (file: File) => {
          const signedUrl = await this.getSignedUrl(file.key);

          await file.update({
            url: signedUrl,
            expiryTime: new Date(Date.now() + this.expiryTime * 1000),
          });
        });

      offset += limit;
    } while (files.length === limit);
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async cleanupS3Files() {
    Logger.log('Called cleanupS3Files cron');

    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: this.bucketName,
    });

    let isTruncated = true;
    let continuationToken: string | undefined;

    while (isTruncated) {
      const listObjectsResponse = await this.s3.send(listObjectsCommand);
      const s3Objects = listObjectsResponse.Contents || [];

      await PromisePool.for(s3Objects)
        .withConcurrency(10)
        .process(async (s3Object) => {
          if (!s3Object.Key) return;

          const fileExists = await this.fileModel.findOne({
            where: { key: s3Object.Key },
          });

          if (!fileExists) {
            await this.s3.send(
              new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: s3Object.Key,
              }),
            );
            Logger.log(`Deleted S3 file: ${s3Object.Key}`);
          }
        });

      isTruncated = listObjectsResponse.IsTruncated || false;
      continuationToken = listObjectsResponse.NextContinuationToken;

      if (isTruncated && continuationToken) {
        listObjectsCommand.input.ContinuationToken = continuationToken;
      }
    }

    Logger.log('Finished cleanupS3Files cron');
  }
}
