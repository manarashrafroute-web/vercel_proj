import jwt from "jsonwebtoken"
import { secret, T_secret } from "../config/config.service.js"
import User from "../DB/models/user.model.js"

export const auth = async (req, res, next) => {

    const { authorization } = req.headers

    if (!authorization) {
        throw new Error("token is Required ")
    }

    //authorization = Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Yjg2MGVkNDBmMDVkNTNjYTJlMTNlYyIsImlhdCI6MTc3MzY5MTk1OX0.CIM2mhKmDde7aDzYiXv1UcAo3-j-sfXwcWi2if28sXk
    let token = authorization.split(" ") // array
    // console.log(token); // BERaer [0] , token[1]

    if (token[0] !== secret || !token[1]) {
        throw new Error("invaild token")
    }

    let data = jwt.verify(token[1], T_secret) // paylod // id , iat
    //  console.log(data);

    let user = await User.findById(data.id)
    // console.log(user);

    if (!user) {
        return res.status(404).json({ message: "user Not Found" })
    }

    req.user = user


    next()

}