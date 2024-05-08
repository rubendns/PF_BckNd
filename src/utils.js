import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (user, password) => {
  return bcrypt.compareSync(password, user.password);
};

export const comparePasswords = (userInputPassword, storedHash) => {
  return bcrypt.compareSync(userInputPassword, storedHash);
};

export const PRIVATE_KEY = "SecretKeyJWT";

export const generateJWToken = (user) => {
  return jwt.sign({ user }, PRIVATE_KEY, { expiresIn: "1h" });
};

export const authToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res
      .status(401)
      .send({ error: "User not authenticated or missing token." });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, PRIVATE_KEY, (error, credentials) => {
    if (error)
      return res.status(403).send({ error: "Token invalid, Unauthorized!" });
    req.user = credentials.user;
    next();
  });
};

export const passportCall = (strategy) => {
  return async (req, res, next) => {
    passport.authenticate(strategy, function (err, user, info) {
      if (err) return next(err);
      if (!user) {
        return res
          .status(401)
          .send({ error: info.messages ? info.messages : info.toString() });
      }
      req.user = user;
      next();
    })(req, res, next);
  };
};

export const authorization = (role) => {
  return async (req, res, next) => {
    if (!req.user)
      return res.status(401).send("Unauthorized: User not found in JWT");

    if (req.user.role !== role) {
      return res
        .status(403)
        .send("Forbidden: The user does not have permissions with this role.");
    }
    next();
  };
};

export const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  auth: {
    user: "rubendns@gmail.com",
    pass: "moualmufpperpiab",
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Correct connection with the mail server!");
  }
});

export default __dirname;
