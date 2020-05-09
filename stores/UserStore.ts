import {getUsersCollection} from "./mongo";

export const generateUser = async (initialRequest: any) => {
    const userCollection = await getUsersCollection();
    const latestUser = userCollection.find().sort({ _id: -1 }).limit(1);
    let userId;
    if (await latestUser.hasNext()) {
        userId = (await latestUser.next())._id + 1;
    } else {
        userId = 1;
    }
    await userCollection.insertOne({
        _id: userId,
        initialRequest,
        date: {
            creation: new Date(),
        }
    });
    return userId;
}