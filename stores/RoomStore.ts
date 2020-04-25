import { getDb } from "../utils/mongo";

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

export async function getRoomsCollection() {
    const db = await getDb();
    return db.collection("rooms");
}