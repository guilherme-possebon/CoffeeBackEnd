import { Request, Response } from "express";
import { AppDataSource } from "../db";
import { Forms } from "../models/Forms";
import { User } from "../models/User";
import { Card } from "../models/Card"; // Import the Card model
import { UserCard } from "../models/UserCard";

export class FormsController {
  private formRepository = AppDataSource.getRepository(Forms);
  private userRepository = AppDataSource.getRepository(User);
  private cardRepository = AppDataSource.getRepository(Card); // Add the card repository
  private userCardRepository = AppDataSource.getRepository(UserCard); // Add the card repository

  async create(req: Request, res: Response) {
    const {
      userId,
      rua,
      bairro,
      cep,
      cidade,
      complemento,
      numero,
      uf,
      paymentOption,
    } = req.body;

    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        res.status(404).json({ message: "User not found." });
        return;
      }

      const form = this.formRepository.create({
        rua,
        bairro,
        cep,
        cidade,
        complemento,
        numero,
        uf,
        paymentOption,
        user,
      });

      await this.formRepository.save(form);

      res.status(201).json(form);
    } catch (error) {
      res.status(500).json({ message: "Error creating form", error });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const forms = await this.formRepository.find({
        relations: ["user", "cards"], // Include related user and cards
        order: {
          id: "ASC",
        },
      });
      res.status(200).json(forms);
    } catch (error) {
      res.status(500).json({ message: "Error fetching forms", error });
    }
  }

  async listByUser(req: Request, res: Response) {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ message: "User ID is required." });
      return;
    }

    try {
      const user = await this.userRepository.findOneBy({ id: Number(userId) });

      if (!user) {
        res.status(404).json({ message: "User not found." });
        return;
      }

      // Fetch the user's cards based on the getUserCards logic
      const userCards = await this.userCardRepository.find({
        where: { user: { id: user.id } },
        relations: ["user", "card"],
      });

      // Fetch the user's form
      const form = await this.formRepository.findOne({
        where: { user: user },
        relations: ["cards"],
        order: {
          id: "DESC",
        },
      });

      if (form) {
        form.cards = userCards.map((userCard: UserCard) => userCard.card);
      }

      res.status(200).json(form);
    } catch (error) {
      res.status(500).json({ message: "Error fetching forms for user", error });
    }
  }
}
