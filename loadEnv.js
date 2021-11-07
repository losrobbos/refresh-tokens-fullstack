import dotenv from 'dotenv'

dotenv.config() // load .env into process.env

const config = {
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_SECRET_REFRESH: process.env.JWT_SECRET_REFRESH,
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN
}

console.log("CONFIG loaded: ", config)

export default config