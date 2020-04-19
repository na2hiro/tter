import { NextPage } from "next";
import {useRouter} from "next/router";
import Link from "next/link";
import ErrorPage from "next/error";
import { getRoomsCollection } from "../../utils/mongo";

interface Props {
    owner: number;
    game: {counter: number};
}

const Room: NextPage<Props> = ({owner, game}) => {
    const router = useRouter();
    const { roomid } = router.query;
    if (!owner || !game) {
        return <ErrorPage statusCode={404} />;
    }

    return <>
        <p>Room #{roomid}, Owner {owner}, Game {JSON.stringify(game)}</p>
        <Link href="/[roomid]" as={`/${parseInt(roomid.toString())-1}`}>Visit older one</Link>
    </>;
  };
export default Room;

export async function getServerSideProps(context) {
    const props = await getRoomProps(context.query.roomid);
    if (!props) {
        return { props: {} };
    }
    return { props };
}

async function getRoomProps(roomIdStr: string) {
    const room = await getRoom(roomIdStr);
    if(!room) {
        return null;
    }

    return {
        owner: room.permission.owner,
        game: room.game,
    }
}


async function getRoom(roomIdStr: string) {
    console.log(roomIdStr)
    if (typeof roomIdStr !== "string" || !/^\d+$/.test(roomIdStr)) {
        return null;
    }
    const roomId = parseInt(roomIdStr);

    const rooms = getRoomsCollection();
    return await rooms.findOne({_id: roomId});
}