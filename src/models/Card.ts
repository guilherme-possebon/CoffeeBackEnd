import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { UserCard } from "./UserCard";

@Entity("cards")
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "img_src", type: "varchar", length: 255 })
  imgSrc: string;

  @Column({ type: "varchar", length: 100 })
  title: string;

  @Column("numeric", { precision: 10, scale: 2 })
  price: number;

  @Column("text")
  text: string;

  @Column("text", { array: true })
  tags: string[];

  @OneToMany(() => UserCard, (userCard) => userCard.card)
  userCards: UserCard[];
}
