// auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';
import { ConfigModule } from "@nestjs/config";
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';
import { FacebookStrategy } from './facebook.strategy';
import { UserModule } from 'src/entities/user/user.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: 'src/config/envs/.env',
        }),
        PassportModule.register({ session: true }),
        UserModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, GoogleStrategy, SessionSerializer, FacebookStrategy],
})
export class AuthModule {}
