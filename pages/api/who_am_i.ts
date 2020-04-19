import withSession from "../../utils/session";

async function handler(req, res) {
    let userId = req.session.get("user_id");
    if(!userId) {
        userId = Math.floor(10000000*Math.random());
        req.session.set("user_id", userId);
        await req.session.save();
    }
    res.send({userId});
}

export default withSession(handler);