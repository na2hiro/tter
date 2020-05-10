import React, { useState, useEffect } from "react";
import io from "socket.io-client"
import SocketContext from "../contexts/SocketContext";
import Head from "next/head";
import "./app.css";

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
    return <>
        <Head>
            <title>Shogitter alpha</title>
            <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, minimum-scale=1.0" />
        </Head>
        {!socket ? <>Connecting</> : <SocketContext.Provider value={socket}>
        <Component {...pageProps} />
    </SocketContext.Provider>}
    </>
}

export default MyApp;
