import 'dotenv/config';
import { Dialect } from 'sequelize';
import { Algorithm } from 'jsonwebtoken';

export const applicationConfig = {
  app: {
    port: process.env.PORT || 5500,
    env: process.env.NODE_ENV || 'production',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'anonim-server-secret',
    expiresIn: '30d',
    algorithm: 'HS256' as Algorithm,
    issuer: 'anonim-server',
    emailTokenExpiresIn: '5m',
  },

  db: {
    dialect: (process.env.DB_DIALECT || 'postgres') as Dialect,
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'anonim-server',
    port: process.env.DB_PORT || '5432',
  },

  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
    region: process.env.AWS_REGION,
    bucketName: process.env.AWS_BUCKET_NAME,
    expiryTime: 86400, // 1 day in seconds
    verifyEmail: process.env.AWS_VERIFY_EMAIL || 'test@test.com',
  },
};
