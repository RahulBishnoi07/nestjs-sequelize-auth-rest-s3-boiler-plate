import { IsNotEmpty } from 'class-validator';
import { IsUsername } from 'src/utils/custom-validators';

export class UpdateUsernameDto {
  @IsNotEmpty()
  @IsUsername()
  username: string;
}
