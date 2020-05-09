import withSession from "../../../utils/session";
import { serverRedirect, BrowserRedirect } from "../../../utils/redirects";
import { getRoom, getRoomsCollection } from "../../../stores/RoomStore";

const EditPage = BrowserRedirect;
export default EditPage;

export const getServerSideProps = withSession(async function(ctx) {
    const {req, res} = ctx;
    const userId = req.session.get("user_id");
    if (!userId) {
        // TODO better messaging
        res.statusCode = 400;
        res.write("Unknown user")
        res.end();
        return;
    }

    const room = await getRoom(ctx.query.roomid);
    if (room.tokens.edit !== ctx.query.token) {
        res.statusCode = 401;
        res.write("You are not invited")
        res.end();
        return;
    }
    if (room.permission.owner !== userId) {
        const rooms = await getRoomsCollection();
        await rooms.updateOne(
            { _id: room._id },
            { "$addToSet": { "permission.editors": userId } }
        );
    }

    return serverRedirect(ctx, {
        href: `/[roomid]`,
        asPath: `/${ctx.query.roomid}`,
        permanent: true,
    })
});
