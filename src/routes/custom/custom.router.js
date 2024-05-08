import { Router } from "express";
import jwt from "jsonwebtoken";
import { PRIVATE_KEY } from "../../utils.js";

export default class CustomRouter {
  constructor() {
    this.router = Router();
    this.init();
  }

  getRouter() {
    return this.router;
  }

  init() {}

  get(path, policies, ...callbacks) {
    this.router.get(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponses,
      this.#applyCallbacks(callbacks)
    );
  }

  post(path, policies, ...callbacks) {
    this.router.post(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponses,
      this.#applyCallbacks(callbacks)
    );
  }

  put(path, policies, ...callbacks) {
    this.router.put(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponses,
      this.#applyCallbacks(callbacks)
    );
  }

  delete(path, policies, ...callbacks) {
    this.router.delete(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponses,
      this.#applyCallbacks(callbacks)
    );
  }

  handlePolicies = (policies) => (req, res, next) => {
    if (policies[0] === "PUBLIC") return next();
    const authHeader = req.cookies;

    if (!authHeader) {
      return res
        .status(401)
        .send({ error: "User not authenticated or missing token." });
    }
    const token = authHeader["jwtCookieToken"];

    jwt.verify(token, PRIVATE_KEY, (error, credential) => {
      if (error)
        return res.status(403).send({ error: "Token invalid, Unauthorized!" });
      const user = credential.user;
      if (!policies.includes(user.type.toUpperCase()))
        return res
          .status(403)
          .send({
            error: "El usuario no tiene privilegios, revisa tus roles!",
          });
      next();
    });
  };

  generateCustomResponses = (req, res, next) => {
    res.sendSuccess = (payload) =>
      res.status(200).send({ status: "Success", payload });
    res.sendInternalServerError = (error) =>
      res.status(500).send({ status: "Error", error });
    res.sendClientError = (error) =>
      res
        .status(400)
        .send({ status: "Client Error, Bad request from client.", error });
    res.sendUnauthorizedError = (error) =>
      res
        .status(401)
        .send({ error: "User not authenticated or missing token." });
    res.sendForbiddenError = (error) =>
      res
        .status(403)
        .send({
          error:
            "Token invalid or user with no access, Unauthorized please check your roles!",
        });
    next();
  };

  #applyCallbacks(callbacks) {
    return callbacks.map((callback) => async (...item) => {
      try {
        await callback.apply(this, item);
      } catch (error) {
        item[1].status(500).send(error);
      }
    });
  }
}
