import {FILE_ACTIVITIES} from "../constants/collections";

export const getPaginatedListController = async (req: any, res: any) => {
    try {
        let {fileId, size, from} = req.query;
        fileId = Number.parseInt(fileId);
        size = Number.parseInt(size);
        from = Number.parseInt(from);

        const file_activities = req.app.get(FILE_ACTIVITIES);

        if (isNaN(fileId)  || !(typeof fileId === 'number')) {
            return res.status(400).json({errorMessage: "File ID is missing or invalid"})
        }

        if (isNaN(size) || !(typeof size === 'number') || size < 0) {
            size = 5;
        }

        if (isNaN(from) || !(typeof from === 'number') || from < 0) {
            from = 0;
        }

        const activities = await file_activities.find({fileId})
            .skip(from)
            .limit(size)
            .sort({timestamp: -1})
            .toArray();

        res.status(200).json(activities);

    }catch (error){
        res.status(400).json({error: error});
    }
}