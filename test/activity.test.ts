import start from '../index';
import { use, expect } from 'chai'
import chaiHttp from 'chai-http'
import {before} from "mocha";
import express from "express";
import {FILE_ACTIVITIES} from "../src/constants/collections";
import {ObjectId} from "mongodb";
import ActivityType from "../src/models/ActivityType";

const chai = use(chaiHttp);
const serverURI = `http://localhost:${process.env.PORT}`;

describe('Operations with Activity Entity', () => {
    const app = express();
    before( (done) => {
        start(app).then(() => {
            done();
        }).catch(done);
    })

    describe('Route POST /api/activity',  () => {

        it('Should fail because File ID 200 does not exist in Spring Boot Server', (done) => {
            chai.request(serverURI).post('/api/activity')
                .send({
                    fileId:200,
                    type:"UPDATED"
                })
                .end( (err: any, res: any) => {
                    const body = res.body;
                    expect(res).to.have.status(400);
                    expect(body.errorMessage).to.eq("File ID 200 does not exist")
                    done();
                });
        });

        it('Should fail because there is no such File Activity as "UPGRADE"', (done) => {
            chai.request(serverURI).post('/api/activity')
                .send({
                    fileId:1,
                    type:"UPGRADE"
                })
                .end( (err: any, res: any) => {
                    const body = res.body;
                    expect(res).to.have.status(400);
                    expect(body.errorMessage).to.eq("Illegal activity type")
                    done();
                });
        });

        it('Should fail because File ID is not a number', (done) => {
            chai.request(serverURI).post('/api/activity')
                .send({
                    fileId:'hhh',
                    type:"UPDATED"
                })
                .end( (err: any, res: any) => {
                    const body = res.body;
                    expect(res).to.have.status(400);
                    expect(body.errorMessage).to.eq("File ID is missing or invalid")
                    done();
                });
        });

        it('Should create an activity object', (done) => {
            chai.request(serverURI).post('/api/activity')
                .send({
                    fileId:9,
                    type:"UPDATED"
                })
                .end(async (err: any, res: any) => {
                    const body = res.body;

                    const file_activities = app.get(FILE_ACTIVITIES);
                    const newlyCreatedObject = await file_activities.findOne({_id:new ObjectId(body.insertedId)});


                    expect(res).to.have.status(201);
                    expect(newlyCreatedObject._id.toString()).is.eq(body.insertedId);
                    expect(newlyCreatedObject.fileId).is.eq(9);
                    expect(newlyCreatedObject.type).is.eq(ActivityType.UPDATED.toString());
                    expect(newlyCreatedObject.timestamp).is.below(new Date());

                    done();
                    file_activities.deleteOne({_id: new ObjectId(body.insertedId)});
                });
        });
    });

    describe("Route GET /api/activity", () => {

        it('Should fail because fileId is not a number', (done) => {
            chai.request(serverURI).get("/api/activity")
                .query({
                    fileId: 'sjgk'
                })
                .end((err: any, res: any) => {
                    expect(res).to.have.status(400);
                    expect(res.body.errorMessage).to.eq("File ID is missing or invalid");
                    done();
                })
        })

        it('Should return 5 entities when "size" and "from" params are not present', (done) => {
            chai.request(serverURI).get("/api/activity")
                .query({
                    fileId: 7
                })
                .end((err: any, res: any) => {
                    expect(res).to.have.status(200);
                    expect(res.body).length(5);
                    done();
                })
        })

        it('Should return 6 entities', (done) => {
            chai.request(serverURI).get("/api/activity")
                .query({
                    fileId: 7,
                    size: 6
                })
                .end((err: any, res: any) => {
                    expect(res).to.have.status(200);
                    expect(res.body).length(6);
                    done();
                })
        })

        it('Should return 1 specific entity', (done) => {
            chai.request(serverURI).get("/api/activity")
                .query({
                    fileId: 12,
                    size: 5,
                    from: 0
                })
                .end((err: any, res: any) => {
                    expect(res).to.have.status(200);
                    expect(res.body).length(1);
                    expect(res.body[0].fileId).is.eq(12);
                    expect(res.body[0].type).is.eq(ActivityType.CREATED.toString());
                    done();
                })
        })
    });

    describe("Route POST /api/activity/_count", () => {
        it("Should fail because no 'fileIds' filed in request body was specified", (done) => {
            chai.request(serverURI).post("/api/activity/_counts")
                .end((err: any, res: any) => {
                    expect(res).to.have.status(400);
                    expect(res.body.errorMessage).is.eq("'fileIds' param is missing");
                    done();
                })
        })

        it("Should be empty object returned because such fileIds don't exist", (done) => {
            chai.request(serverURI).post("/api/activity/_counts")
                .send({
                    fileIds: ["hgj", 200, 112, "%4"]
                })
                .end((err: any, res: any) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object').that.is.empty;
                    done();
                })
        })

        it("Should be an object with specific values", (done) => {
            chai.request(serverURI).post("/api/activity/_counts")
                .send({
                    fileIds: [7, 11, 12]
                })
                .end((err: any, res: any) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('fileId_7').that.eq(54);
                    expect(res.body).to.have.property('fileId_11').that.eq(1);
                    expect(res.body).to.have.property('fileId_12').that.eq(1);
                    done();
                })
        })
    })
});