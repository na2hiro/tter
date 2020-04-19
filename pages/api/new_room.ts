
import withSession from "../../utils/session";
import {getRoomsCollection} from "../../utils/mongo";

async function handler(req, res) {
    const userId = req.session.get("user_id");
    if(!userId) throw "Unknown user";

    const roomsCollection = getRoomsCollection();
    const latestRoom = roomsCollection.find().sort({ _id: -1 }).limit(1);
    let roomId;
    if (await latestRoom.hasNext()) {
        roomId = (await latestRoom.next())._id + 1;
    } else {
        roomId = 1;
    }

    await roomsCollection.insert({
        _id: roomId,
        game: {
            counter: 0
        },
        permission: {
            owner: userId,
            editors: [],
            players: [],
        },
        date: {
            creation: new Date(),
            last_modified: new Date()
        }
    });
    await req.session.save();
    res.send({roomId});
}

export default withSession(handler);
