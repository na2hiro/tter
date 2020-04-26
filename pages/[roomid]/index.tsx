import { NextPage } from "next";
import {useRouter} from "next/router";
import ErrorPage from "next/error";
import Link from "next/link";
import { useState, useEffect } from "react";
import withSession from "../../utils/session";
import io from "socket.io-client"
import { getRoom } from "../../stores/RoomStore";
import { CounterState } from "../../models/Game";
import { JoinRequest, UpdateResponse, GetUpdateRequest } from "../../models/messages";

interface Props {
    role: "owner" | "editor" | "player" | "viewer",
    owner: number;
    game: CounterState;
    tokens: null | {
        edit: string
    }
}

const RoomPage: NextPage<Props> = ({owner, game, role, tokens}) => {
    const router = useRouter();
    const roomId: string = router.query.roomid as string;

    if (!owner || !game) {
        return <ErrorPage statusCode={404} />;
    }

    return <Room {...{owner, game, role, tokens, roomId}} key={roomId} />;
};
export default RoomPage;

const Room = ({owner, game, role, tokens, roomId}) => {
    const [currentUrl, setCurrentUrl] = useState("");
    const [counter, setCounter] = useState(game?.counter);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        setCurrentUrl(location.href);

        const socket = io(`/room`);
        setSocket(socket);

        const join: JoinRequest = {roomId};
        socket.emit("join", join)
        socket.on("update", (latestState: UpdateResponse<CounterState>) => {
            console.log("update", latestState);
            setCounter(latestState.game.counter);
        })
        socket.on("reconnect", () => {
            console.log("reconnect");
            const msg: GetUpdateRequest = {roomId};
            socket.emit("getUpdate", msg);
        })

        return () => {
            socket.disconnect();
        }
    }, []);

    return <>
        <h1>{owner}'s Room: #{roomId}</h1>
        <p>Your role: {role}</p>
        <button disabled={!socket || role=="viewer"} style={{fontSize: "100px"}} onClick={()=>{
            socket!.emit("update", {roomId, data: counter+1});
        }}>{counter}</button>
        <h2>Share</h2>
        <ul>
            <li>Share to watch <input value={`${currentUrl}#`} size={50} readOnly /></li>
            {role==="owner" &&
                <li>Share to edit <input value={`${currentUrl}/edit/${tokens.edit}`} size={50} readOnly /></li>}
        </ul>
        <Link as={`${parseInt(roomId)-1}`} href="[roomid]">Go to previous room</Link>
    </>;
}

export const getServerSideProps = withSession(async function(context) {
    const room = await getRoom(context.query.roomid);
    if(!room) {
        return { props: {} };
    }

    const userId = context.req.session.get("user_id");

    let role;
    if(userId === room.permission.owner) {
        role = "owner";
    } else if(room.permission.editors.indexOf(userId)>=0) {
        role = "editor";
    } else {
        role = "viewer";
    }

    const tokens = role === "owner" ? {
        edit: room.tokens.edit
    } : null;

    return {
        props: {
            role,
            owner: room.permission.owner,
            game: room.game,
            tokens
        }
    };
});
