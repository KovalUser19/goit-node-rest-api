import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";

import contactsRouter from "./routes/contactsRouter.js";
import router from "./routes/usersRouter.js";
import auth from "./middleware/auth.js";

import "./db.js";

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.use("/api/contacts", auth, contactsRouter);

app.use("/users", router);
app.use(express.static("public/avatars"));

app.use((_, res) => {
   res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
   const { status = 500, message = "Server error" } = err;
   res.status(status).json({ message });
});

app.listen(3000, () => {
   console.log("Server is running. Use our API on port: 3000");
});
