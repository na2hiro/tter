import { NextPage } from "next";
import {useRouter} from "next/router";
import ErrorPage from "next/error";
import Link from "next/link";
import {useState, useEffect, FunctionComponent, useMemo} from "react";
import withSession from "../../utils/session";
import io from "socket.io-client"
import { getRoom } from "../../stores/RoomStore";
import { CounterState } from "../../models/Game";
import { JoinRequest, UpdateResponse, GetUpdateRequest, ActiveRoomsResponse, ActiveRoom } from "../../models/messages";
import Shogi, { ShogiSerialization } from "shogitter.ts";

interface Props {
    role: "owner" | "editor" | "player" | "viewer",
    owner: number;
    game: ShogiSerialization;
    tokens: null | {
        edit: string
    };
    userId: number;
}

const RoomPage: NextPage<Props> = ({owner, game, role, tokens, userId}) => {
    const router = useRouter();
    const roomId: string = router.query.roomid as string;

    if (!owner || !game) {
        return <ErrorPage statusCode={404} />;
    }

    return <Room {...{owner, game, role, tokens, roomId, userId}} key={roomId} />;
};
export default RoomPage;

type InnerProps = Props & {
    roomId: string,
}

const Room: FunctionComponent<InnerProps> = ({owner, game, role, tokens, roomId, userId}) => {
    const [currentUrl, setCurrentUrl] = useState("");
    const [state, setState] = useState(game);
    const shogi = useMemo(() => {
        return new Shogi(state);
    }, [state]);
    const [socket, setSocket] = useState(null);
    const [activeRooms, setActiveRooms] = useState<ActiveRoom[]>([]);

    useEffect(() => {
        setCurrentUrl(location.href);

        const socket = io(`/room`);
        setSocket(socket);

        const join: JoinRequest = {roomId};
        socket.emit("join", join)
        socket.on("update", (latestState: UpdateResponse<ShogiSerialization>) => {
            console.log("update", latestState);
            setState(latestState.game);
        })
        socket.on("activeRooms", (res: ActiveRoomsResponse) => {
            console.log("activeRooms")
            setActiveRooms(res.activeRooms);
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
        <pre>{shogi.ban.__toString()}</pre>
        <pre style={{height: "300px", overflowY: "scroll"}}>
            {JSON.stringify(state, null, 2)}
        </pre>
        <Form onSubmit={(commandText: string) => {
            try {
                socket!.emit("update", {roomId, command: JSON.parse(commandText)});
            }catch(e) {
                document.body.style.backgroundColor="#ddd";
                setTimeout(() => {
                    document.body.style.backgroundColor="#fff";
                }, 100)
            }
        }} disabled={!socket || role=="viewer"} />
        <h2>Share</h2>
        <ul>
            <li>Share to watch <input value={`${currentUrl}#`} size={50} readOnly /></li>
            {role==="owner" &&
                <li>Share to edit <input value={`${currentUrl}/edit/${tokens.edit}`} size={50} readOnly /></li>}
        </ul>
        <h2>Active rooms</h2>
        <ul>
            {activeRooms.map(activeRoom => {
                const youreIn = activeRoom.users.indexOf(userId)>=0;
                const count = activeRoom.users.length;
                let message;
                if(youreIn) {
                    if(count>1) {
                        message = `you + ${count-1} users`;
                    } else {
                        message = "you";
                    }
                } else {
                    message = `${count} users`;
                }
                return <li key={activeRoom.roomId} style={{fontWeight: youreIn ? "bold" : "normal"}}>
                <Link as={`/${activeRoom.roomId}`} href="/[roomid]"><a>#{activeRoom.roomId}</a></Link> ({message})
            </li>})}
        </ul>
        <Link as={`${parseInt(roomId)-1}`} href="[roomid]"><a>Go to previous room</a></Link>
    </>;
}

const Form = ({onSubmit, disabled}) => {
    const [text, setText] = useState("");
    return <form onSubmit={(e) => {e.preventDefault(); onSubmit(text)}}>
        <input type="text" name="kifu" value={text} onChange={(e) => setText(e.target.value)} size={50}/>
        <input disabled={disabled} type="submit" value={"Submit"} />
    </form>
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
            tokens,
            userId
        }
    };
});
