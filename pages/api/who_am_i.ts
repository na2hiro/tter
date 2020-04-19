import withSession from "../../utils/session";
import {getUsersCollection} from "../../utils/mongo";

async function handler(req, res) {
    let userId = req.session.get("user_id");
    if(!userId) {
        const userCollection = getUsersCollection();
        const latestUser = userCollection.find().sort({_id: -1}).limit(1);
        if(await latestUser.hasNext()) {
            userId = (await latestUser.next())._id + 1;
        } else {
            userId = 1;
        }
        await userCollection.insert({
            _id: userId,
            initialRequest: {
                raddr: req.connection.remoteAddress
            },
            date: {
                creation: new Date(),
            }
        })
        req.session.set("user_id", userId);
        await req.session.save();
    }
    res.send({userId});
}

export default withSession(handler);