import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserEntity } from 'src/entities/user/user.entity';
import { UserModule } from 'src/entities/user/user.module';
import { SendGridModule } from 'src/authentication/sendgrid.module';
import { PersonalDataEntity } from 'src/entities/personalData/personalData.entity';
import { AuthModule } from 'src/authentication/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
        envFilePath: 'src/config/envs/.env',
    }),
    TypeOrmModule.forRoot({
        type: process.env.DB_TYPE as any,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        entities: [UserEntity, PersonalDataEntity],
        synchronize: true,
    }),
    AuthModule,
    UserModule,
    SendGridModule,
],
controllers: [AppController],
providers: [AppService],
})
export class AppModule {}
