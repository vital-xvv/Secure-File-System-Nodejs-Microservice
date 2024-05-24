import createActivityController from '../controllers/createActivity';
import {getPaginatedListController} from "../controllers/getPaginatedList";
import {getCountsController} from "../controllers/getActivityCounts";

import express from 'express';
const router = express.Router();


router.post("", createActivityController);
router.get("", getPaginatedListController);
router.post("/_counts", getCountsController)

module.exports = router;