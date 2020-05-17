import { getDb } from "./mongo";
import {GetUpdateRequest, UpdateRequest} from "../models/messages";
import Shogi, { KifuCommand, ShogiSerialization } from "shogitter.ts";

export interface Room<G> {
    _id: number,
    game: G,
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

export const updateRoom = async (msg: UpdateRequest<KifuCommand>, userId?: number) => {
    if(!userId) throw "Unknown user";

    const room = await getRoom<ShogiSerialization>(msg.roomId);
    if (room.permission.owner != userId && room.permission.editors.indexOf(userId) === -1) {
        throw "You are not allowed to modify";
    }
    const game = new Shogi(room.game);
    game.runCommand(msg.command);
    const newState = game.getObject();

    const rooms = await getRoomsCollection();
    await rooms.updateOne(
        { _id: room._id },
        { "$set": { "game": newState } });

    return newState;
}

export async function getRoom<G>(roomIdStr: string): Promise<Room<G>> {
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