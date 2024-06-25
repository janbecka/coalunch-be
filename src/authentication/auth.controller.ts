// auth.controller.ts
import { Controller, Get, Post, UseGuards, Request, Body, Req, Res, Query, NotFoundException } from '@nestjs/common';
import { ForgottenPasswordBody, LoginBody, PasswordBody, RegisterBody, ResetBody } from 'src/models/DTOs/auth.dto';
import { AuthService } from './auth.service';
import { UserEntity } from 'src/entities/user/user.entity';
import { LocalAuthGuard } from './local.auth.guard';
import { AuthenticatedGuard } from './authenticated.guard';
import { GoogleAuthGuard } from './google.auth.guard';
import { FacebookAuthGuard } from './facebook.auth.guard';
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiOkResponse,
    ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { RegisterData } from 'src/models/interfaces/IAuth';

@ApiTags('Auth Controller')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private configService: ConfigService) {}

    @ApiCreatedResponse({ description: 'User successfully registered', type: UserEntity })
    @ApiConflictResponse({ description: 'The email is already in use' })
    @ApiBadRequestResponse({ description: 'Cannot register an admin' })
    @Post('register')
    async register(@Body() body: RegisterBody): Promise<UserEntity> {
        const data: RegisterData = {
            ...body,
            isVerified: false,
            registeredViaExternal: false,
        };
        const registeredUser = await this.authService.register(data);
        return registeredUser;
    }

    @ApiOkResponse({ description: 'Email successfully verified' })
    @ApiNotFoundResponse({ description: 'The token is invalid' })
    @Get('/verify-email')
    async verifyEmail(@Query('token') token: string): Promise<boolean> {
        if (!token) {
            throw new NotFoundException('The token is invalid');
        }
        return await this.authService.verifyEmail(token);
    }

    @ApiCreatedResponse({ description: 'User successfully signed in' })
    @ApiUnauthorizedResponse({ description: 'The credentials are invalid' })
    @UseGuards(LocalAuthGuard)
    @Post('login')
    login(@Request() req, @Body() body: LoginBody): string {
        // Passport automatically attaches the user object to the request
        // You can add additional login logic here if necessary
        return body.username;
    }

    @ApiOkResponse({ description: 'The user has been logged out' })
    @Get('/logout')
    logout(@Request() req): any {
        req.session.destroy();
        return { msg: 'The user session has ended' };
    }

    @ApiCreatedResponse({ description: 'Reset email successfully sent' })
    @Post('/send-reset-email')
    async sendResetEmail(@Body() resetDTO: ResetBody): Promise<void> {
        await this.authService.sendResetEmail(resetDTO.email);
    }

    @ApiCreatedResponse({ description: "User's password successfully updated" })
    @ApiUnauthorizedResponse({ description: 'The token is invalid/expired' })
    @Post('/update-password')
    async updatePassword(@Body() updateDTO: ForgottenPasswordBody): Promise<void> {
        await this.authService.resetForgottenPassword(updateDTO);
    }

    @Get('/google')
    @UseGuards(GoogleAuthGuard)
    googleAuth(): any {
        // Initiates the Google OAuth2 login flow
    }

    @Get('/google/callback')
    @UseGuards(GoogleAuthGuard)
    googleAuthRedirect(@Req() req, @Res() res): any {
        // Handles the Google OAuth2 callback
        const user = req.user;
        // Here, implement your logic to create/update user and manage session
        // For example, set the session cookie:
        req.session.user = user;
        res.redirect(`${this.configService.get('FRONTEND_URL')}/login?resp=success`);
    }

    @Get('/facebook')
    @UseGuards(FacebookAuthGuard)
    facebookAuth(): any {
        // Initiates the Facebook OAuth2 login flow
    }
    @Get('/facebook/callback')
    @UseGuards(FacebookAuthGuard)
    async facebookAuthRedirect(@Req() req, @Res() res): Promise<any> {
        // Handles the Facebook OAuth2 callback
        const user = req.user;
        // Implement your logic for user creation/update and session management
        // For example, setting the session cookie:
        req.session.user = user;
        res.redirect(`${this.configService.get('FRONTEND_URL')}/login?resp=success`);
    }

    @Get('/verify-login')
    @ApiUnauthorizedResponse({ description: 'The user is not logged in' })
    @ApiOkResponse({ description: 'The user is loggin in' })
    @UseGuards(AuthenticatedGuard)
    verifyLogin(): any {
        return { message: 'The user is logged in' };
    }

    @ApiOkResponse({ description: "User's password successfully updated", type: Boolean })
    @ApiUnauthorizedResponse({ description: 'The session is invalid' })
    @ApiBadRequestResponse({ description: 'The old password is incorrect' })
    @UseGuards(AuthenticatedGuard)
    @Post('/update-password-signed')
    async updatePasswordSigned(@Req() req, @Body() updateDTO: PasswordBody): Promise<void> {
        await this.authService.updatePasswordSigned(req.user, updateDTO.oldPassword, updateDTO.newPassword);
    }
}
