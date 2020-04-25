import socket from "socket.io";
import cookie from "cookie";
import ironStore from "iron-store";
import password from "../password";
import { UpdateRequest, JoinRequest, UpdateResponse } from "./room.models";
import roomUpdate from "./roomUpdate";

const configureRoom = (io: socket.Server) => {
    const room = io
        .of("/room")
        .on("connection", async (socket) => {
            console.log("a user connected to room");
            const cookies = cookie.parse(socket.handshake.headers.cookie);
            let store;
            if(cookies.__ironSession) {
                store = await ironStore({
                    password,
                    sealed: cookies.__ironSession
                });
                console.log("user id", store.get("user_id"));
            }
            
            socket.on("join", ({roomId}: JoinRequest) => {
                console.log("joined", roomId)
                socket.join(`${roomId}`);
            });
            socket.on("update", async (msg: UpdateRequest) => {
                const newGame = await roomUpdate(msg, store?.get("user_id"))
                const updateResponse: UpdateResponse = {game: newGame};
                console.log("update", updateResponse);
                room.to(msg.roomId).emit("update", updateResponse);
            });
        });
}
export default configureRoom;