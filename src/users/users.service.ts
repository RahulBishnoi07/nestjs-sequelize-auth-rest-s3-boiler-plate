import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { User } from './entities/user.entity';
import {
  comparePassword,
  hashPassword,
  removeUndefinedKeys,
} from 'src/utils/helpers';
import { InvalidUser } from 'src/utils/exceptions';
import { CreateUser, UpdateUser } from './types/user.type';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async create({ email, username, password }: CreateUser) {
    const user = await this.userModel.create({
      username,
      password,
      email,
      isVerified: true,
    });

    return user;
  }

  async findOne({
    id,
    username,
    otp,
    verificationToken,
    email,
    isVerified,
  }: {
    id?: string;
    username?: string;
    otp?: string;
    verificationToken?: string;
    email?: string;
    isVerified?: boolean;
  }) {
    if (email) {
      const emailRecord = await this.userModel.findOne({
        where: removeUndefinedKeys({
          userId: id,
          email,
          isVerified: isVerified,
        }),
      });

      if (!emailRecord) {
        return null;
      }

      if (!id) {
        id = emailRecord.id;
      }
    }

    const user = await this.userModel.findOne({
      where: removeUndefinedKeys({
        id,
        username,
        otp,
        verificationToken,
      }),
    });

    return user;
  }

  async verifyPassword(id: string, password: string) {
    const user = await this.userModel.scope('withPassword').findOne({
      where: removeUndefinedKeys({
        id,
      }),
    });

    if (!user) {
      throw new InvalidUser();
    }

    return comparePassword(password, user.password);
  }

  async update(id: string, updateUserDto: UpdateUser) {
    if (updateUserDto.password) {
      updateUserDto.password = await hashPassword(updateUserDto.password);
    }

    return this.userModel.update(updateUserDto, {
      where: { id },
    });
  }

  async remove(id: string) {
    return this.userModel.destroy({
      where: { id },
    });
  }
}
