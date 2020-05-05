import crypto from 'crypto';
import withSession from "../utils/session";
import { Room, getRoomsCollection } from "../stores/RoomStore";
import Shogi from "shogitter.ts";
import { serverRedirect, BrowserRedirect } from "../utils/redirects";

const HomePage = BrowserRedirect;
  
export default HomePage;

export const getServerSideProps = withSession(async function(ctx) {
    const {req, res} = ctx;
    const userId = req.session.get("user_id");

    const roomsCollection = await getRoomsCollection();
    const latestUsersRoom = roomsCollection.find({"permission.owner": userId}).sort({_id: -1}).limit(1);
    if (await latestUsersRoom.hasNext()) {
        return serverRedirect(ctx, {
            href: `/[roomid]`,
            asPath: `/${(await latestUsersRoom.next())._id}`,
            permanent: true,
        });
    }

    const latestRoom = roomsCollection.find().sort({ _id: -1 }).limit(1);
    let roomId;
    if (await latestRoom.hasNext()) {
        roomId = (await latestRoom.next())._id + 1;
    } else {
        roomId = 1;
    }
    const game = new Shogi(0);
    game.start();

    const room: Room<any> = {
        _id: roomId,
        game: game.getObject(),
        permission: {
            owner: userId,
            editors: [],
            players: [],
        },
        date: {
            creation: new Date(),
            last_modified: new Date()
        },
        tokens: {
            edit: generateRandomToken(6)
        }
    };

    await roomsCollection.insertOne(room);

    return serverRedirect(ctx, {
        href: `/[roomid]`,
        asPath: `/${roomId}`,
        permanent: true,
    })
});

function generateRandomToken(length: number) {
    return crypto.randomBytes(length).toString('base64').substring(0, length).replace(/\//g, ":").replace(/\+/g, "_");
}