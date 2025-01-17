import {
  IsNotEmpty,
  MaxLength,
  MinLength,
} from 'class-validator';

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from 'src/utils/constants';
import { IsUsername } from 'src/utils/custom-validators';

export class LoginDto {
  @IsUsername()
  @IsNotEmpty()
  username: string;

  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  @IsNotEmpty()
  password: string;
}
