import * as fs from "node:fs/promises";
import * as path from "node:path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/users.js";
import { userSchema } from "../schemas/contactsSchemas.js";
import gravatar from "gravatar";
import Jimp from "jimp";
import nodemailer from "nodemailer";
import { nanoid } from "nanoid";

const transport = nodemailer.createTransport({
   host: "sandbox.smtp.mailtrap.io",
   port: 2525,
   auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASSWORD,
   },
});

export const register = async (req, res, next) => {
   const { email, password, subscription } = req.body;
   const normalizedEmail = email.toLowerCase();

   const { value, error } = userSchema.validate(req.body);
   if (typeof error !== "undefined") {
      console.log(error);
      return res.status(400).send("validation error");
   }

   try {
      const user = await User.findOne({ email: normalizedEmail });

      if (user !== null) {
         return res.status(409).send({ message: "Email in use" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const verifyToken = nanoid();

      await transport.sendMail({
         to: email,
         from: "koval19101975@gmail.com",
         subject: "Welcome to your contacts",
         html: `To confirm you registration please click on the <a href="http://localhost:3000/users/verify/${verifyToken}">link</a>`,
         text: `To confirm you registration please open the link http://localhost:3000/users/verify/${verifyToken}`,
      });
      const avatarURL = await getDefaultAvatarURL(normalizedEmail);
      const userCreate = await User.create({
         email: normalizedEmail,
         password: passwordHash,
         subscription: subscription,
         avatarURL: avatarURL,
         verificationToken: verifyToken,
      });

      res.status(201).send({
         user: {
            email: normalizedEmail,
            subscription: "starter",
         },
      });
   } catch (error) {
      next(error);
   }
};

export const getDefaultAvatarURL = async (email) => {
   try {
      const url = gravatar.url(email);
      return url;
   } catch (error) {
      console.error("Error generating default avatar URL:", error.message);
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
         return res.status(401).send({ message: "Wrong" });
      }

      if (user.verify === false) {
         return res
            .status(401)
            .send({ message: "Your account is not verified" });
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
export const getAvatar = async (req, res, next) => {
   try {
      const user = await User.findById(req.user.id);
      if (user === null) {
         return res.status(404).send({ message: "User not found" });
      }
      if (user.avatarURL === null) {
         return res.status(404).send({ message: "Avatar not found" });
      }
      res.sendFile(path.join(process.cwd(), "public/avatars", user.avatarURL));
   } catch (error) {
      next(error);
   }
};

export const uploadAvatar = async (req, res, next) => {
   try {
      Jimp.read(req.file.path, (err, image) => {
         if (err) throw err;
         image
            .resize(250, 250)
            .write(
               path.join(process.cwd(), "public/avatars", req.file.filename) +
                  "small.jpg"
            );
      });

      const user = await User.findByIdAndUpdate(
         req.user.id,
         { avatarURL: req.file.filename },
         { new: true }
      );
      if (user === null) {
         return res.status(404).send({ message: "User not found" });
      }
      res.send(user);
   } catch (error) {
      next(error);
   }
};

export const verifyEmail = async (req, res, next) => {
   const { verificationToken } = req.params;

   try {
      const user = await User.findOne({ verificationToken: verificationToken });

      if (user === null) {
         return res.status(404).send({ message: "Not found" });
      }

      await User.findByIdAndUpdate(user._id, {
         verify: true,
         verificationToken: null,
      });
      res.send({ message: "Email confirm successfully" });
   } catch (error) {
      next(error);
   }
};

export const resendVerify = async (req, res, next) => {
   const { email } = req.body;
   try {
      const user = await User.findOne({ email: email });

      if (user === null) {
         return res.status(404).send({ message: "User not found" });
      }

      if (user.verify) {
         return res.status(401).send({ message: "Your account verif" });
      }

      await transport.sendMail({
         to: email,
         from: "koval19101975@gmail.com",
         subject: "Welcome to your contacts",
         html: `To confirm you registration please click on the <a href="http://localhost:3000/users/verify/${user.verificationToken}">link</a>`,
         text: `To confirm you registration please open the link http://localhost:3000/users/verify/${user.verificationToken}`,
      });
      res.status(200).send({ message: "Verification email sent" });
   } catch (error) {
      next(error);
   }
};
