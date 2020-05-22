import { Request, Response } from "express";

export function corsFilter(req: Request, resp: Response, next) {
    resp.header('Access-Control-Allow-Origin', '*');
    resp.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    resp.header('Access-Control-Allow-Credentials', 'true');
    resp.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');

    //return request with status 200 if it is an OPTIONS request
    if (req.method === 'OPTIONS') {
        resp.sendStatus(200);
    } else {
        next(); // passes the req and resp to the next middleware (or router)
    }
}