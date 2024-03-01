import Contact from "../models/contacts.js";
import createContactSchema, {
   updateContactSchema,
} from "../schemas/contactsSchemas.js";

export const getAllContacts = async (reg, res, next) => {
   try {
      const contacts = await Contact.find();
      res.send(contacts);
   } catch (error) {
      next(error);
   }
};

export const getOneContact = async (req, res) => {
   const { id } = req.params;
   try {
      const contact = await Contact.findById(id);
      if (contact === null) {
         return res.status(404).send({ message: "Contact not found" });
      }
      res.send(contact);
   } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Server error" });
   }
};

export const deleteContact = async (req, res) => {
   const { id } = req.params;
   try {
      const contact = await Contact.findByIdAndDelete(id);
      if (contact === null) {
         res.status(404).send({ message: "Not found" });
      } else {
         res.status(200).send(contact);
      }
   } catch (error) {
      res.status(500).send({ message: "Server error" });
   }
};

export const createContact = async (req, res, next) => {
   const { name, email, phone } = req.body;
   console.log(req.body);
   const { value, error } = createContactSchema.validate(req.body);
   if (typeof error !== "undefined") {
      return res.status(400).send("validation error");
   }
   try {
      const contact = await Contact.create(req.body);
      res.status(201).send(contact);
   } catch (error) {
      next(error);
   }
};

export const updateContact = async (req, res) => {
   const { id } = req.params;
   const { name, email, phone } = req.body;
   if (!name && !email && !phone) {
      return res.status(400).send("Body must have at least one field");
   }
   const { value, error } = updateContactSchema.validate(req.body);
   if (typeof error !== "undefined") {
      return res.status(400).send("Validation error");
   }
   if (!(await Contact.findByIdAndUpdate(id, req.body, { new: true }))) {
      return res.status(404).send("Not found");
   }
   const contact = await Contact.findByIdAndUpdate(id, req.body, { new: true });
   res.status(200).send(contact);
};

export const updateStatusContact = async (req, res, next) => {
   const { id } = req.params;
   const { favorite } = req.body;

   if (!(await Contact.findById(id))) {
      res.status(404).send("Not found");
   }
   try {
      const statusContact = await Contact.findByIdAndUpdate(id, req.body, {
         new: true,
      });
      res.status(200).send(statusContact);
   } catch (error) {
      next(error);
   }
};
