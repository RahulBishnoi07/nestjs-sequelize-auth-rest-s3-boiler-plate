import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { SesService } from './ses.service';

@Module({
  providers: [MailService, SesService],
  exports: [MailService],
})
export class MailModule {}
