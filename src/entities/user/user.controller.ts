import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { AuthenticatedGuard } from 'src/authentication/authenticated.guard';
import { UserProfileDTO, UserUpdateBody } from 'src/models/DTOs/user.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('User Controller')
@Controller('users')
@UseGuards(AuthenticatedGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    async getUsers(): Promise<UserEntity[]> {
        return await this.userService.getUsers();
    }

    @ApiOkResponse({ description: 'User found', type: UserEntity })
    @Get('profile')
    async getProfile(@Req() req): Promise<UserProfileDTO> {
        const profile = await this.userService.getProfile(req.user.id);
        return profile;
    }

    @ApiCreatedResponse({ description: 'User successfully updated', type: UserEntity })
    @Post('update')
    async updateUser(@Req() req, @Body() user: UserUpdateBody): Promise<UserEntity> {
        return await this.userService.updateUser(req.user.id, user);
    }
}
