import socket from "socket.io";
import cookie from "cookie";
import ironStore from "iron-store";
import password from "../password";
import roomUpdate from "./roomUpdate";
import roomGet from "./roomGet";
import { CounterState } from "../models/Game";
import { JoinRequest, UpdateRequest, UpdateResponse, GetUpdateRequest } from "../models/messages";

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
            socket.on("update", async (msg: UpdateRequest<CounterState>) => {
                const newGame = await roomUpdate(msg, store?.get("user_id"))
                const updateResponse: UpdateResponse<CounterState> = {game: newGame};
                console.log("update", updateResponse);
                room.to(msg.roomId).emit("update", updateResponse);
            });
            socket.on("getUpdate", async (msg: GetUpdateRequest) => {
                const newGame = await roomGet(msg, store?.get("user_id"))
                const updateResponse: UpdateResponse<CounterState> = {game: newGame};
                console.log("getUpdate", updateResponse);
                socket.emit("getUpdate", updateResponse);
            });
        });
}
export default configureRoom;