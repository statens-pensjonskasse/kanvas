import { MongoClient } from "mongodb";

const url = 'mongodb://localhost:27017';
const dbName = 'sterope_stoetteapplikasjoner';

const client = new MongoClient(url);
export const pandavarehus = () => client.connect()
    .then(c => c.db(dbName))
    .then(db => db.collection('pandavarehus'))