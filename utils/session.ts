import withIronSession from 'next-iron-session'
import password from "../password";

export default function withSession(handler) {
  return withIronSession(handler, {
    password,
    cookieOptions: {
      // the next line allows to use the session in non-https environements like
      // Next.js dev mode (http://localhost:3000)
      secure: process.env.NODE_ENV === 'production' ? true : false,
    },
  })
};