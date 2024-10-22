import { isEmpty, isNil, isNull, isNaN, omitBy, isUndefined } from 'lodash';
import * as bcrypt from 'bcrypt';
import { applicationConfig } from 'config';
import { JwtService } from '@nestjs/jwt';
import { OTP_LENGTH } from './constants';
// import * as CryptoJS from 'crypto-js';

export const isNilOrEmpty = (value: any) =>
  isNil(value) ||
  isEmpty(value) ||
  isNull(value) ||
  isNaN(value) ||
  isUndefined(value);

export const isPresent = (value: any) => !isNilOrEmpty(value);

export const removeEmptyKeys = (data: any) => omitBy(data || {}, isEmpty);
export const removeUndefinedKeys = (data: any) =>
  omitBy(data || {}, isUndefined);

export const getEncodedUrl = (url?: string) => {
  return url ? encodeURIComponent(url) : null;
};

export const getHostnameUrl = (input: string) => {
  if (input.includes('www.')) {
    input = input.replace('www.', '');
  }

  if (input.startsWith('http://')) {
    input = input.replace('http://', 'https://');
  }

  if (!input.startsWith('https://')) {
    input = 'https://' + input;
  }

  return new URL(input).hostname;
};

export const getSanitizedUrl = (url: string) => {
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
  }

  if (!url.startsWith('https://')) {
    url = 'https://' + url;
  }

  return url;
};

export const generateOtpAndVerificationToken = (
  payload: {
    [key: string]: string;
  },
  jwtService: JwtService,
) => {
  const otp = Array.from({ length: OTP_LENGTH }, () =>
    Math.floor(Math.random() * 10),
  ).join('');
  const verificationToken = jwtService.sign(payload, {
    secret: applicationConfig.jwt.secret,
    algorithm: applicationConfig.jwt.algorithm,
    issuer: applicationConfig.jwt.issuer,
    expiresIn: applicationConfig.jwt.emailTokenExpiresIn,
  });

  return { otp, verificationToken };
};

export const generateJwt = async (
  payload: { id: string; username: string },
  jwtService: JwtService,
) => {
  const jwtPayload = { sub: payload.id, username: payload.username };

  return {
    accessToken: await jwtService.signAsync(jwtPayload),
    expiresIn: applicationConfig.jwt.expiresIn,
  };
};

export const hashPassword = (password: string) => {
  const saltOrRounds = 10;

  return bcrypt.hash(password, saltOrRounds);
};

export const comparePassword = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

// export const encryptKey = (value: string): string => {
//   return CryptoJS.AES.encrypt(
//     value,
//     applicationConfig.app.encryptionKeySecret,
//   ).toString();
// };

// export const decryptKey = (value: string): string => {
//   try {
//     const bytes = CryptoJS.AES.decrypt(
//       value,
//       applicationConfig.app.encryptionKeySecret,
//     );
//     const decrypted = bytes.toString(CryptoJS.enc.Utf8);
//     return decrypted || value;
//   } catch {
//     return value;
//   }
// };
