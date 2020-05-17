import socket from "socket.io";
import cookie from "cookie";
import ironStore from "iron-store";
import {ironPassword} from "../password";
import {KifuCommand, ShogiSerialization} from "shogitter.ts";
import { JoinRequest, UpdateRequest, UpdateResponse, GetUpdateRequest, ActiveRoomsResponse } from "../models/messages";
import {getRoom, updateRoom} from "../stores/RoomStore";

const rooms: {[room: string]: number[]} = {};

const configureRoom = (io: socket.Server) => {
    const room = io
        .of("/room")
        .on("connection", async (socket) => {
            let myRooms = [];
            const cookies = cookie.parse(socket.handshake.headers.cookie);
            const store = await ironStore({
                password: ironPassword,
                sealed: cookies.__ironSession
            });
            const userId = store.get("user_id");
            if (!userId) {
                socket.emit("error", "Cannot auth");
                socket.disconnect();
                return;
            }
            
            socket.on("join", ({roomId}: JoinRequest) => {
                myRooms.push(roomId);
                if(!rooms[roomId]){
                    rooms[roomId] = [];
                }
                rooms[roomId].push(userId)
                console.log("joined", roomId, rooms, myRooms)
                socket.join(`${roomId}`);
                room.emit("activeRooms", calcActiveRooms());
            });
            socket.on("update", async (msg: UpdateRequest<KifuCommand>) => {
                console.log("message", msg)
                try{
                    const newGame = await updateRoom(msg, userId)
                    const updateResponse: UpdateResponse<ShogiSerialization> = {game: newGame};
                    console.log("update", updateResponse);
                    room.to(msg.roomId).emit("update", updateResponse);
                }catch(e) {
                    socket.emit("error", e);
                }
            });
            socket.on("getUpdate", async (msg: GetUpdateRequest) => {
                const newGame = (await getRoom<ShogiSerialization>(msg.roomId)).game;
                const updateResponse: UpdateResponse<ShogiSerialization> = {game: newGame};
                console.log("getUpdate", updateResponse);
                socket.emit("getUpdate", updateResponse);
            });
            socket.on("disconnect", () => {
                myRooms.forEach(myRoom => {
                    const index = rooms[myRoom].indexOf(userId);
                    rooms[myRoom].splice(index, 1)
                    if (rooms[myRoom].length == 0) {
                        delete rooms[myRoom];
                    }
                })
                console.log("disconnect", rooms, myRooms)
                room.emit("activeRooms", calcActiveRooms());
            })

            function calcActiveRooms(): ActiveRoomsResponse {
                const roomList = [];
                for(let roomId in rooms) {
                    // TODO dedup
                    roomList.push({roomId, users: rooms[roomId]})
                }
                roomList.sort((a,b) => b.users.length - a.users.length);
                return {activeRooms: roomList};
            }
        });
}
export default configureRoom;