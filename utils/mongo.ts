
import { MongoClient, Db } from 'mongodb';

const url = 'mongodb://localhost:27017';
const dbName = 'tter'

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
