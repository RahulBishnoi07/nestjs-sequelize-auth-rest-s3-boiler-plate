import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ScheduleModule } from '@nestjs/schedule';

import { applicationConfig } from 'config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SequelizeModule.forRoot({
      dialect: applicationConfig.db.dialect,
      host: applicationConfig.db.host,
      username: applicationConfig.db.username,
      password: applicationConfig.db.password,
      database: applicationConfig.db.database,
      port: parseInt(applicationConfig.db.port, 10),
      logging: false,
      autoLoadModels: true,
      synchronize: false,
      ...(['production'].includes(applicationConfig.app.env)
        ? {
            dialectOptions: {
              ssl: {
                rejectUnauthorized: false,
                sslmode: 'no-verify',
              },
            },
          }
        : {}),
    }),
    AuthModule,
    UsersModule,
    MailModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
