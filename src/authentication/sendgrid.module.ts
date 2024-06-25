import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as sendgrid from '@sendgrid/mail';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'SENDGRID',
      useFactory: async (configService: ConfigService) => {
        const apiKey = configService.get<string>('SENDGRID_API_KEY');
        sendgrid.setApiKey(apiKey);
        return sendgrid;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['SENDGRID'],
})
export class SendGridModule {}
