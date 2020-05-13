import { Reimbursement } from '../models/reimbursement';
import { CrudRepository } from './crud-repo';
import { InternalServerError } from '../errors/errors';
import { PoolClient } from 'pg';
import { connectionPool } from '..';
import { mapReimbursementResultSet } from '../util/result-set-mapper';

/**
 * 
 */
export class ReimbursementRepository implements CrudRepository<Reimbursement> {

    baseQuery = `
        select
            er.id, 
            er.amount, 
            er.submitted, 
            er.resolved,
            er.description,
            er.receipt,
            er.author_id,
            er.resolver_id,
            er.reimb_status_id,
            er.reimb_type_id
        from ers_reimbursements er
    `;
    
    /**
     * 
     */
    async getAll(): Promise<Reimbursement[]> {

        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            
            let sql = `${this.baseQuery}`;
            
            let rs = await client.query(sql); // rs = ResultSet
            
            return rs.rows.map(mapReimbursementResultSet);
        
        } catch (e) {
            console.log(e);
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    
    }
    
    /**
     * 
     * @param id 
     */
    async getById(id: number): Promise<Reimbursement> {
        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            
            let sql = `${this.baseQuery} where er.id = $1`;
            
            let rs = await client.query(sql, [id]);
            
            return mapReimbursementResultSet(rs.rows[0]);
        
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    }

    /**
     * 
     * @param newReimbursement 
     */
    async save(newReimbursement: Reimbursement): Promise<Reimbursement> {
        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            
            let sql = `
                insert into ers_reimbursements (amount, submitted, resolved, description, receipt, 
                    author_id, resolver_id, reimb_status_id, reimb_type_id) 
                values ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning id
            `;
            
            let rs = await client.query(sql, [newReimbursement.amount, newReimbursement.submitted, 
                                            newReimbursement.resolved, newReimbursement.description, 
                                            newReimbursement.receipt, newReimbursement.author, 
                                            newReimbursement.resolver, newReimbursement.reimb_status_id, 
                                            newReimbursement.reimb_type_id]);
            return mapReimbursementResultSet(rs.rows[0]);

        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    }

    /**
     * 
     * @param updatedReimbursement 
     */
    async update(updatedReimbursement: Reimbursement): Promise<boolean> {
        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            
            let sql = `
                update ers_reimbursement
                set amount = $2, submitted = $3, resolved = $4, description = $5, receipt = $6, author_id = $7, resolver_id = $8, reimb_status_id = $9, reimb_type_id = $10
                where ers_reimbursement.id = $1;
            `;

            await client.query(sql, [updatedReimbursement.amount, updatedReimbursement.submitted, 
                                    updatedReimbursement.resolved, updatedReimbursement.description, 
                                    updatedReimbursement.receipt, updatedReimbursement.author, 
                                    updatedReimbursement.resolver, updatedReimbursement.reimb_status_id, 
                                    updatedReimbursement.reimb_type_id]);
            return true;

        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    }

    /**
     * 
     * @param id 
     */
    async deleteById(id: number): Promise<boolean> {
        
        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `delete from ers_reimbursements where reimb_id = $1`;

            await client.query(sql, [id]);

            return true;

        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    }
};