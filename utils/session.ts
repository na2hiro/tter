import withIronSession from 'next-iron-session'
import password from "../password";
import { getUsersCollection } from './mongo';
import { IncomingMessage, ServerResponse } from 'http';

type Session = {
  get(name: string): any;
  set(name: string, value: string): void;
  save(): Promise<void>;
}
type Context = {
  req: IncomingMessage & { session: Session };
  res: ServerResponse;
  query: {[name: string]: string};

}
type Handler = (context: Context) => Promise<any>

const withUserSession: (handler: Handler)=> Promise<any> = (handler) => {
  return withSession(async (context) => {
    const session = context.req.session
    let userId = session.get("user_id");
    if (!userId) {
      const userCollection = await getUsersCollection();
      const latestUser = userCollection.find().sort({ _id: -1 }).limit(1);
      if (await latestUser.hasNext()) {
        userId = (await latestUser.next())._id + 1;
      } else {
        userId = 1;
      }
      await userCollection.insert({
        _id: userId,
        initialRequest: {
          raddr: context.req.connection.remoteAddress
        },
        date: {
          creation: new Date(),
        }
      })
      console.log("generated", userId);
      session.set("user_id", userId);
      await session.save();
    }
    return await handler(context);
  })
};

const withSession = (handler: Handler) => 
  withIronSession(handler, {
    password,
    cookieOptions: {
      // the next line allows to use the session in non-https environements like
      // Next.js dev mode (http://localhost:3000)
      secure: process.env.NODE_ENV === 'production' ? true : false,
    },
  });

export default withUserSession;