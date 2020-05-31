import Link from "next/link";
import {FunctionComponent} from "react";
import {ActiveRoom} from "../models/messages";

type Props = {
    activeRooms: ActiveRoom[];
    userId: number;
}
const ActiveRooms: FunctionComponent<Props> = ({activeRooms, userId}) => {
    return <>
        <h2>Active rooms</h2>
        <ul>
            {activeRooms.map(activeRoom => {
                const youreIn = activeRoom.users.map(user=>user.id).indexOf(userId) >= 0;
                const count = activeRoom.users.length;
                let message;
                if (youreIn) {
                    if (count > 1) {
                        message = `you + ${count - 1} users`;
                    } else {
                        message = "you";
                    }
                } else {
                    message = `${count} users`;
                }
                return <li key={activeRoom.roomId} style={{fontWeight: youreIn ? "bold" : "normal"}}>
                    <Link as={`/${activeRoom.roomId}`} href="/[roomid]"><a>#{activeRoom.roomId}</a></Link> ({message})
                </li>
            })}
        </ul>
    </>
}

export default ActiveRooms;