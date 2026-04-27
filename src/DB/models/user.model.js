import { hashSync } from "bcrypt";
import mongoose from "mongoose";
import CryptoJS from "crypto-js"
import { SaltRound } from "../../config/config.service.js";


// name , email , password , phone , age , gender , isActive 
const userSchema = new mongoose.Schema({
    name: { // manar  >>> Manar 
        type: String,
        require: true,
        trim: true,
        minlenght: [3, "must greater than three"],
        maxlenght: [50, "<50"],
        set: function (value) {
            //  // manar  >>> Manar
            return value.trim().charAt(0).toUpperCase() + value.slice(1).toLowerCase()
        }
    },
    lastName: { type: String, default: '' },
    googleId: {
        type: String,
        required: false,
        unique: true,
        sparse: true,  // ✅ Add this - allows multiple null values
        default: null
    },
    email: {
        type: String,
        require: true,
        index: {
            name: "idx_email_unique",
            unique: true
        },

        set: value => value.toLowerCase(),
        get: value => value.toUpperCase()
    },
    phone: {
        type: String,
        require: false,
        unique: true
    },
    password: {
        type: String,
        require: false,
        minlenght: [6, "must greater than three"],
        maxlenght: [50, "<50"],
        // set : value => hashSync(value, 10)
    },
    age: {
        type: Number,
        min: 18,
        max: 60
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        default: "male"
    },
    isGoogleAuth: { type: Boolean, default: false },
    isActive: {
        type: Boolean,
        default: true
    },
    isConfirmed: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    },
    image: {
        type: String
    },
    profileImage: {
        public_id: String,
        secure_url: String
    }
}, {
    timestamps: true,
    toJSON: {
        getters: true,
        virtuals: true
    },
    toObject: {
        getters: true,
        virtuals: true
    }
})


userSchema.virtual('fullName').get(function () {
    return this.name + "  " + this.lastName
})



userSchema.pre("save", async function () {
    // update , regester
    if (!this.isModified("password")) return;
    this.password = await hashSync(this.password, parseInt(SaltRound))

})




const User = mongoose.model("User", userSchema)

export default User;