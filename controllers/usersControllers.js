/* import bcrypt from "bcrypt"; */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/users.js";
import { userSchema } from "../schemas/contactsSchemas.js";

export const register = async (req, res, next) => {
   const { email, password, subscription } = req.body;
   const normalizedEmail = email.toLowerCase();

   const { value, error } = userSchema.validate(req.body);
   if (typeof error !== "undefined") {
      return res.status(400).send("validation error");
   }

   try {
      const user = await User.findOne({ email: normalizedEmail });

      if (user !== null) {
         return res.status(409).send({ message: "Email in use" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const userCreate = await User.create({
         email: normalizedEmail,
         password: passwordHash,
         subscription: subscription,
      });

      res.status(201).send({
         user: {
            email: normalizedEmail,
            subscription: user.subscription,
         },
      });
   } catch (error) {
      next(error);
   }
};

export const login = async (req, res, next) => {
   const { email, password } = req.body;
   const normalizedEmail = email.toLowerCase();

   const { value, error } = userSchema.validate(req.body);
   if (typeof error !== "undefined") {
      return res.status(400).send("validation error");
   }

   try {
      const user = await User.findOne({ email: normalizedEmail });
      if (user === null) {
         return res.status(401).send({ message: "Email or password is wrong" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      console.log(user.password);

      if (isMatch === false) {
         return res.status(401).send({ message: " wrong" });
      }
      const token = jwt.sign(
         {
            id: user._id,
            email: user.email,
         },
         process.env.JWT_SECRET,
         { expiresIn: "7d" }
      );

      await User.findByIdAndUpdate(user._id, { token });

      res.status(200).send({
         token,
         user: {
            email: user.email,
            subscription: user.subscription,
         },
      });
   } catch (error) {
      next(error);
   }
};

export const logout = async (req, res, next) => {
   try {
      await User.findByIdAndUpdate(req.user.id, { token: null });
      res.status(204).end();
   } catch (error) {
      next(error);
   }
};

export const current = async (req, res, next) => {
   try {
      const user = await User.findById(req.user.id);
      if (!user) {
         return res.status(401).send({ message: "Not authorized" });
      }
      res.status(200).send({
         email: user.email,
         subscription: user.subscription,
      });
   } catch (error) {
      next(error);
   }
};
