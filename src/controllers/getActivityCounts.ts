import {FILE_ACTIVITIES} from "../constants/collections";

export const getCountsController = async (req: any, res: any) => {
    try{
        const {fileIds} = req.body;
        const file_activities = req.app.get(FILE_ACTIVITIES);

        if(!fileIds) {
            return res.status(400).json({errorMessage: "'fileIds' param is missing"})
        }

        const result = await file_activities.aggregate(
            [
                {
                    $match: {
                        "fileId": {$in: fileIds},
                    }
                },
                {
                    $group: {
                        _id: {fileId: "$fileId"},
                        "count": {$sum : 1}
                    }
                },
                {
                    $sort: {
                        "count" : -1
                    }
                }
            ]
        ).toArray();

        let statisticsObj: any = {};
        result.forEach((r: { _id: { fileId: any; }; count: any; }) => statisticsObj[`fileId_${r._id.fileId}`] = r.count);

        res.status(200).json(statisticsObj);
    } catch (error){
        res.status(400).json({errorMessage: error})
    }
}