import express from "express";
import cors from "cors";
import { AppDataSource } from "./db";
import { CardsController } from "./controllers/CardsController";
import { UserController } from "./controllers/UserController";
import { FormsController } from "./controllers/FormsController";

const app = express();
const cardsController = new CardsController();
const userController = new UserController();
const formsController = new FormsController();

app.use(cors());
app.use(express.json());

app.get("/cards", cardsController.list.bind(cardsController));
app.get("/cards/ids", cardsController.listWithId.bind(cardsController));

app.post("/users", userController.create.bind(userController));
app.get("/users/:id", userController.getUser.bind(userController));
app.post(
  "/user-cards",
  userController.addCardsWithQuantities.bind(userController)
);
app.get(
  "/user-cards/:userId/cards",
  userController.getUserCards.bind(userController)
);
app.post(
  "/user-cards/:userId/cards",
  userController.updateCardQuantity.bind(userController)
);
app.get(
  "/user-cards/:userId/cartitemcount",
  userController.getUserCartItemCount.bind(userController)
);
app.get(
  "/user-cards/:userId/cardsid",
  userController.getCardsIdBasedOnTheUser.bind(userController)
);

app.post("/forms", formsController.create.bind(formsController));
app.get("/forms", formsController.list.bind(formsController));
app.get(
  "/forms/user/:userId",
  formsController.listByUser.bind(formsController)
);

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(3000, () => {
      console.log("Server is running on http://177.44.248.4:3001/");
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });
