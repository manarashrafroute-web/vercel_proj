import Note from "../../../DB/models/note.model.js"
import User from "../../../DB/models/user.model.js";

export const CreateNoteServices = async (noteData, user) => {
    try {


       // return note;
    } catch (error) {
        throw new Error(`Failed to create note: ${error.message}`);
    }
}
