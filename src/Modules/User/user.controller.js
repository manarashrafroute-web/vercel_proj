import { Router } from "express";
import * as userSrvices from "./services/user.services.js";
import { auth } from "../../middleWares/authMiddellware.js";
import { extinstions, multer_cloud, multerLocal } from "../../middleWares/multerMiddleware.js";
import cloudinary from "../../utils/cloudinery.js";
import User from "../../DB/models/user.model.js";


const userController = Router()



userController.post("/cloudinery", auth, multer_cloud({ allowedType: extinstions.image }).single("image"), async (req, res) => {

    let data = await cloudinary.uploader.upload(req.file.path, {
        //  public_id: `profilePicture`,
        folder: `users/${req.user._id}/profile`,
        resource_type: "image", // conttrol type,
        //allowed_formats : ["jpeg"], // format image,
        use_filename: true,
        unique_filename: false,
        //transformation: [{ width: 500, height: 600, crop: "fill" }] // edit photo,
        eager: [
            { width: 300, height: 300, crop: "fill" },
            { width: 500, height: 600, crop: "fill" },
            { width: 900, height: 900, crop: "fill" }
        ]
    })
    // let baseUrl = `${req.protocol}://${req.host}/`
    // req.file.finalPath = `${baseUrl}${req.file.destination}/${req.file.filename}` // to get the file path
    return res.status(200).json({ message: "done", data })

})

userController.post("/cloudinery/video", auth, multer_cloud({ allowedType: extinstions.vedio }).single("image"), async (req, res) => {

    let data = await cloudinary.uploader.upload(req.file.path, {
        folder: `users/${req.user._id}/video`,
        resource_type: "video", // conttrol type,
    })

    return res.status(200).json({ message: "done", data })

})



userController.post("/single", multerLocal({
    customPath: "profile-Images/usres", allowedType: extinstions.image //extinstions.image [...extinstions.image, ...extinstions.pdf] 
})
    .single("image"), async (req, res) => {
        let baseUrl = `${req.protocol}://${req.host}/`
        req.file.finalPath = `${baseUrl}${req.file.destination}/${req.file.filename}` // to get the file path
        return res.status(200).json({ message: "done", file: req.file, body: req.body })

    })


userController.post("/array", multerLocal({ customPath: "array" }).array("image", 2), async (req, res) => {

    console.log(req.host);
    console.log(req.hostname);
    console.log(req.protocol);

    let baseUrl = `${req.protocol}://${req.host}/`

    return res.status(200).json({
        message: "done",
        files: req.files.map((file) => {
            file.finalPath = `${baseUrl}${file.destination}/${file.filename}`
            return file
        }),
        body: req.body
    })

})


userController.post("/fields", multerLocal({ customPath: "fields" }).fields([
    { name: "profile", maxCount: 1 },
    { name: "cover", maxCount: 2 },
    { name: "cv", maxCount: 1 }
]),
    async (req, res) => {


        let baseUrl = `${req.protocol}://${req.host}/`

        let fields = ["profile", "cover", "cv"]

        for (let i = 0; i < fields.length; i++) {
            req.files[fields[i]] = req.files[fields[i]].map((file) => {
                file.finalPath = `${baseUrl}${file.destination}/${file.filename}`
                return file
            })
        }

        return res.status(200).json({
            message: "done",
            files: req.files
        })

    })

userController.post("/any", multerLocal({ customPath: "any" }).any(), async (req, res) => {
    return res.status(200).json({
        message: "done",
        files: req.files
    })

})

userController.post("/none", multerLocal().none(), async (req, res) => {
    return res.status(200).json({
        message: "done",
        body: req.body
    })

})

userController.post("/signup", multer_cloud({ allowedType: extinstions.image }).single("image"), async (req, res) => {

    const data = await userSrvices.RegistertionServices(req.body, req.file)

    if (data === "emailExists") {
        return res.status(409).json({ message: "user already exists" })
    }

    return res.status(200).json({ message: "user Created successflly ", user: data })

})


userController.post("/Login", async (req, res) => {

    const data = await userSrvices.LoginServices(req.body) // email , password

    if (data === "userNotFound") {
        return res.status(404).json({ message: "user Not Found" })
    }

    if (data === "wrongCredantial") {
        return res.status(404).json({ message: "email  or password wrong" })
    }

    return res.status(200).json({ message: "user login successflly ", user: data })

})


userController.post("/signup/gmail", async (req, res) => {

    const data = await userSrvices.GoogleSignupServices(req.body)

    if (data === "EmailIsNotVerified") {
        return res.status(409).json({ message: "email not verified" })
    }


    if (data === "userAlreadyExists") {
        return res.status(409).json({ message: "user already exists" })
    }

    return res.status(200).json({ message: "user Created successflly " })

})


userController.delete("/remove-profile-image", auth, async (req, res) => {

    const data = await userSrvices.RemoveProfileImageServices(req)

    return res.status(200).json({ message: "image removed", data })

})


userController.post("/add-profile-image", auth, multer_cloud({ allowedType: extinstions.image }).single("image"), async (req, res) => {

    const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
        folder: `users/${req.user._id}/profileImage`
    })

    await User.findOneAndUpdate({ _id: req.user.id }, { $set: { profileImage: { public_id, secure_url } } }, { new: true })


    return res.status(200).json({ message: "image addeedd " })

})


userController.post("/login/gmail", async (req, res) => {

    const data = await userSrvices.loginWithGoogle(req.body)

    if (data === "idTokenisrequired") {
        return res.status(409).json({ message: "idToken is required" })
    }

    if (data === "EmailIsNotVerified") {
        return res.status(409).json({ message: "Google account email not verified" })
    }

    return res.status(200).json({ message: "user Loged in successflly " })

})



userController.put("/update", auth, async (req, res) => {

    const data = await userSrvices.UpdateUserServices(req.user._id, req.body)


    if (data === "userNotFound") {
        return res.status(404).json({ message: "user Not Found" })
    }

    if (data === "emailExists") {
        return res.status(409).json({ message: "user already exists" })
    }

    return res.status(200).json({ message: "user Updtaed successflly ", updateUser: data })

})


userController.delete("/delete", auth, async (req, res) => {
    const data = await userSrvices.DeleteUserServices(req.user._id)
    if (data === "userNotFound") {
        return res.status(404).json({ message: "user Not Found" })
    }

    return res.status(200).json({ message: "user deleted successflly ", data })

});


userController.get("/", async (req, res) => {

    const result = await userSrvices.ListUsersServices()


    return res.status(200).json({ message: "users", users: result })
})



userController.get("/getUserById/:id", async (req, res) => {


    const data = await userSrvices.GetUserByIdServices(req.params.id)


    if (data === "invalidId") {
        return res.status(422).json({ message: "invalid user id" })
    }

    if (data === "userNotFound") {
        return res.status(404).json({ message: "user Not Found" })
    }

    return res.status(200).json({ message: "user", user: data })


})




export default userController
