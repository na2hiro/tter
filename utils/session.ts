import withIronSession from 'next-iron-session'
import {ironPassword} from "../password";
import {IncomingMessage, ServerResponse} from 'http';
import {generateUser} from "../stores/UserStore";

type Session = {
    get(name: string): any;
    set(name: string, value: string): void;
    save(): Promise<void>;
}
type Context = {
    req: IncomingMessage & { session: Session };
    res: ServerResponse;
    query: { [name: string]: string };

}
type Handler = (context: Context) => Promise<any>

/**
 * Make sure userId exists in session. Generate if user is unknown
 * @param handler
 */
const withUserSession: (handler: Handler) => Promise<any> = (handler) => {
    return withSession(async (context) => {
        const session = context.req.session
        if (!session.get("user_id")) {
            const userId = await generateUser({
                raddr: context.req.connection.remoteAddress
            });
            console.log("generated", userId);
            session.set("user_id", userId);
            await session.save();
        }
        return await handler(context);
    })
};

const withSession = (handler: Handler) =>
    withIronSession(handler, {
        password: ironPassword,
        cookieOptions: {
            // the next line allows to use the session in non-https environements like
            // Next.js dev mode (http://localhost:3000)
            secure: process.env.NODE_ENV === 'production',
        },
    });

export default withUserSession;