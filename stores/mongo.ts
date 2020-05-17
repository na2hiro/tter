
import { MongoClient, Db } from 'mongodb';
import {mongoUser, mongoPassword} from "../password";

const dbName = 'tter'
const auth = mongoUser ? `${mongoUser}${mongoPassword ? `:${encodeURIComponent(mongoPassword)}` : ""}@` : "";
const url = `mongodb://${auth}localhost:27017/${dbName}`;

let db;

export async function getDb(): Promise<Db> {
    if(db) {
        return Promise.resolve(db);
    }
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                reject(err);
                return;
            }
            console.log("Connected successfully to server");

            db = client.db(dbName);
            resolve(db);
        })
    });
}

export async function getUsersCollection() {
    const db = await getDb();
    return db.collection("users");
}
