import { Router } from "express";
import * as noteServices from "./services/Note.services.js";
import { auth } from "../../middleWares/authMiddellware.js";

const noteController = Router();

noteController.post("/create-note", auth, async (req, res) => {
    console.log("success");
    

});

export default noteController;