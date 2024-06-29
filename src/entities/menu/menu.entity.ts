import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class MenuEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  restaurant: string;

  @Column("text")
  imageBase64: string;
}
