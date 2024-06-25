import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: 'src/config/envs/.env',
        }),
        TypeOrmModule.forFeature([UserEntity]),
    ],
    controllers: [UserController],

    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
