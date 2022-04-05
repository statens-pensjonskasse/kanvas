import { MongoClient } from "mongodb";

const url = process.env.PANDAVAREHUS_DB || 'mongodb://sterope_stoetteapplikasjoner:sterope_stoetteapplikasjoner@mongodb.utv.spk.no:27017?authSource=sterope_stoetteapplikasjoner&readPreference=primary&directConnection=true&ssl=false&authMechanism=DEFAULT'
const dbName = 'sterope_stoetteapplikasjoner';

const client = new MongoClient(url);
export const pandavarehus = () => client.connect()
    .then(c => c.db(dbName))
    .then(db => db.collection('pandavarehus'))