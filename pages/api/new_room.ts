
import withSession from "../../utils/session";
import {getRoomsCollection} from "../../utils/mongo";
import { Room } from "./room/[roomid]";
const crypto = require('crypto');

async function handler(req, res) {
    const userId = req.session.get("user_id");
    if(!userId) throw "Unknown user";

    const roomsCollection = await getRoomsCollection();
    const latestRoom = roomsCollection.find().sort({ _id: -1 }).limit(1);
    let roomId;
    if (await latestRoom.hasNext()) {
        roomId = (await latestRoom.next())._id + 1;
    } else {
        roomId = 1;
    }

    const room: Room = {
        _id: roomId,
        game: {
            counter: 0
        },
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

    await roomsCollection.insert(room);
    await req.session.save();
    res.send({roomId});
}

export default withSession(handler);

function generateRandomToken(length: number) {
    return crypto.randomBytes(length).toString('base64').substring(0, length).replace(/\//g, ":").replace(/\+/g, "_");
}