import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';

export class RegisterBody {
    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsDateString()
    dateOfBirth?: string;

    @IsString()
    @IsOptional()
    sex?: string;

    @IsString()
    @IsOptional()
    photo?: string;

    @IsString()
    role: 'employee' | 'admin';
}

export class LoginBody {
    username: string;
    password: string;
}

export class ResetBody {
    @IsEmail()
    email: string;
}

export class ForgottenPasswordBody {
    @IsString()
    token: string;

    @IsString()
    password: string;
}

export class PasswordBody {
    @IsString()
    newPassword: string;

    @IsString()
    oldPassword: string;
}

export class GoogleProfile {
    @IsEmail()
    email: string;

    @IsString()
    given_name: string;

    @IsString()
    family_name: string;
}
