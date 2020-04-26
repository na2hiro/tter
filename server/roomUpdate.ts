import { getRoom, getRoomsCollection } from "../stores/RoomStore";
import { CounterGame } from "../models/Game";
import { UpdateRequest } from "../models/messages";

const roomUpdate = async <T>(msg: UpdateRequest<T>, userId?: number) => {
    if(!userId) throw "Unknown user";

    const room = await getRoom(msg.roomId);
    if (room.permission.owner != userId && room.permission.editors.indexOf(userId) === -1) {
        throw "You are not allowed to modify";
    }
    const game = new CounterGame(room.game);
    const newState = await game.update(msg.command);

    const rooms = await getRoomsCollection();
    await rooms.updateOne(
        { _id: room._id },
        { "$set": { "game": newState } });

    return newState;
}

export default roomUpdate;