import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserService } from 'src/entities/user/user.service';
import { ForgottenPasswordBody } from 'src/models/DTOs/auth.dto';
import { UserEntity } from 'src/entities/user/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { RESET_TOKEN_EXPIRATION } from 'src/config/constants';
import { Profile as GoogleProfile } from 'passport-google-oauth20';
import { Profile as FacebookProfile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { RegisterData } from 'src/models/interfaces/IAuth';
import * as sendgrid from '@sendgrid/mail';

@Injectable()
export class AuthService {
    constructor( private readonly userService: UserService, private readonly configService: ConfigService, @Inject('SENDGRID') private readonly sendGridClient: typeof sendgrid
    ) {
    }

    /**
     * Registers a new user.
     * @param user - The user object containing registration details.
     * @returns The created user object.
     * @throws ConflictException if the email is already used.
     */
    async register(userData: RegisterData): Promise<UserEntity> {
        // Check if email domain is valid
        const allowedDomains = ['coalsoft.cz', 'coalios.cz', 'coaledu.cz'];
        const emailDomain = userData.email.split('@')[1];
        if (!allowedDomains.includes(emailDomain)) {
            throw new BadRequestException('Email domain is not allowed');
        }

        // Check if email is already used
        const existingUser = await this.userService.find({ email: userData.email });
        if (existingUser) {
            throw new ConflictException('Email already used');
        }

        if (userData.role === 'employee') {
            // Hash the password
            const salt = await bcrypt.genSalt();
            const password = await bcrypt.hash(userData.password, salt);

            // Generate a unique verification token for the user
            const verificationToken = await bcrypt.hash(`${userData.email}${Date.now()}`, salt);

            const newUser = await this.userService.save({
                id: undefined,
                email: userData.email,
                data: {
                    id: undefined,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    dateOfBirth: userData.dateOfBirth,
                    sex: userData.sex,
                },
                password: password,
                photo: userData.photo,
                verificationToken: verificationToken,
                resetToken: undefined,
                resetTokenExpires: undefined,
                role: userData.role,
                isVerified: userData.isVerified,
                registeredViaExternal: userData.registeredViaExternal,
            });

            console.log(`New user registered: ${newUser.email}`);

            const verificationLink = `${this.configService.get('FRONTEND_URL')}/verify?token=${verificationToken}`;
            await this.sendVerificationEmail(newUser.email, verificationLink);
            return newUser;
        } else {
            throw new BadRequestException('Cannot register an admin');
        }
    }

    /**
     * Sends a verification email to the specified email address.
     * @param email - The email address of the recipient.
     * @param verificationLink - The verification link to include in the email.
     * @returns A Promise that resolves when the email is sent.
     */
    async sendVerificationEmail(email: string, verificationLink: string): Promise<void> {
        const subject = 'Verify your email address';
        const emailBody = `<p>Please click the following link to verify your email address:</p>
                           <a href='${verificationLink}'>${verificationLink}</a>`;
        const msg = {
          to: email,
          from: this.configService.get<string>('SENDGRID_FROM_EMAIL'),
          subject: subject,
          html: emailBody,
        };
        await this.sendGridClient.send(msg);
      }

    /**
     * Verifies a user's email address using the verification token.
     * @param token - The verification token.
     * @returns A Promise that resolves when the email is verified.
     * @throws NotFoundException if the verification token is invalid.
     */
    async verifyEmail(token: string): Promise<boolean> {
        const user = await this.userService.find({ verificationToken: token });
        if (!user) {
            throw new NotFoundException('Invalid verification token');
        }
        if (user.isVerified) {
            return false;
        } else {
            user.isVerified = true;
            await this.userService.save(user);
            return true;
        }
    }

    /**
     * Signs in a user using email and password.
     * @param email
     * @param password
     * @returns
     */
    async validateUser(email: string, password: string): Promise<UserEntity> {
        const user = await this.userService.find({ email });
        if (!user) {
            throw new UnauthorizedException('Email address does not exist');
        }
        if (!user.isVerified) {
            throw new UnauthorizedException('Email address is not verified');
        }
        if (!(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }
        console.log(`User signed in: ${user.email}`);

        return user;
    }

    /**
     * Sends a reset password email to the specified email address.
     * @param email - The email address of the recipient.
     * @returns A Promise that resolves when the email is sent.
     */
    async sendResetEmail(email: string): Promise<void> {
        const user = await this.userService.find({ email });
        if (!user) {
          throw new NotFoundException('User not found');
        }
        const subject = 'Reset your password';
        user.resetToken = uuidv4();
        user.resetTokenExpires = new Date(Date.now() + RESET_TOKEN_EXPIRATION);
        const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/change-password?token=${user.resetToken}`;
        const emailBody = `<p>Please click the following link to reset your password:</p>
                           <a href='${resetUrl}'>${resetUrl}</a>`;
        const msg = {
          to: email,
          from: this.configService.get<string>('SENDGRID_FROM_EMAIL'),
          subject: subject,
          html: emailBody,
        };
        await this.userService.save(user);
        await this.sendGridClient.send(msg);
      }

    /**
     * Verifies a user's reset password token and updates their password.
     * @param body with the token and new password
     * @returns new user object
     */
    async resetForgottenPassword(body: ForgottenPasswordBody): Promise<boolean> {
        const user = await this.userService.find({ resetToken: body.token });

        if (!user) {
            throw new UnauthorizedException('Invalid reset token');
        }

        const expiry = user.resetTokenExpires;
        if (expiry && expiry.getTime() < Date.now()) {
            throw new UnauthorizedException('Reset token has expired');
        }

        await this.updatePassword(user, body.password);
        return true;
    }

    /**
     * Registers/signs in a new user using Google OAuth2.
     * @param email
     * @param password
     * @returns
     */
    async validateGoogleUser(profile: GoogleProfile): Promise<UserEntity> {
        let user = await this.userService.find({ email: profile.emails[0].value });
        if (!user) {
            user = await this.register({
                email: profile.emails[0].value,
                password: uuidv4(),
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                dateOfBirth: null,
                photo: profile.photos[0].value,
                role: 'employee',
                isVerified: true,
                registeredViaExternal: true,
            });
        }

        console.log(`Google user signed in: ${user.email}`);

        return user;
    }

    /**
     * Registers/signs in a new user using Facebook OAuth2.
     * @param profile - The user profile object from Facebook.
     * @returns The user entity.
     */
    async validateFacebookUser(profile: FacebookProfile): Promise<UserEntity> {
        let user = await this.userService.find({ email: profile.emails[0].value });
        if (!user) {
            user = await this.register({
                email: profile.emails[0].value,
                password: uuidv4(), // Generate a secure, random password
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                dateOfBirth: profile.birthday,
                photo: profile.photos[0].value,
                role: 'employee',
                isVerified: true, // Auto-verify users registered via Facebook
                registeredViaExternal: true,
            });
        }

        console.log(`Facebook user signed in: ${user.email}`);
        return user;
    }

    /**
     * Validates a user's old password and updates if it matches.
     * @param user - The user data object.
     * @param oldPassword - The  old password of the user.
     * @param newPassword - the new password of the user
     * @return true if the password is updated, throws an exception otherwise
     *
     */
    async updatePasswordSigned(user: UserEntity, oldPassword: string, newPassword: string): Promise<boolean> {
        if (user) {
            const isSame = await bcrypt.compare(oldPassword, user.password);
            if (isSame) {
                await this.updatePassword(user, newPassword);
                return true;
            } else {
                throw new BadRequestException();
            }
        } else {
            throw new UnauthorizedException();
        }
    }

    /**
     * Updates the password of a user.
     * @param user - The user object to update.
     * @param newPassword - The new password.
     * @returns The updated user object.
     */
    async updatePassword(user: UserEntity, newPassword: string): Promise<UserEntity> {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password
        user.password = hashedPassword;

        // Remove reset token and expiry
        user.resetToken = null;
        user.resetTokenExpires = null;

        return this.userService.save(user);
    }
}
