import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'personal-data' })
export class PersonalDataEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ nullable: true, type: 'date' })
    dateOfBirth?: string;

    @Column({ nullable: true })
    sex?: string;
}
