import { NextPage } from "next";
import {useRouter} from "next/router";
import ErrorPage from "next/error";
import { useState } from "react";
import axios from "axios";
import { getRoom } from "../api/room/[roomid]";
import withSession from "../../utils/session";

interface Props {
    role: "owner" | "editor" | "player" | "viewer",
    owner: number;
    game: {counter: number};
}

const RoomPage: NextPage<Props> = ({owner, game, role}) => {
    const router = useRouter();
    const [counter, setCounter] = useState(game?.counter);
    const { roomid } = router.query;
    if (!owner || !game) {
        return <ErrorPage statusCode={404} />;
    }

    return <>
        <p>{owner}'s Room: #{roomid}</p>
        <p>Your role: {role}</p>
        <button disabled={role=="viewer"} style={{fontSize: "100px"}} onClick={()=>{
            setCounter((c) => c+1);
            axios.get(`/api/room/${roomid}`);
        }}>{counter}</button>
    </>;
  };
export default RoomPage;

export const getServerSideProps = withSession(async function(context) {
    const room = await getRoom(context.query.roomid);
    if(!room) {
        return { props: {} };
    }

    return {
        props: {
            role: room.permission.owner == context.req.session.get("user_id") ? "owner" : "viewer",
            owner: room.permission.owner,
            game: room.game,
        }
    };
});
