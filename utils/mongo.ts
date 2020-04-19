
import { MongoClient, Db } from 'mongodb';

const url = 'mongodb://localhost:27017';
const dbName = 'tter'

let db: Db;

MongoClient.connect(url, function (err, client) {
    if (err) {
        console.error(err);
        return;
    }
    console.log("Connected successfully to server");

    db = client.db(dbName);
});

export default db;

export function getUsersCollection() {
    if(!db) throw "no db connection";
    return db.collection("users");
}
