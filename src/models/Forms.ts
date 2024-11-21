import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { User } from "./User";
import { Card } from "./Card";

@Entity("forms")
export class Forms {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  rua: string;

  @Column({ type: "varchar", length: 255 })
  bairro: string;

  @Column({ type: "varchar", length: 10 })
  cep: string;

  @Column({ type: "varchar", length: 255 })
  cidade: string;

  @Column({ type: "varchar", length: 100 })
  complemento: string;

  @Column({ type: "varchar", length: 10 })
  numero: string;

  @Column({ type: "varchar", length: 2 })
  uf: string;

  @Column({ type: "varchar", length: 20 })
  paymentOption: string;

  @ManyToOne(() => User, (user) => user.forms)
  user: User;

  @ManyToMany(() => Card)
  @JoinTable()
  cards: Card[];
}
