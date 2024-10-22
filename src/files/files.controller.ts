import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { FilesService } from './files.service';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/utils/decorators/current-user';
import { FileDoesNotExist, InvalidArguments } from 'src/utils/exceptions';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Query('is-signed') isSigned: string | undefined,
  ) {
    if (!file) {
      throw new InvalidArguments();
    }

    return this.filesService.create(
      user.id,
      file,
      isSigned === 'true' ? true : false,
    );
  }

  @Get()
  async findAll(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @CurrentUser() user: User,
  ) {
    limit = typeof limit === 'string' ? parseInt(limit) : limit;
    offset = typeof offset === 'string' ? parseInt(offset) : offset;

    const files = await this.filesService.findAndCountAll(
      limit,
      offset,
      user.id,
    );

    return {
      ...files,
      limit,
      offset,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const file = await this.filesService.findOne({ id: +id, userId: user.id });

    if (!file) {
      throw new FileDoesNotExist();
    }

    return file;
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.filesService.remove({ id: +id, userId: user.id });
  }
}
