import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Forms } from "./Forms";
import { UserCard } from "./UserCard";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", length: 100 })
  password: string;

  @OneToMany(() => UserCard, (userCard) => userCard.user)
  userCards: UserCard[];

  @OneToMany(() => Forms, (form) => form.user)
  forms: Forms[];
}
