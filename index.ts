import * as express from 'express';
import * as crypto from 'crypto';
import { promisify } from "util";


const app = express();
const serverInstance = crypto.randomBytes(8).toString('hex');

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const USE_REDIS = process.env.USE_REDIS || false;


app.get("/health", (req, res, next) => {
    console.log("health check");
    res.sendStatus(200);
}); 

if(!USE_REDIS) {
    noRedis();
} else {
    useRedis();
}


function noRedis() {
    
    let count = 0
    app.get("/", (req, res, next) => {
        console.log("I got hit", req.headers);
        count++;
        res.send(JSON.stringify({serverInstance, count}));
    })
}

function useRedis() {
    let redis = require('redis'), client = redis.createClient({
        port: REDIS_PORT,
        host: REDIS_HOST,
    });
    const getAsync = promisify(client.get).bind(client);
    const keysAync = promisify(client.keys).bind(client);
    let count = 0;
    app.get("/", (req, res, next) => {
        console.log("I got hit", req.headers);
        count++;
        //update hit count
        client.set(serverInstance, count, (err: any) => {
            if (err) {
                console.log(err);
            }
        });

        //get all keys from db (as the variable 'values') and send it back in response
        let data: any = [];
        keysAync("*").then((keys: any) => {
            return Promise.all(keys.map((key: any) => {
                return getAsync(key).then((value: any) => Promise.resolve(({ "InstanceId": key, "count": value })));
            }));
        }).then((values: any) => {
            res.send(JSON.stringify({ serverInstance, count, values }));
        });
    });
}


app.listen(80, () => {
    console.log("Listening on 80");
});