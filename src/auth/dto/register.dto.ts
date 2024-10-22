import {
  IsEmail,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsJWT,
  IsString,
} from 'class-validator';

import {
  OTP_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from 'src/utils/constants';
import { IsUsername } from 'src/utils/custom-validators';

export class RegistrationInitializeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsUsername()
  @IsNotEmpty()
  username: string;

  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  @IsNotEmpty()
  password: string;
}

export class RegistrationFinalizeDto {
  @IsJWT()
  verificationToken: string;

  @IsString()
  @MaxLength(OTP_LENGTH)
  @MinLength(OTP_LENGTH)
  otp: string;
}
