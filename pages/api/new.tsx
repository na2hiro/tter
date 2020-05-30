import {apiWithUserSession} from "../../utils/session";
import {generateNewRoom} from "../../stores/RoomStore";

const New = async (req, res) => {
    if (req.method !== 'POST') {
        res.statusCode = 404;
        res.end("");
        return;
    }

    const userId = req.session.get("user_id");

    if (typeof userId !== "number") {
        res.statusCode = 400;
        res.end("user not found");
        return;
    }

    const roomId = await generateNewRoom(userId);

    res.statusCode = 200;
    res.json({roomId});
    return;

}
export default apiWithUserSession(New);
