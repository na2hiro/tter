import { NextPage } from "next";
import {useRouter} from "next/router";
import ErrorPage from "next/error";
import { useState, useEffect } from "react";
import axios from "axios";
import { getRoom } from "../api/room/[roomid]";
import withSession from "../../utils/session";

interface Props {
    role: "owner" | "editor" | "player" | "viewer",
    owner: number;
    game: {counter: number};
    tokens: null | {
        edit: string
    }
}

const RoomPage: NextPage<Props> = ({owner, game, role, tokens}) => {
    const router = useRouter();
    const [currentUrl, setCurrentUrl] = useState("");
    const [counter, setCounter] = useState(game?.counter);

    useEffect(() => {
        setCurrentUrl(location.href);
    })

    if (!owner || !game) {
        return <ErrorPage statusCode={404} />;
    }

    const { roomid } = router.query;
    return <>
        <h1>{owner}'s Room: #{roomid}</h1>
        <p>Your role: {role}</p>
        <button disabled={role=="viewer"} style={{fontSize: "100px"}} onClick={()=>{
            setCounter((c) => c+1);
            axios.get(`/api/room/${roomid}`);
        }}>{counter}</button>
        <h2>Share</h2>
        <ul>
            <li>Share to watch <input value={`${currentUrl}#`} size={50} readOnly /></li>
            {role==="owner" &&
                <li>Share to edit <input value={`${currentUrl}/edit/${tokens.edit}`} size={50} readOnly /></li>}
        </ul>
    </>;
  };
export default RoomPage;

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
