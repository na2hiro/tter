import withSession from "../utils/session";
import {getRoom, getRoomsByUserId, maskRoom, PublicRoom} from "../stores/RoomStore";
import {getUser} from "../stores/UserStore";
import {ShogiSerialization} from "shogitter-ts";
import {FunctionComponent, useState} from "react";
import Link from "next/link";
import {shogitterDB} from "shogitter-ts/lib/ShogitterDB";
import axios from "axios";
import {Router, useRouter} from "next/router";
import CreateNewRoom from "../components/CreateNewRoom";

type Props = {
    user: {
        id: number;
        name: string;
    },
    rooms: PublicRoom<ShogiSerialization>[]
}

const My: FunctionComponent<Props> = ({user: {id, name}, rooms}) => {
    return <>
        <h1>{id}'s my page</h1>
        name: {name}
        <h2>Rooms</h2>
        <CreateNewRoom/>
        <ul>
            {rooms.map(room => <li>
                <Link href="/[roomid]" as={`/${room._id}`}><a>#{room._id}</a></Link>{' '}
                {shogitterDB.getRule(room.game.ruleid).name}
            </li>)}
        </ul>
    </>
}

export default My;

export const getServerSideProps = withSession(async function(context) {
    const userId = context.req.session.get("user_id");
    const user = await getUser(userId);

    const rooms = await getRoomsByUserId(userId);

    return {
        props: {
            user: {
                id: userId,
                name: user.name || "",
            },
            rooms: rooms.map(maskRoom)
        }
    };
});
