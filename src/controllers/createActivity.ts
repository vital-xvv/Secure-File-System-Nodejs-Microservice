import FileActivity from "../models/FileActivity";
import axios from "axios";
import ActivityType from "../models/ActivityType";
import {fileApi} from "../constants/api";
import {FILE_ACTIVITIES} from "../constants/collections";

const createActivityController = async (req: any, res: any) => {
    try{
        const file_activities = req.app.get(FILE_ACTIVITIES);
        let {timestamp, type, fileId} = req.body;
        fileId = Number.parseInt(fileId);

        if(isNaN(fileId)  || !(typeof fileId === 'number')) {
            return res.status(400).json({errorMessage: "File ID is missing or invalid"});
        }else {
            const response = await axios.get(fileApi+`/${fileId}`);
            if(!response.data.id) {
                return res.status(400).json({errorMessage: `File ID ${fileId} does not exist`});
            }
        }

        if(!type) {
            return res.status(400).json({errorMessage: "Activity Type is missing or invalid"});
        }else if(!Object.values(ActivityType).includes(type)){
            return res.status(400).json({errorMessage: "Illegal activity type"});
        }

        if(!timestamp || !(timestamp instanceof Date)) {
            timestamp = new Date();
        }

        const body: FileActivity = {
            type,
            timestamp,
            fileId
        }

        const result = await file_activities.insertOne(body);
        res.status(201).json(result);
    }catch (error){
        res.status(400).json({error: error})
    }
}

export default createActivityController;