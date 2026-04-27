import { compareSync, hashSync } from "bcrypt"
import User from "../../../DB/models/user.model.js"
import CryptoJS from "crypto-js"
import { isValidObjectId } from "mongoose"
import { client_ID, E_sercet, T_secret } from "../../../config/config.service.js"
import jwt from "jsonwebtoken"
import { OAuth2Client } from "google-auth-library"
import cloudinary from "../../../utils/cloudinery.js"




/**
 * create
 * save
 * insertMany
 */


// plain text = "1232425462" 
// secret key = "425262776" ,
//chipher text = "68yrwu nw thuwwhtwhjijkf"


export const RegistertionServices = async (data, file) => {

    // email not exists 
    const isEmailExists = await User.findOne({
        email: data.email // req.body.email
    })

    if (isEmailExists) return "emailExists"



    // // hashing
    // const hashPassword = hashSync(data.password, 10)
    //encrption 

    const ecryptPhoneNumber = CryptoJS.AES.encrypt(data.phone, E_sercet).toString()
    console.log(ecryptPhoneNumber);


    const userData = {
        name: data.name,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: ecryptPhoneNumber,
        age: data.age,
        gender: data.gender,
        isActive: data.isActive,
        image: data.image
    }

    const user = await User.insertOne({
        name: data.name,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: ecryptPhoneNumber,
        age: data.age,
        gender: data.gender,
        isActive: data.isActive,
        image: data.image
    });
    // const user = new User(userData)

    // console.log(user);

    if (file) {
        let { public_id, secure_url } = await cloudinary.uploader.upload(file.path, {
            folder: `users/${user._id}/profileImage`,
            resource_type: "image", // conttrol type,
        })


        user.profileImage = {
            public_id, secure_url
        }

        await user.save()
    }
    const { password, phone, ...safeUser } = user.toObject()

    return {
        ...safeUser,
        _id: user._id
    }


}


export const RemoveProfileImageServices = async (req) => { // user id
    // const user
    const { profileImage } = await User.findOne({ _id: req.user._id }).select("profileImage -_id")
    //console.log(user);
    console.log(profileImage);
    // remove from cloudinary 
    let data = await cloudinary.uploader.destroy(profileImage.public_id)
    console.log(data);

    await User.findOneAndUpdate({ _id: req.user.id }, { $set: { profileImage: {} } }, { new: true })

    return data

}



export const LoginServices = async (data) => {

    // email ,password
    const user = await User.findOne({
        email: data.email // req.body.email
    })

    console.log(user);


    if (!user) return "userNotFound"

    const comperPassword = compareSync(data.password, user.password)

    if (!comperPassword) return "wrongCredantial"

    return {
        message: "user Loged in",
        token: jwt.sign({ id: user._id }, T_secret, { expiresIn: '7d' })
    }

    // token


}


async function verifyGoogleAccount({ idToken }) {
    const client = new OAuth2Client()
    const ticket = await client.verifyIdToken({
        idToken,
        audience: client_ID, // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    // The 'payload' contains verified user information like email, name, picture, etc.
    return payload;
}


export const GoogleSignupServices = async (googleData) => {
    try {
        const { idToken } = googleData;
        console.log({ idToken });

        const payload = await verifyGoogleAccount({ idToken });
        console.log({ payload });

        if (!payload.email_verified) {
            return { error: "EmailIsNotVerified" };
        }

        const existingUser = await User.findOne({
            email: payload.email
        });

        console.log({ existingUser });
        if (existingUser) return { error: "userAlreadyExists" };

        const existingGoogleId = await User.findOne({ googleId: payload.sub });
        console.log("Existing googleId found:", existingGoogleId ? "YES" : "NO");

        if (existingGoogleId) {
            console.log("Google ID already exists, returning");
            return { error: "GoogleIdAlreadyExists" };
        }
        // Prepare user data
        const userData = {
            name: payload.given_name || payload.name?.split(' ')[0] || 'User',
            lastName: payload.family_name || '',
            email: payload.email,
            googleId: payload.sub,
            isGoogleAuth: true,
            isActive: true,
            isConfirmed: true,
            phone: null,  // Explicitly set to null
            // Don't include password at all
        };

        console.log("Attempting to create user with data:", JSON.stringify(userData, null, 2));

        const newUser = await User.create(userData);
        console.log("User created successfully:", newUser._id);

        return {
            success: true,
            message: "User created successfully",
            user: newUser
        };

    } catch (error) {
        return { message: error.message, stack: error.stack }
    }

}


export async function loginWithGoogle(googleData) {
    const { idToken } = googleData;
    if (!idToken) {
        return "idTokenisrequired";
    }
    const payload = await verifyGoogleAccount({ idToken });

    if (!payload.email_verified) {
        return "EmailIsNotVerified";
    }

    const user = await User.findOne({
        email: payload.email
    });
    if (!user) {
        return GoogleSignupServices(googleData);
    }



    return {
        message: "user Loged in",
        token: jwt.sign({ id: user._id }, T_secret, { expiresIn: '7d' })
    }
}


export const UpdateUserServices = async (userId, updateData) => {

    const user = await User.findById(userId);
    if (!user) return "userNotFound"

    const notUpdateData = ["_id", "password", "phone"]

    notUpdateData.forEach(field => {
        delete updateData[field]
    })

    console.log(updateData);


    if (updateData.email && updateData.email !== user.email) { // 
        const existingUser = await User.findOne({ email: updateData.email })
        if (existingUser) return "emailExists"
    }

    const updateUser = await User.findByIdAndUpdate(userId, {
        $set: updateData
    }, { new: true }).select("-password -phone")


    return updateUser

}




export const DeleteUserServices = async (userId) => {
    // const user = await User.findById(userId);
    // if (!user) return "userNotFound"

    // hard delete 
    //const deletUser = await User.findByIdAndDelete(userId)
    const deletUser = await User.findById({ _id: userId })
    if (deletUser) {
        await cloudinary.api.delete_resources_by_prefix(`users/${deletUser.id}/profileImage`)

        await cloudinary.api.delete_folder(`users/${deletUser.id}`).catch((err) => {
            console.log(err);
            console.log(err.message);
        })
    }
    // // soft delete 
    // const deletUser = await User.findByIdAndUpdate(userId, {
    //     $set: {
    //         isDeleted: true,
    //         deletedAt: new Date()
    //     }
    // }, { new: true })

    return {
        message: "deleted ",
        userId: deletUser._id
    }

}




export const ListUsersServices = async () => {

    const users = await User.find().select("name email age -_id").lean() // 

    return users


}


export const GetUserByIdServices = async (userId) => {

    if (!isValidObjectId(userId)) return "invalidId"

    const user = await User.findById(userId).select("name email phone -_id").lean()

    if (user?.phone) {
        const decryption = CryptoJS.AES.decrypt(user.phone, E_sercet)
        user.phone = decryption.toString(CryptoJS.enc.Utf8)

    }

    if (!user) return "userNotFound"


    return user


}



