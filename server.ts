import express from 'express';
import next from 'next';
import socket from 'socket.io';
import {Server} from "http";
import configureRoom from './server/room';

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const handle = nextApp.getRequestHandler()

nextApp.prepare().then(() => {
    const app = express();
    const server = new Server(app);
    const io = socket(server);

    io.on('connection', (socket)=>{

        socket.on('echo', (msg: any) => {
            console.log("echoing");
            socket.emit("echo", msg);
        })

        socket.on("disconnect", () => {
        })
    })

    configureRoom(io);

    app.all('*', (req, res) => {
        handle(req, res)
    });

    server.listen(port);
})