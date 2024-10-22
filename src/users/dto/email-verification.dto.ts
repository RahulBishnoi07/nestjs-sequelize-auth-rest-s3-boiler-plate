import {
  IsEmail,
  IsJWT,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { OTP_LENGTH } from 'src/utils/constants';

export class EmailVerificationInitializeDto {
  @IsEmail()
  email: string;
}

export class EmailVerificationFinalizeDto {
  @IsJWT()
  verificationToken: string;

  @IsString()
  @MaxLength(OTP_LENGTH)
  @MinLength(OTP_LENGTH)
  otp: string;
}
