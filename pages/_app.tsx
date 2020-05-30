import React, { useState, useEffect } from "react";
import io from "socket.io-client"
import SocketContext from "../contexts/SocketContext";
import Head from "next/head";
import "./app.css";
import {DndWrapper} from "shogitter-react";
import Link from "next/link";

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
        <DndWrapper>
            <SocketContext.Provider value={socket}>
                <div style={{backgroundColor: "#c0deed", height: "50px", display: "flex", placeContent: "space-between", alignItems: "center"}}>
                    <Link href="/">
                        <a style={{height: "100%"}}>
                            <img src={"/images/shogitter.png"} style={{maxHeight: "100%", maxWidth: "100%"}} />
                        </a>
                    </Link>
                    <div>
                        <Link href="/my">
                            <a>
                                My page
                            </a>
                        </Link>
                    </div>
                </div>
                <div style={{margin: "6px"}}>
                    {!socket ? <>Connecting</> : <Component {...pageProps} /> }
                </div>
            </SocketContext.Provider>
        </DndWrapper>
    </>
}

export default MyApp;
