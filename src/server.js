import express from "express";
import handlebars from "express-handlebars";
import mongoose from "mongoose";
import Handlebars from "handlebars";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import cors from "cors";
import { Server } from "socket.io";

import UserRouter from "./routes/users.router.js";
import ProductsRouter from "./routes/products.router.js";
import CartRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
import emailRouter from "./routes/email.router.js";
import config from "./config/config.js";
import initializePassport from "./config/passport.config.js";
import specs from "./config/swagger.config.js";
import __dirname from "./utils.js";
import { allowInsecurePrototypeAccess } from "@handlebars/allow-prototype-access";
import { addLogger } from "./middlewares/logger.middleware.js";
import swaggerUi from "swagger-ui-express";

const app = express();

const PORT = config.port;
const httpServer = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const mongoDBConnection = mongoose
  .connect(
    `mongodb+srv://rubendns:UZLxn4iAGvcRngUY@cluster0.6lu3kn4.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("MongoDB Atlas connected!");
  })
  .catch((error) => {
    console.error("MongoDB Atlas connection error:", error);
  });

mongoDBConnection;

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: `mongodb+srv://rubendns:UZLxn4iAGvcRngUY@cluster0.6lu3kn4.mongodb.net/?retryWrites=true&w=majority`,
    }),
    mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
    ttl: 60000,
    secret: "c0d1g0",
    resave: false,
    saveUninitialized: true,
  })
);

const io = new Server(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine(
  "hbs",
  handlebars.engine({
    extname: ".hbs",
    defaultLayout: "main",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
  })
);
app.set("view engine", "hbs");
app.set("views", `${__dirname}/views`);
app.use(express.static(`${__dirname}/public`));

app.use(cookieParser("CoderS3cr3tC0d3"));

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use(addLogger);
app.get("/loggerTest", (req, res) => {
  if (config.enviroment === "DEV") {
    console.log("Correct log test from Debug level in Development Mode");
    res.send("PRUEBA DE LOGGER EXITOSA!");
  } else {
    console.log("Correct log test from Info level in Production Mode");
    res.send("PRUEBA DE LOGGER EXITOSA!");
  }
});

app.use("/", viewsRouter);

const userRouter = new UserRouter();
const productsRouter = new ProductsRouter();
const cartsRouter = new CartRouter();

app.use("/api/users", userRouter.getRouter());
app.use("/api/products", productsRouter.getRouter());
app.use("/api/carts", cartsRouter.getRouter());
app.use("/api/email", emailRouter);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs));
app.get("/failure", (req, res) => {
  res.status(404).send("Error: Page not found");
});
