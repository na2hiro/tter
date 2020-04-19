import withSession from "../../../utils/session";
import {getRoomsCollection} from "../../../utils/mongo";

async function handler(req, res) {
    const userId = req.session.get("user_id");
    if(!userId) throw "Unknown user";

    const room = await getRoom(req.query.roomid);
    if(room.permission.owner!=userId && room.permission.editors.indexOf(userId)===-1){
        throw "You are not allowed to modify";
    }
    const rooms = await getRoomsCollection();
    rooms.updateOne({_id: room._id}, {"$inc": {"game.counter": 1}});

    res.send({});
}

export default withSession(handler);

export interface Room {
    _id: number,
    game: {
        counter: number
    },
    permission: {
        owner: number,
        editors: number[],
        players: number[],
    },
    date: {
        creation: Date,
        last_modified: Date
    },
    tokens: {
        edit: string
    },
}

export async function getRoom(roomIdStr: string): Promise<Room> {
    if (typeof roomIdStr !== "string" || !/^\d+$/.test(roomIdStr)) {
        return null;
    }
    const roomId = parseInt(roomIdStr);

    const rooms = await getRoomsCollection();
    return await rooms.findOne({_id: roomId});
}