import { Request, Response } from "express";
import { AppDataSource } from "../db";
import { Card } from "../models/Card";
import { In } from "typeorm";

export class CardsController {
  private cardRepository = AppDataSource.getRepository(Card);

  async list(req: Request, res: Response) {
    const cards = await this.cardRepository.find({
      order: {
        id: "ASC",
      },
    });
    res.status(200).json(cards);
    return;
  }

  async listWithId(req: Request, res: Response) {
    const ids = req.query.ids;

    console.log(ids);

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: "Please provide an array of IDs." });
      return;
    }

    const idArray = ids.map((id) => Number(id)).filter(Boolean);

    if (idArray.length === 0) {
      res.status(400).json({ message: "Please provide valid IDs." });
      return;
    }

    try {
      const cards = await this.cardRepository.find({
        where: {
          id: In(idArray),
        },
      });

      res.status(200).json(cards);
    } catch (error) {
      res.status(500).json({ message: "Error fetching cards", error });
    }
  }
}
