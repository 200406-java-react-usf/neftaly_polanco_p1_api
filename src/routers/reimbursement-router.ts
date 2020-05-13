import url from 'url';
import express from 'express';
import AppConfig from '../config/app';
import { isEmptyObject } from '../util/validator';
import { adminGuard } from '../middleware/auth-middleware';

export const ReimbursementRouter = express.Router();

const reimbursementService = AppConfig.reimbursementService;

/**
 * 
 */
ReimbursementRouter.get('', async (req, resp) => {
    try {
        let reqURL = url.parse(req.url, true);
        if(!isEmptyObject(reqURL.query)) {
            let payload = await reimbursementService.getReimbursementByUniqueKey({...reqURL.query});
            resp.status(200).json(payload);
        } else {
            let payload = await reimbursementService.getAllReimbursements();
            resp.status(200).json(payload);
        }
    } catch (e) {
        resp.status(e.statusCode).json(e);
    }
});

/**
 * 
 */
ReimbursementRouter.get('/:id', async (req, resp) => {
    const id = +req.params.id;
    try {
        let payload = await reimbursementService.getReimbursementById(id);
        return resp.status(200).json(payload);
    } catch (e) {
        return resp.status(e.statusCode).json(e).send();
    }
});

/**
 * 
 */
ReimbursementRouter.post('', adminGuard, async (req, resp) => {

    console.log('REIMBURSEMENT POST REQUEST RECEIVED AT /reimbursements');
    console.log(req.body);
    try {
        let newReimbursement = await reimbursementService.addNewReimbursement(req.body);
        return resp.status(201).json(newReimbursement).send();
    } catch (e) {
        return resp.status(e.statusCode).json(e).send();
    }
});

/**
 * 
 */
ReimbursementRouter.put('/:id', adminGuard, async (req, resp) => {
    const id = +req.params.id;

    console.log('REIMBURSEMENT UPDATE REQUEST RECEIVED AT /reimbursements');
    console.log(req.body);
    try {
        let status = await reimbursementService.updateReimbursement(req.body);
        return resp.status(204).json(status).send();
    } catch (e) {
        return resp.status(e.statusCode).json(e).send();
    }
});

/**
 * 
 */
ReimbursementRouter.delete('/:id', adminGuard, async (req, resp) => {
    const id = +req.params.id;

    console.log('REIMBURSEMENT DELETE REQUEST RECEIVED AT /reimbursements');
    console.log(req.body);
    try {
        let status = await reimbursementService.deleteById(id);
        return resp.status(204).json(status).send();
    } catch (e) {
        return resp.status(e.statusCode).json(e).send();
    }
});