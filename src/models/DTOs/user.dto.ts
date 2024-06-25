import { IsDateString, IsOptional, IsString } from 'class-validator';
import { PersonalDataEntity } from 'src/entities/personalData/personalData.entity';

export class UserUpdateBody {
    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    lastName?: string;

    @IsDateString()
    @IsOptional()
    dateOfBirth?: string;

    @IsString()
    @IsOptional()
    photo?: string;
}

export class UserProfileDTO {
    photo: string;
    email: string;
    personalData: PersonalDataEntity;
}

export class DisplayUserDTO {
    id: number;
    email: string;
    personalData: PersonalDataEntity;
}
