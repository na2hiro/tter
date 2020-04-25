import { useEffect, useState } from "react";
import io from "socket.io-client";

function HomePage() {
    const [socket, setSocket] = useState(null);
    useEffect(() => {
        const socket = io();
        setSocket(socket);
        console.log("connected");
        socket.emit("echo", { hello: "world" })
        socket.on("echo", (msg) => {
            console.log("got echo back", msg);
        })

        return () => {
            setSocket(null);
            socket.close();
        }
    }, [])
    return <div>Welcome to Next.js!<button onClick={()=>{socket?.emit("echo", "hi!!")}}>Emit</button></div>
}
  
export default HomePage;