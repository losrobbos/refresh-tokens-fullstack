import jwt from "jsonwebtoken"

export const JWT_TOKEN = { key: 'token', secret: process.env.JWT_SECRET, expiry: '1m' }
export const JWT_REFRESH = { key: 'refresh_token', secret: process.env.JWT_SECRET_REFRESH, expiry: '2m' }

/**
 * Generate a pair of ACCESS TOKEN + REFRESH TOKEN
 * => access token - short lived token for accessing protected data
 * => refresh token - long lived token for refreshing an ACTIVE session
 * 
 * A refresh token allows people to stay logged in when still being ACTIVE in the app
 * (so when "clicking around")
 *
 * For people NOT being active in the app anymore, their session will expire once
 * their auth token + refresh token expired 
 * (for security reasons, so an attacker has not much time sniffing the refresh token)
 */
export const generateTokenPair = (user, res) => {
  // create a "visitor card" (= so we will recognise you the next time!)
  const token = jwt.sign(
    { _id: user._id }, JWT_TOKEN.secret, { expiresIn: JWT_TOKEN.expiry } 
  )
  const refreshToken = jwt.sign(
    { _id: user._id }, JWT_REFRESH.secret, { expiresIn: JWT_REFRESH.expiry } 
  )

  // pin the visitor card to your dress (=attach cookie)
  res.setHeader(JWT_TOKEN.key, token)
  res.setHeader(JWT_REFRESH.key, refreshToken)

  return { token, refreshToken }
}
