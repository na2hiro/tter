import { getDb } from "./mongo";
import {GetUpdateRequest, UpdateRequest} from "../models/messages";
import Shogi, { KifuCommand, ShogiSerialization } from "shogitter-ts";
import crypto from "crypto";

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

export interface PublicRoom<G> {
    _id: number,
    game: G,
    permission: {
        owner: number,
        editors: number[],
        players: number[],
    },
    date: {
        creation: number,
        last_modified: number
    },
}

export function maskRoom(room: Room<ShogiSerialization>): PublicRoom<ShogiSerialization> {
    const {tokens, date, ...rest} = room;
    return {
        date: {
            creation: date.creation.getTime(),
            last_modified: date.last_modified.getTime(),
        },
        ...rest
    };
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

export async function getRoomsByUserId<G>(userId: number): Promise<Room<G>[]> {
    const rooms = await getRoomsCollection();
    return rooms.find({$or: [
            {"permission.owner": userId},
            {"permission.editors": userId},
            {"permission.players": userId},
        ]}).sort({_id: -1}).toArray();
}

export async function generateNewRoom(userId: number): Promise<number> {
    const roomsCollection = await getRoomsCollection();
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

    return roomId;
}

function generateRandomToken(length: number) {
    return crypto.randomBytes(length).toString('base64').substring(0, length).replace(/\//g, ":").replace(/\+/g, "_");
}
