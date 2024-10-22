import { Injectable } from '@nestjs/common';

import { applicationConfig } from 'config';

@Injectable()
export class AppService {
  getHello(): string {
    return `Hello ${applicationConfig.app.env}!`;
  }
}
