import {apiWithUserSession} from "../../../utils/session";
import {UserInfo} from "../../../models/messages";
import {updateInfo} from "../../../stores/UserStore";

const UpdateUser = async (req, res) => {
    if (req.method !== 'POST') {
        res.statusCode = 404;
        res.end("");
        return;
    }

    const userId = req.session.get("user_id");

    if (typeof userId !== "number" || typeof req.body.name !== "string") {
        res.statusCode = 400;
        res.end("user not found");
        return;
    }

    const request: UserInfo = {
        name: req.body.name
    };

    await updateInfo(userId, request);


    res.statusCode = 200;
    res.json("ok");
    return;

}
export default apiWithUserSession(UpdateUser);
