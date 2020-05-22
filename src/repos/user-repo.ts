import { User } from '../models/user';
import { CrudRepository } from './crud-repo';
import { InternalServerError } from '../errors/errors';
import { PoolClient } from 'pg';
import { connectionPool } from '..';
import { mapUserResultSet,  } from '../util/result-set-mapper';

export class UserRepository implements CrudRepository<User> {

    baseQuery = `
        select 
            eu.ers_user_id as id,
            eu.username,
            eu.password,
            eu.first_name,
            eu.last_name,
            eu.email,
            ro.role_name as role_name
        from ers_users eu 
        join ers_user_roles ro 
        on eu.user_role_id = ro.role_id                 
    `;
    
    /**
     * gets all users 
     * @returns an array of all users
     */
    async getAll(): Promise<User[]> {

        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery} order by eu.ers_user_id`;
            let rs = await client.query(sql); 
            return rs.rows.map(mapUserResultSet);
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release()
        }
    }       

    /**
     * gets the user that matches the provided Id
     * @param id 
     * @returns the user object who matches the provided id
     */
    async getById(id: number): Promise<User> {
        let client: PoolClient;
        try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery} where eu.ers_user_id = $1`;
            let rs = await client.query(sql, [id]);
            return mapUserResultSet(rs.rows[0]);
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }    
    }
    
    /**
     * gets an user that matches the key and val provided
     * @param key 
     * @param val 
     * @returns an user object that matches the provided params
     */
    async getUserByUniqueKey(key: string, val: string): Promise<User> {
        let client: PoolClient;
        
        try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery} where eu.${key} = $1`;

            //console.log('b4 rs');
            let rs = await client.query(sql, [val]);
            
            //console.log('after rs');

            return mapUserResultSet(rs.rows[0]);
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    }

    /**
   

    /**
     * gets user when provided a username and password
     * @param un 
     * @param pw 
     * @returns user object that matches provided credentials
     */
    async getUserByCredentials(un: string, pw: string) {
        
       let client: PoolClient;

       try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery} where eu.username = $1 and eu.password = $2`;
            let rs = await client.query(sql, [un, pw]);
            return mapUserResultSet(rs.rows[0]);
       } catch (e) {
           throw new InternalServerError();
       } finally {
           client && client.release();
       }
    
    }

    /**
     * adds a new user to the database
     * @param newUser 
     * @returns new user
     */
    async save(newUser: User): Promise<User> {
            
        let client: PoolClient;
        
        try {
            client = await connectionPool.connect();

            //let role_id = (await client.query('select role_id from ers_user_roles where role_name = $1', [newUser.role_name])).rows[0].role_id;

            //console.log(role_id);
            console.log('here')
            let sql = `insert into ers_users (username, password, first_name, last_name, email, user_role_id) 
            values ($1, $2, $3, $4, $5, ( select role_id from ers_user_roles where role_name = $6 ) )` ;

                console.log('here too');

            let rs = (await client.query(sql, [newUser.username, newUser.password, 
                newUser.first_name, newUser.last_name, newUser.email, newUser.role_name]));

                console.log('also here')
            newUser.role_name = rs.rows[0].role_name;

            return newUser;

        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    
    }

    /**
     * updates an existing user matching the provided id
     * @param updatedUser 
     * @returns true
     */
    async update(updatedUser: User): Promise<boolean> {
        
        let client: PoolClient;

        let role_id = (await client.query('select role_id from ers_roles where role_name = $1', [updatedUser.role_name])).rows[0].ers_role_id;
        
        try {
            client = await connectionPool.connect();
            let sql = `update ers_users set (username, password, first_name, last_name, 
                 email, user_role_id) = ($1, $2, $3, $4, $5, $6) where ers_user_id = ${updatedUser}.id`;
                
            let rs = await client.query(sql, [updatedUser.username, updatedUser.password, 
                updatedUser.first_name, updatedUser.last_name, updatedUser.email, role_id]);

            return true;
            
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    }

    /**
     * deletes the user that matches the provided id
     * @param id 
     * @returns true
     */
    async deleteById(id: number): Promise<boolean> {

        let client: PoolClient;
            
         try {
             client = await connectionPool.connect();
             let sql = 'delete from ers_users where ers_user_id = $1';
             await client.query(sql, [id]);                
             return true;
             
         } catch (e) {
            throw new InternalServerError();
        }  finally {
             client && client.release();
         }
    }
}
