import ActivityType from "./ActivityType";
interface FileActivity {
    id?: number | string;
    fileId: number;
    type: ActivityType;
    timestamp?: Date;
}

export default FileActivity;