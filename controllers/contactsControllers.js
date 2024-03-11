import Contact from "../models/contacts.js";
import createContactSchema, {
   updateContactSchema,
} from "../schemas/contactsSchemas.js";

export const getAllContacts = async (req, res, next) => {
   try {
      const contacts = await Contact.find({ owner: req.user.id });
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

      if (contact.owner.toString() !== req.user.id) {
         return res.status(404).send("Contact not found");
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
      }

      if (contact.owner.toString() !== req.user.id) {
         return res.status(404).send("Contact not found");
      } else {
         res.status(200).send(contact);
      }
   } catch (error) {
      res.status(500).send({ message: "Server error" });
   }
};

export const createContact = async (req, res, next) => {
   const { name, email, phone } = req.body;
   const owner = req.user.id;

   const { value, error } = createContactSchema.validate(req.body, { owner });
   if (typeof error !== "undefined") {
      return res.status(400).send("validation error");
   }
   try {
      const contact = await Contact.create({ ...req.body, owner });
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

   if (contact.owner.toString() !== req.user.id) {
      return res.status(404).send("Contact not found");
   }
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
      if (statusContact.owner.toString() !== req.user.id) {
         return res.status(404).send("Contact not found");
      }
      res.status(200).send(statusContact);
   } catch (error) {
      next(error);
   }
};
