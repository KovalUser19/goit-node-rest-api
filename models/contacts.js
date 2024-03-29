/* import mongoose from "mongoose"; */
import mongoose, { Schema } from "mongoose";

const ContactShema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, "Set name for contact"],
   },
   email: {
      type: String,
   },
   phone: {
      type: String,
   },
   favorite: {
      type: Boolean,
      default: false,
   },
   owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
   },
});

export default mongoose.model("Contact", ContactShema);
