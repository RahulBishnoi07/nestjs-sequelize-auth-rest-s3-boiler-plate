import { PartialType } from '@nestjs/mapped-types';

export class CreateUser {
  email: string;
  username: string;
  password: string;
}

export class UpdateUser extends PartialType(CreateUser) {
  otp?: string | null;
  verificationToken?: string | null;
}
