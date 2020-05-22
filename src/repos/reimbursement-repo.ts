import { Reimbursement } from '../models/reimbursement';
import { CrudRepository } from './crud-repo';
import { InternalServerError } from '../errors/errors';
import { PoolClient } from 'pg';
import { connectionPool } from '..';
import { mapReimbursementResultSet } from '../util/result-set-mapper';


export class ReimbursementRepository implements CrudRepository<Reimbursement> {

    baseQuery = `
    select
    er.reimb_id as id, 
    er.amount, 
    er.submitted, 
    er.resolved,
    er.description,
    er.receipt, 
    eu.username as author,
    eu2.username as resolver,
    ers.reimb_status as reimb_status,
    ert.reimb_type as reimb_type          

    from ers_reimbursements er

    left join ers_users eu
    on eu.ers_user_id = er.author_id
    
    left join ers_users eu2
    on eu2.ers_user_id = er.resolver_id
    
    left join ers_reimbursement_statuses ers
    on ers.reimb_status_id = er.reimb_status_id

    left join ers_reimbursement_types ert
    on ert.reimb_type_id = er.reimb_type_id                
    `;
    
  /**
   * gets all reimbursements
   * @returns all reimbursements
   */
    async getAll(): Promise<Reimbursement[]> {

        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            
            let sql = `${this.baseQuery}`;
            
            let rs = await client.query(sql); // rs = ResultSet
            
            return rs.rows.map(mapReimbursementResultSet);
        
        } catch (e) {
            //console.log(e);
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    
    }
    
    /**
     * gets a reimbursement by its Id
     * @param id 
     * @returns reimbursement by id
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
     * gets a reimbursement by unique key
     * @param key 
     * @param val 
     * @returns a reimbursement that matches the provided key and val
     */
    async getReimbursementByUniqueKey(key: string, val: any): Promise<Reimbursement> {
        let client: PoolClient;

        try {
            client = await connectionPool.connect();

            let val1;
            val1 = val;
            if(key === 'author') {
                key = 'author_id'
                val1 = (await client.query(`select eu.ers_user_id from ers_users eu where username = $1`, [val])).rows[0].ers_user_id;
            }
            if(key === 'resolver') {
                key = 'resolver_id'
                val1 = (await client.query(`select eu.ers_user_id from ers_users eu where username = $1`, [val])).rows[0].ers_user_id;
            }
            //console.log(val1)
            
            let sql = `${this.baseQuery} where er.${key} = $1`;
          
            
            let rs = await client.query(sql, [val1]);
            return mapReimbursementResultSet(rs.rows[0]);
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    }

    /* filters reimbursement by status and type
    * @param status 
    * @param type 
    */
   async getReimbursementByFilter(status?: any, type?: any): Promise<Reimbursement[]> {
       let client: PoolClient;
       try {
           client = await connectionPool.connect();
           if (status && type){

               let sql = `${this.baseQuery} where reimb_status = $1 and reimb_type = $2`;
               let rs = await client.query(sql, [status, type]);
               return rs.rows.map(mapReimbursementResultSet);
           }else if (status){

               let sql = `${this.baseQuery} where reimb_status = $1`;
               let rs = await client.query(sql, [status]);

               return rs.rows.map(mapReimbursementResultSet);
           }else if (type){
               let sql = `${this.baseQuery} where reimb_type = $1`;
               let rs = await client.query(sql, [type]);
               return rs.rows.map(mapReimbursementResultSet);
           }
          
           
       } catch (e) {
           throw new InternalServerError();
       } finally {
           client && client.release();
       }
   }

    /**
     * adds a new reimbursement to the database
     * @param newReimbursement
     * @returns the added reimbursement 
     */
    async save(newReimbursement: Reimbursement): Promise<Reimbursement> {
        let client: PoolClient;

        try {
            client = await connectionPool.connect();

            let reimb_type_id = (await client.query('select reimb_type_id from ers_reimbursement_types where reimb_type = $1', [newReimbursement.reimb_type])).rows[0].reimb_type_id;
            let author_id = (await client.query('select ers_user_id from ers_users where username = $1', [newReimbursement.author])).rows[0].ers_user_id;

            // console.log(author_id);
            // console.log(reimb_type_id);

            let sql = `
                insert into ers_reimbursements 
                (amount, description, author_id, reimb_type_id) 
                values ($1, $2, $3, $4)
            `;
            //console.log(newReimbursement);
            //console.log('b4 rs')
            await client.query(sql, [newReimbursement.amount, newReimbursement.description, 
                                         author_id, reimb_type_id]);
            //console.log(newReimbursement);
            

            return newReimbursement;

        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    }


    /**
     * updates an existing reimbursement
     * @param updatedReimbursement 
     * @returns the reimbursement with its values updated
     */
    async update(updatedReimbursement: Reimbursement): Promise<boolean> {
        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            
            let reimb_status_id = (await client.query('select reimb_status_id from ers_reimbursement_statuses where reimb_status = $1', [updatedReimbursement.reimb_status])).rows[0].reimb_status_id;
            let resolver_id = (await client.query('select ers_user_id from ers_users where username = $1', [updatedReimbursement.resolver])).rows[0].ers_user_id;

            // console.log(reimb_status_id);
            // console.log(resolver_id);
            // console.log(updatedReimbursement);

            let sql = `
                update ers_reimbursements
                    set description = $2, receipt = $3,
                    resolver_id = $4, reimb_status_id = $5 where reimb_id = $1
            `;

            // console.log(updatedReimbursement.id);

            await client.query(sql, [
                updatedReimbursement.id, updatedReimbursement.description, 
                updatedReimbursement.receipt, resolver_id, reimb_status_id 
            ]);

            //console.log(updatedReimbursement)
            return true;
            

        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    }

    /**
     * deletes a reimbursement with the provided Id
     * @param id 
     * @returns true
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