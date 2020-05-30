import withIronSession from 'next-iron-session'
import {ironPassword} from "../password";
import {IncomingMessage, ServerResponse} from 'http';
import {generateUser} from "../stores/UserStore";

type Req = IncomingMessage & { session: Session };
type Res = ServerResponse;

type Session = {
    get(name: string): any;
    set(name: string, value: string): void;
    save(): Promise<void>;
}
type Context = {
    req: Req;
    res: Res;
    query: { [name: string]: string };

}
type Handler<R> = (context: Context) => Promise<R>

/**
 * Make sure userId exists in session. Generate if user is unknown
 * @param handler
 */
const withUserSession: <R>(handler: Handler<R>) => Promise<any> = (handler) => {
    return withSession(async (context) => {
        const {req} = context;
        const {session} = req;
        if (!session.get("user_id")) {
            const userId = await generateUser({
                raddr: req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.socket?.remoteAddress
            });
            console.log("generated", userId);
            session.set("user_id", userId);
            await session.save();
        }
        return await handler(context);
    })
};

type ApiHandler<R> = (req: Req, res: Res) => Promise<R>

export const apiWithUserSession: <R>(handler: ApiHandler<R>) => Promise<any> = (handler) => {
    return withSession(async (req, res) => {
        const {session} = req;
        if (!session.get("user_id")) {
            const userId = await generateUser({
                raddr: req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.socket?.remoteAddress
            });
            console.log("generated", userId);
            session.set("user_id", userId);
            await session.save();
        }
        return await handler(req, res);
    });
};

// Polymorphic?
const withSession = <R>(handler: ApiHandler<R> | Handler<R>) =>
    withIronSession(handler, {
        password: ironPassword,
        cookieOptions: {
            // the next line allows to use the session in non-https environements like
            // Next.js dev mode (http://localhost:3000)
            secure: process.env.NODE_ENV === 'production',
        },
    });

export default withUserSession;