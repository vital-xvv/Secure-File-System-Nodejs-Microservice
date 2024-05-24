import {MongoClient} from "mongodb";
import express, {Express} from 'express';
import body from 'body-parser';
import {FILE_ACTIVITIES} from "./src/constants/collections";
require('dotenv').config({path: `./.env.${process.env.NODE_ENV}`});


const PORT = process.env.PORT;
const url = process.env.MONGO_URL
const client = new MongoClient(url as string);
const app = express();

const start = async (app: Express) => {
    await client.connect()//.then(()=>console.log('Connected to the Database'));
    app.set("db", client.db());

    await app.get('db').createCollection(FILE_ACTIVITIES)//.then(()=>console.log('file_activities collection created'));
    app.set(FILE_ACTIVITIES, app.get('db').collection(FILE_ACTIVITIES));

    app.use(body.json({
        limit: '500kb'
    }));

    //Routes
    app.use("/api/activity", require("./src/routes/activity"))

    //Start server
    app.listen(PORT, ()=> {
        console.log(`    Server has been started at port ${PORT}`)
    })
}


if(process.env.NODE_ENV === 'dev')
    start(app).then(() => console.log("App started!"));

export default start;