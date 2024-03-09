import jwt from "jsonwebtoken";
import { decode } from "punycode";
import User from "../models/users.js";

function auth(req, res, next) {
   const authHeader = req.headers.authorization;

   if (typeof authHeader === "undefined") {
      return res.status(401).send({ message: "Not authorized" });
   }

   const [bearer, token] = authHeader.split(" ", 2);

   if (bearer !== "Bearer") {
      return res.status(401).send({ message: "Not authorized" });
   }

   jwt.verify(token, process.env.JWT_SECRET, async (err, decode) => {
      if (err) {
         if (err.name === "TokenExpiredError") {
            return res.status(401).send({ message: "Token expired" });
         }

         return res.status(401).send({ message: "Not authorized" });
      }
      try {
         const user = await User.findById(decode.id);
         if (user === null) {
            return res.status(401).send({ message: "Not authorized" });
         }

         if (user.token !== token) {
            return res.status(401).send({ message: "Not authorized" });
         }

         req.user = {
            id: decode.id,
            email: decode.email,
         };
         next();
      } catch (error) {
         return res.status(500).send({ message: "Server error" });
      }
   });
}

export default auth;
