import { Request, Response } from "express";
import { AppDataSource } from "../db";
import { User } from "../models/User";
import { Card } from "../models/Card";
import { UserCard } from "../models/UserCard";

export class UserController {
  private userRepository = AppDataSource.getRepository(User);
  private cardRepository = AppDataSource.getRepository(Card);
  private userCardRepository = AppDataSource.getRepository(UserCard);

  async addCardsWithQuantities(req: Request, res: Response) {
    const { userId, cards } = req.body;

    if (!userId || !Array.isArray(cards)) {
      res
        .status(400)
        .json({ message: "Missing userId or cards array in request body." });
      return;
    }

    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        res.status(404).json({ message: "User not found." });
        return;
      }

      const userCardEntries = [];

      for (const { cardId, quantity } of cards) {
        if (!cardId || !quantity) {
          res
            .status(400)
            .json({ message: "Each card must have cardId and quantity." });
          return;
        }

        const card = await this.cardRepository.findOne({
          where: { id: cardId },
        });

        if (!card) {
          res
            .status(404)
            .json({ message: `Card with ID ${cardId} not found.` });
          return;
        }

        let userCard = await this.userCardRepository.findOne({
          where: { user: { id: userId }, card: { id: cardId } },
        });

        if (userCard) {
          userCard.quantity = quantity;
        } else {
          userCard = new UserCard();
          userCard.user = user;
          userCard.card = card;
          userCard.quantity = quantity;
        }

        userCardEntries.push(userCard);
      }
      console.log(
        "🚀 ~ UserController ~ addCardsWithQuantities ~ userCardEntries:",
        userCardEntries
      );

      await this.userCardRepository.save(userCardEntries);

      res.status(200).json(userCardEntries);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating user cards.", error });
    }
  }

  async create(req: Request, res: Response) {
    const userObj = new User();

    userObj.name = req.body.name;
    userObj.password = req.body.password;

    try {
      const user = await this.userRepository.save(userObj);

      res.status(200).json(user);
      return;
    } catch (error) {
      console.log(error);
    }
  }

  async getUser(req: Request, res: Response) {
    const id = Number(req.params.id);

    try {
      if (id >= 0) {
        const user = await this.userRepository.find({
          where: {
            id: id,
          },
        });

        res.status(200).json(user);
        return;
      } else {
        res.status(400).json({
          message: "Usuario não encontrado, tente novamente com outro id",
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getUserCards(req: Request, res: Response) {
    const userId = Number(req.params.userId);

    if (isNaN(userId)) {
      res.status(400).json({ message: "Invalid user ID." });
      return;
    }

    try {
      const userCards = await this.userCardRepository.find({
        where: { user: { id: userId } },
        relations: ["user", "card"],
      });

      if (userCards.length === 0) {
        res.status(204).json({ message: "No cards found for this user." });
        return;
      }

      res.status(200).json(userCards);
    } catch (error) {
      console.error("Error fetching user cards:", error);
      res.status(500).json({ message: "Error fetching user cards.", error });
    }
  }

  async updateCardQuantity(req: Request, res: Response) {
    const userId = Number(req.params.userId);
    const cardId = req.body.cardId;
    const quantity = req.body.quantity;

    console.log("userId " + userId);
    console.log("cardId " + cardId);
    console.log("quantity " + quantity);

    if (!userId || !cardId || quantity === undefined) {
      res.status(400).json({ message: "Missing userId, cardId, or quantity." });
      console.log("Missing userId, cardId, or quantity.");
      return;
    }

    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        res.status(404).json({ message: "User not found." });
        console.log("User not found.");
        return;
      }

      const card = await this.cardRepository.findOne({ where: { id: cardId } });
      if (!card) {
        res.status(404).json({ message: "Card not found." });
        console.log("Card not found.");
        return;
      }

      let userCard = await this.userCardRepository.findOne({
        where: { user: { id: userId }, card: { id: cardId } },
        relations: ["user", "card"],
      });

      if (userCard) {
        if (quantity > 0) {
          userCard.quantity = quantity;
          await this.userCardRepository.save(userCard);
          res.status(200).json(userCard);
        } else {
          await this.userCardRepository.remove(userCard);
          res.status(200).json({ message: "Card removed from cart." });
          console.log("Card removed from cart.");
        }
      } else {
        if (quantity > 0) {
          userCard = new UserCard();
          userCard.user = user;
          userCard.card = card;
          userCard.quantity = quantity;
          await this.userCardRepository.save(userCard);
          res.status(201).json(userCard);
        } else {
          res.status(400).json({ message: "Cannot add card with quantity 0." });
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating card quantity.", error });
    }
  }

  async getUserCartItemCount(req: Request, res: Response) {
    const userId = Number(req.params.userId);

    if (isNaN(userId)) {
      res.status(400).json({ message: "Invalid user ID." });
      return;
    }

    try {
      const userCards = await this.userCardRepository.find({
        where: { user: { id: userId } },
        relations: ["user", "card"],
      });

      if (userCards.length === 0) {
        res.status(200).json({ itemCount: 0 });
        return;
      }

      const uniqueCards = new Set(
        userCards.map((userCard) => userCard.card.id)
      );

      res.status(200).json({ itemCount: uniqueCards.size });
    } catch (error) {
      console.error("Error fetching user cart item count:", error);
      res
        .status(500)
        .json({ message: "Error fetching user cart item count.", error });
    }
  }

  async getCardsIdBasedOnTheUser(req: Request, res: Response) {
    const userId = Number(req.params.userId);

    if (isNaN(userId)) {
      res.status(400).json({ message: "Invalid user ID." });
      return;
    }

    try {
      const userCards = await this.userCardRepository.find({
        where: { user: { id: userId } },
        relations: ["user", "card"],
        select: {
          user: {
            id: false,
            name: false,
            password: false,
          },
          card: {
            id: true,
          },
        },
      });

      if (userCards.length === 0) {
        res.status(204).json({ message: "No cards found for this user." });
        return;
      }

      res.status(200).json(userCards);
    } catch (error) {
      console.error("Error fetching user cards:", error);
      res.status(500).json({ message: "Error fetching user cards.", error });
    }
  }
}
