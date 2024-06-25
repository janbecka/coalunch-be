import { Injectable } from '@nestjs/common';
import { UserEntity, UserWhere } from './user.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DisplayUserDTO, UserProfileDTO, UserUpdateBody } from 'src/models/DTOs/user.dto';
import { PersonalDataEntity } from '../personalData/personalData.entity';

@Injectable()
export class UserService {

    constructor( @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>) {}

    /**
     * Get all users
     * @returns
     */
    async getUsers(): Promise<UserEntity[]> {
        return await this.userRepo.find();
    }

    /**
     * Find a user by any field
     * @param where
     * @returns
     */
    async find(where: UserWhere): Promise<UserEntity> {
        try {
            return await this.userRepo.findOneBy(where);
        } catch (e) {
            console.error(`Error getting user: ${e.message}`);
            throw e;
        }
    }

    /**
     * Save a user
     * @param user
     * @returns
     */
    async save(user: UserEntity): Promise<UserEntity> {
        try {
            return await this.userRepo.save(user);
        } catch (e) {
            console.error(`Error saving user: ${e.message}`);
            throw e;
        }
    }

    /**
     * Get the profile of a user
     * @param id
     * @returns
     */
    async getProfile(id: number): Promise<UserProfileDTO> {
        const user = await this.userRepo.findOne({ where: { id }, select: ['id', 'data', 'photo', 'email'] });
        if (!user) {
            throw new Error('User not found');
        }
        const profile: UserProfileDTO = {
            photo: user.photo,
            email: user.email,
            personalData: user.data,
        };
        return profile;
    }

    /**
     * Updates basic user data
     * @param userId from request
     * @param data new data
     * @returns updated user entity
     */
    async updateUser(userId: number, data: UserUpdateBody): Promise<UserEntity> {
        const user = await this.find({ id: userId });
        user.data = user.data || new PersonalDataEntity();
        user.data.firstName = data.firstName || user.data.firstName;
        user.data.lastName = data.lastName || user.data.lastName;
        user.data.dateOfBirth = data.dateOfBirth || user.data.dateOfBirth;
        // remove user photo if new photo is NULL
        user.photo = data.photo === null ? null : data.photo || user.photo;
        const updatedUser = await this.save(user);
        return updatedUser;
    }

    /**
     * Displayes employees with userId from user entity
     * @param userIds of the employees
     * @returns employees with the user id, so it takes them from user entity
     */
    async displayUsers(userIds: number[]): Promise<DisplayUserDTO[]> {
        const users = await this.userRepo.find({
            where: { id: In(userIds) },
            select: ['id', 'email', 'data'],
        });

        return users.map((user) => ({
            id: user.id,
            email: user.email,
            personalData: user.data,
        }));
    }
}
