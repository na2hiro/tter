import { NextPage } from "next";
import {useRouter} from "next/router";
import ErrorPage from "next/error";
import Link from "next/link";
import {useState, useEffect, FunctionComponent, useCallback} from "react";
import withSession from "../../utils/session";
import io from "socket.io-client"
import { getRoom } from "../../stores/RoomStore";
import { JoinRequest, UpdateResponse, GetUpdateRequest, ActiveRoomsResponse, ActiveRoom } from "../../models/messages";
import Shogi, { ShogiSerialization, KifuCommand } from "shogitter-ts";
import shogitterReact from "shogitter-react";
import {ErrorBoundary} from "../../components/ErrorBoundary";
import Share from "../../components/Share";
import ActiveRooms from "../../components/ActiveRooms";
import useTemporaryMessage from "../../utils/useTemporaryMessage";

const {ShogitterWithoutDnDWrapper: ShogitterReact} = shogitterReact;

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
    const [state, setState] = useState(game);
    const [message, setMessage] = useTemporaryMessage(5000);
    const [socket, setSocket] = useState(() => io(`/room`));
    const [activeRooms, setActiveRooms] = useState<ActiveRoom[]>([]);

    useEffect(() => {
        console.log("setSocket", socket)

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
        socket.on("error", (res: any) => {
            console.log("error")
            setMessage(res);
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
    const onCommand = useCallback((command: KifuCommand) => {
        console.log("run?", command, socket, role);
        if (socket && role !== "viewer") {
            console.log("run", command);
            socket!.emit("update", {roomId, command});
        }
    }, [socket]);
    const watching = activeRooms.filter(room => room.roomId==roomId)[0]?.users;

    return <div key={"room"+roomId}>
        <h1>#{roomId}: {owner==userId ? "Your" : `${owner}'s`} room</h1>
        <p>Your role: {role}</p>
        {message}

        <ErrorBoundary>
            <ShogitterReact data={state} onCommand={onCommand} />
        </ErrorBoundary>
        <div>
            {watching?.length || "?"} watching: {watching?.map(name=>name+" san").join(", ")}
        </div>
        <Share role={role} tokens={tokens} />
        {/*<ActiveRooms activeRooms={activeRooms} userId={userId} />*/}
        {/*<Link as={`${parseInt(roomId)-1}`} href="[roomid]"><a>Go to previous room</a></Link>*/}
    </div>;
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
