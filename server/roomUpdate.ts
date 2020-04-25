import { UpdateRequest } from "./room.models";
import { getRoom, getRoomsCollection } from "../stores/RoomStore";

const roomUpdate = async (msg: UpdateRequest, userId?: number) => {
    if(!userId) throw "Unknown user";

    const room = await getRoom(msg.roomId);
    if (room.permission.owner != userId && room.permission.editors.indexOf(userId) === -1) {
        throw "You are not allowed to modify";
    }
    const rooms = await getRoomsCollection();
    const doc = await rooms.findOneAndUpdate(
        { _id: room._id },
        { "$inc": { "game.counter": 1 } },
        { returnOriginal: false });

    return doc.value.game.counter;
}

export default roomUpdate;