import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import {
  RegistrationInitializeDto,
  RegistrationFinalizeDto,
} from './dto/register.dto';
import {
  generateJwt,
  generateOtpAndVerificationToken,
  hashPassword,
  isPresent,
  removeUndefinedKeys,
} from 'src/utils/helpers';
import {
  DuplicateEmail,
  DuplicateUsername,
  Unauthorized,
  WrongPassword,
} from 'src/utils/exceptions';
import { LoginDto } from './dto/login.dto';
import { applicationConfig } from 'config';
import { InjectModel } from '@nestjs/sequelize';
import { AuthLeads } from './entities/auth-leads.entity';
import { MailService } from 'src/mail/mail.service';
import { Op } from 'sequelize';
import { subtractMinutesFromNow } from 'src/utils/dates';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(AuthLeads)
    private authLeads: typeof AuthLeads,
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegistrationInitializeDto) {
    const [isUsernameAlreadyTaken, isEmailAlreadyTaken] = await Promise.all([
      isPresent(
        await this.usersService.findOne({
          username: registerDto.username,
        }),
      ),
      isPresent(
        await this.usersService.findOne({
          email: registerDto.email,
          isVerified: true,
        }),
      ),
    ]);

    if (isUsernameAlreadyTaken) {
      throw new DuplicateUsername();
    }

    if (isEmailAlreadyTaken) {
      throw new DuplicateEmail();
    }

    const { otp, verificationToken } = generateOtpAndVerificationToken(
      {
        email: registerDto.email,
        username: registerDto.username,
      },
      this.jwtService,
    );

    const authLead = await this.authLeads.create({
      ...registerDto,
      password: await hashPassword(registerDto.password),
      otp,
      verificationToken,
    });

    await this.mailService.sendVerificationEmail(
      authLead.username,
      authLead.otp,
      authLead.email,
    );

    return {
      verificationToken,
      expiresIn: applicationConfig.jwt.emailTokenExpiresIn,
    };
  }

  async registerEmailVerification(
    registerEmailVerificationDto: RegistrationFinalizeDto,
  ) {
    const payload = this.jwtService.verify(
      registerEmailVerificationDto.verificationToken,
      {
        secret: applicationConfig.jwt.secret,
      },
    );

    const authLead = await this.authLeads.findOne({
      where: {
        verificationToken: registerEmailVerificationDto.verificationToken,
        otp: registerEmailVerificationDto.otp,
        email: payload.email,
        username: payload.username,
      },
    });

    if (!authLead) {
      throw new Unauthorized();
    }

    const [isUsernameAlreadyTaken, isEmailAlreadyTaken] = await Promise.all([
      isPresent(
        await this.usersService.findOne({
          username: authLead.username,
        }),
      ),
      isPresent(
        await this.usersService.findOne({
          email: authLead.email,
          isVerified: true,
        }),
      ),
    ]);

    if (isUsernameAlreadyTaken) {
      throw new DuplicateUsername();
    }

    if (isEmailAlreadyTaken) {
      throw new DuplicateEmail();
    }

    const user = await this.usersService.create(authLead);

    await authLead.destroy();

    return {
      user,
      ...(await generateJwt(user, this.jwtService)),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOne(
      removeUndefinedKeys({
        username: loginDto.username,
        isVerified: true,
      }),
    );

    if (!user) {
      throw new Unauthorized();
    }

    const isMatch = await this.usersService.verifyPassword(
      user.id,
      loginDto.password,
    );

    if (!isMatch) {
      throw new WrongPassword();
    }

    return {
      user,
      ...(await generateJwt(user, this.jwtService)),
    };
  }

  async clearUnusedAuthLeads() {
    const numberOfRowsAffected = await this.authLeads.destroy({
      where: {
        createdAt: {
          [Op.lt]: subtractMinutesFromNow(6),
        },
      },
    });

    return { numberOfRowsAffected };
  }
}
