import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { Card } from "./Card";

@Entity("user_cards")
export class UserCard {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userCards, { onDelete: "CASCADE" })
  user: User;

  @ManyToOne(() => Card, (card) => card.userCards, { onDelete: "CASCADE" })
  card: Card;

  @Column("int")
  quantity: number;
}
