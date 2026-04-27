import { configDotenv } from "dotenv";
import path from "node:path"

let nodeEnv = process.env.NODE_ENV // 
let envPath = ""

if (nodeEnv == "production") {
    envPath = "./src/config/.env.production"
} else if (nodeEnv == "development") {
    envPath = "./src/config/.env.development"
} else {
    throw new Error("node env not define")
}

configDotenv({ path: path.resolve(envPath) })


export const port = process.env.PORT

export const dbUri = process.env.DB

export const SaltRound = process.env.SALTED_ROUND

export const E_sercet = process.env.ENCRYPTION_SECRET_KEY

export const T_secret = process.env.SECRET_KEY

export const secret = process.env.BEARER_TOKEN

export const client_ID = process.env.CLIENT_ID

export const cLOUD_NAME = process.env.CLOUD_NAME

export const cLOUD_API_KEY = process.env.CLOUDINERY_API_KEY

export const CLOUD_API_SECRET = process.env.CLOUDINERY_API_SECRET