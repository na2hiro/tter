import { getRoom } from "../stores/RoomStore";
import { GetUpdateRequest } from "../models/messages";

const roomGet = async <T>(msg: GetUpdateRequest, userId?: number) => {
    const room = await getRoom(msg.roomId);
    return room.game as T;
}

export default roomGet;