import {getUsersCollection} from "./mongo";
import {User, UserInfo} from "../models/messages";

type RawUser = {
    _id: number,
    info: UserInfo
}

const animals = ["Doggie", "Kitty", "Elephant", "Giraffe", "Turtle"]

function generateRandomName() {
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const dan = Math.floor(Math.random() * 39) - 30;
    if (dan < 0) {
        return `(${animal} ${-dan}kyu)`
    } else {
        return `(${animal} ${dan + 1}dan)`
    }
}

export const generateUser = async (initialRequest: any) => {
    const userCollection = await getUsersCollection();
    const latestUser = userCollection.find().sort({_id: -1}).limit(1);
    let userId;
    if (await latestUser.hasNext()) {
        userId = (await latestUser.next())._id + 1;
    } else {
        userId = 1;
    }
    await userCollection.insertOne({
        _id: userId,
        initialRequest,
        info: {
            name: generateRandomName()
        },
        date: {
            creation: new Date(),
        }
    });
    return userId;
}

export const updateInfo = async (userId: number, req: UserInfo) => {
    const userCollection = await getUsersCollection();
    await userCollection.updateOne({_id: userId}, {$set: {info: req}})
}

export const getRawUser = async (userId: number) => {
    const userCollection = await getUsersCollection();
    return await userCollection.findOne<RawUser>({_id: userId});
}

export const getUser = async (userId: number) => {
    const userCollection = await getUsersCollection();
    const rawUser = await userCollection.findOne<RawUser>({_id: userId});
    const user: User = {
        id: userId,
        name: rawUser.info.name,
    }
    return user;
}
