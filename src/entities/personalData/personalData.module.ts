import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalDataEntity } from './personalData.entity';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: 'src/config/envs/.env',
        }),
        TypeOrmModule.forFeature([PersonalDataEntity]),
    ],
})
export class PersonalDataModule {}
