import passport from "passport";
import passportLocal from "passport-local";
import { userModel } from "../models/user.model.js";
import { createHash, isValidPassword } from "../utils.js";
import { PRIVATE_KEY } from "../utils.js";
import GitHubStrategy from "passport-github2";
import jwtStrategy from "passport-jwt";

const localStrategy = passportLocal.Strategy;
const JwtStrategy = jwtStrategy.Strategy;
const ExtractJWT = jwtStrategy.ExtractJwt;

const initializePassport = () => {
  passport.use(
    "jwt",
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: PRIVATE_KEY,
      },
      async (jwt_payload, done) => {
        try {
          return done(null, jwt_payload.user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: "Iv1.9bf11d74a4b1e425",
        clientSecret: "1dafe63d7e9e51608732d7e0ada4ad28d5b86c30",
        callbackUrl: "http://localhost:8080/api/users/githubcallback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await userModel.findOne({
            $or: [
              { email: profile._json.email },
              { username: profile._json.login },
            ],
          });
          if (!user) {
            let newUser = {
              username: profile._json.login,
              email: profile._json.url,
              password: "gitHubUserPass",
              loggedBy: "GitHub",
              type: "user",
            };
            const result = await userModel.create(newUser);
            return done(null, result);
          } else {
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "register",
    new localStrategy(
      { passReqToCallback: true },

      async (req, username, password, done) => {
        const { email } = req.body;
        try {
          const exist = await userModel.findOne({ email: email });
          if (exist) {
            done(null, false);
          }
          const user = {
            username,
            email,
            password: createHash(password),
          };
          const result = await userModel.create(user);
          return done(null, result);
        } catch (error) {
          return done("Registration ERROR " + error);
        }
      }
    )
  );

  passport.use(
    "login",
    new localStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        try {
          const user = await userModel.findOne({ email: username });
          if (!user) {
            return done(null, false);
          }
          if (!isValidPassword(user, password)) {
            return done(null, false);
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      let user = await userModel.findById(id);
      done(null, user);
    } catch (error) {}
  });
};

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["jwtCookieToken"];
  }
  return token;
};

export default initializePassport;
