import {
  Body,
  Controller,
  Get,
  Put,
  Post,
  Request,
  Patch,
  Delete,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from './users.service';
import { CurrentUser } from 'src/utils/decorators/current-user';
import { User } from './entities/user.entity';
import {
  DuplicateUsername,
  InvalidOtp,
  InvalidVerifiedEmail,
  PreviouslyUsedPassword,
  SameCurrentUsername,
  SomethingWentWrong,
  Unauthorized,
} from 'src/utils/exceptions';
import { applicationConfig } from 'config';
import {
  generateJwt,
  generateOtpAndVerificationToken,
  isPresent,
} from 'src/utils/helpers';
import { MailService } from 'src/mail/mail.service';
import { Public } from 'src/utils/decorators/public';
import {
  ForgotPasswordFinalizeDto,
  ForgotPasswordInitializeDto,
} from './dto/forgot-password.dto';
import { UpdateUsernameDto } from './dto/username.dto';
import {
  EmailVerificationFinalizeDto,
  EmailVerificationInitializeDto,
} from './dto/email-verification.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  @Get('me')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @Patch('username')
  async updateUsername(
    @CurrentUser() currentUser: User,
    @Body() body: UpdateUsernameDto,
  ) {
    if (currentUser.username === body.username) {
      throw new SameCurrentUsername();
    }

    const isUsernameAlreadyTaken = isPresent(
      await this.usersService.findOne({
        username: body.username,
      }),
    );

    if (isUsernameAlreadyTaken) {
      throw new DuplicateUsername();
    }

    const [affectedCount] = await this.usersService.update(currentUser.id, {
      username: body.username,
    });

    if (affectedCount !== 1) {
      throw new SomethingWentWrong();
    }

    return generateJwt(
      {
        id: currentUser.id,
        username: body.username,
      },
      this.jwtService,
    );
  }

  @Public()
  @Post('forgot-password')
  async forgotPasswordInitialize(@Body() body: ForgotPasswordInitializeDto) {
    const user = await this.usersService.findOne({
      email: body.email,
      isVerified: true,
    });

    if (!user) {
      throw new InvalidVerifiedEmail();
    }

    const { otp, verificationToken } = generateOtpAndVerificationToken(
      {
        email: body.email,
        userId: user.id,
        username: user.username,
      },
      this.jwtService,
    );

    const [affectedCount] = await this.usersService.update(user.id, {
      otp,
      verificationToken,
    });

    if (affectedCount !== 1) {
      throw new SomethingWentWrong();
    }

    await this.mailService.sendPasswordResetVerificationEmail(
      user.username,
      otp,
      user.email,
    );
    return {
      verificationToken,
      expiresIn: applicationConfig.jwt.emailTokenExpiresIn,
    };
  }

  @Public()
  @Put('forgot-password')
  async forgotPasswordFinalize(@Body() body: ForgotPasswordFinalizeDto) {
    const payload = this.jwtService.verify(body.verificationToken, {
      secret: applicationConfig.jwt.secret,
    });

    const user = await this.usersService.findOne({
      username: payload.username,
      id: payload.id,
      otp: body.otp,
      verificationToken: body.verificationToken,
    });

    if (!user) {
      throw new Unauthorized();
    }

    const isMatch = await this.usersService.verifyPassword(
      user.id,
      body.password,
    );

    if (isMatch) {
      throw new PreviouslyUsedPassword();
    }

    const [affectedCount] = await this.usersService.update(user.id, {
      password: body.password,
      otp: null,
      verificationToken: null,
    });

    if (affectedCount !== 1) {
      throw new InvalidOtp();
    }

    return { isUpdated: true };
  }

  @Post('update-email')
  async updateEmailInitialize(
    @CurrentUser() currentUser: User,
    @Body() body: EmailVerificationInitializeDto,
  ) {
    const { otp, verificationToken } = generateOtpAndVerificationToken(
      {
        email: body.email,
        userId: currentUser.id,
        username: currentUser.username,
      },
      this.jwtService,
    );

    const [affectedCount] = await this.usersService.update(currentUser.id, {
      otp,
      verificationToken,
    });

    if (affectedCount !== 1) {
      throw new SomethingWentWrong();
    }

    await this.mailService.sendVerificationEmail(
      currentUser.username,
      otp,
      body.email,
    );

    return {
      verificationToken,
      expiresIn: applicationConfig.jwt.emailTokenExpiresIn,
    };
  }

  @Put('update-email')
  async updateEmailFinalize(
    @CurrentUser() currentUser: User,
    @Body() body: EmailVerificationFinalizeDto,
  ) {
    const payload = this.jwtService.verify(body.verificationToken, {
      secret: applicationConfig.jwt.secret,
    });

    if (
      currentUser.id != payload.id &&
      currentUser.username != payload.username
    ) {
      throw new Unauthorized();
    }

    const user = await this.usersService.findOne({
      username: payload.username,
      id: payload.id,
      otp: body.otp,
      verificationToken: body.verificationToken,
    });

    if (!user) {
      throw new Unauthorized();
    }

    const [affectedCount] = await this.usersService.update(user.id, {
      email: payload.email,
      otp: null,
      verificationToken: null,
    });

    if (affectedCount !== 1) {
      throw new InvalidOtp();
    }

    return { isUpdated: true };
  }

  @Delete()
  async deleteAccount(@CurrentUser() currentUser: User) {
    await this.usersService.remove(currentUser.id);

    return { isDeleted: true };
  }
}
