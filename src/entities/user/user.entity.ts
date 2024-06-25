import { Entity, Column, Unique, PrimaryGeneratedColumn, JoinColumn, OneToOne } from 'typeorm';
import { PersonalDataEntity } from '../personalData/personalData.entity';

@Entity({ name: 'user' })
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Unique(['email'])
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true, type: 'text' })
    photo?: string;

    @Column({ default: 'employee' })
    role: 'employee' | 'admin';

    @Column({ nullable: true })
    verificationToken?: string;

    @Column({ default: false })
    isVerified?: boolean;

    @Column({ nullable: true })
    resetToken?: string;

    @Column({ nullable: true })
    resetTokenExpires?: Date;

    @Column({ default: false })
    registeredViaExternal?: boolean;

    @OneToOne(() => PersonalDataEntity, { cascade: true, eager: true })
    @JoinColumn()
    data?: PersonalDataEntity;
}

export class UserWhere {
    id?: number;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: 'employee' | 'admin';
    verificationToken?: string;
    isVerified?: boolean;
    resetToken?: string;
    resetTokenExpires?: Date;
    registeredViaExternal?: boolean;
}
