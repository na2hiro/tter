import React, { useState, useEffect } from "react";
import io from "socket.io-client"
import SocketContext from "../contexts/SocketContext";

function MyApp({ Component, pageProps }) {
    const [socket, setSocket] = useState(null);
    useEffect(() => {
        console.log("create global socket")
        const socket = io();
        setSocket(socket);

        return () => {
            setSocket(null);
            socket.close();
        }
    }, []);
    return !socket ? <>Connecting</> : <SocketContext.Provider value={socket}>
        <Component {...pageProps} />
    </SocketContext.Provider>
}

export default MyApp;
