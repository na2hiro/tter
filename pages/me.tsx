import withSession from "../utils/session";
import {getRoomsByUserId, maskRoom, PublicRoom} from "../stores/RoomStore";
import {getUser} from "../stores/UserStore";
import {ShogiSerialization} from "shogitter-ts";
import {FunctionComponent, useState} from "react";
import Link from "next/link";
import {shogitterDB} from "shogitter-ts/lib/ShogitterDB";
import axios from "axios";
import CreateNewRoom from "../components/CreateNewRoom";
import AutoSavingInput from "../components/AutoSavingInput";

type Props = {
    user: {
        id: number;
        name: string;
    },
    rooms: PublicRoom<ShogiSerialization>[]
}

const Me: FunctionComponent<Props> = ({user: {id, name}, rooms}) => {
    return <>
        <h1>{id}'s my page</h1>
        name: <AutoSavingInput initialValue={name}
                               onSave={(value) => axios.post("/api/user/update", {name: value})} />
        <h2>Rooms</h2>
        <CreateNewRoom/>
        <ul>
            {rooms.map(room => <li key={room._id}>
                <Link href="/[roomid]" as={`/${room._id}`}><a>#{room._id}</a></Link>{' '}
                {shogitterDB.getRule(room.game.ruleid).name}
            </li>)}
        </ul>
    </>
}

export default Me;

export const getServerSideProps = withSession(async function(context) {
    const userId = context.req.session.get("user_id");
    const user = await getUser(userId);

    const rooms = await getRoomsByUserId(userId);

    return {
        props: {
            user: {
                id: userId,
                name: user.info?.name || "",
            },
            rooms: rooms.map(maskRoom)
        }
    };
});
