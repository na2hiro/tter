import { getRoom, getRoomsCollection } from "../stores/RoomStore";
import { UpdateRequest } from "../models/messages";
import Shogi, {KifuCommand, ShogiSerialization} from "shogitter.ts";

const roomUpdate = async (msg: UpdateRequest<KifuCommand>, userId?: number) => {
    if(!userId) throw "Unknown user";

    const room = await getRoom<ShogiSerialization>(msg.roomId);
    if (room.permission.owner != userId && room.permission.editors.indexOf(userId) === -1) {
        throw "You are not allowed to modify";
    }
    const game = new Shogi(room.game);
    game.move_d(msg.command);
    const newState = game.getObject();

    const rooms = await getRoomsCollection();
    await rooms.updateOne(
        { _id: room._id },
        { "$set": { "game": newState } });

    return newState;
}

export default roomUpdate;