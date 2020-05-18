import { User } from "../models/user";
import { UserRepository } from "../repos/user-repo";
import { isValidId, isEmptyObject, isPropertyOf, isValidObject, isValidStrings } from "../util/validator";
import {
    ResourceNotFoundError, 
    BadRequestError, 
    ResourcePersistenceError, 
    AuthenticationError 
} from "../errors/errors";


/**
 * a class with crud functionality for users
 */
export class UserService {
    constructor(private userRepo: UserRepository) {
        this.userRepo = userRepo;
    }

    /**
     * gets all users
     * @returns all users in the database
     */
    async getAllUsers(): Promise<User[]> {

        let users = await this.userRepo.getAll();

        if (users.length == 0) {
            throw new ResourceNotFoundError();
        }
        return users.map(this.removePassword);
    }

    /**
     * gets user by their Id
     * @param id 
     * @returns user object sans the password
     */
    async getUserById(id: number): Promise<User> {
        if (!isValidId(id)) {
            throw new BadRequestError();
        }

        let user = await this.userRepo.getById(id);

        //ensuring we did not get an empty object
        if(isEmptyObject(user)) {
            throw new ResourceNotFoundError();
        }

        return  this.removePassword(user);
    }

    /**
     * gets user when provided a unique key and value
     * @param queryObj 
     * @returns User without password
     */
    async getUserByUniqueKey(queryObj: any): Promise<User> {

        try {
            let queryKeys = Object.keys(queryObj);

            if(!queryKeys.every(key => isPropertyOf(key, User))) {
                throw new BadRequestError();
            }

            //searching by only one key (at least for now)
            let key = queryKeys[0];
            let val = queryObj[key];

            //reuse getById logic if given key is id
            if (key === 'id') {
                return await this.getUserById(+val);
            }

            let user = await this.userRepo.getUserByUniqueKey(key, val);
            console.log(user);
            
            if(isEmptyObject(user)) {
                throw new ResourceNotFoundError();
            }

            return this.removePassword(user);

        } catch (e) {
        throw e;
        }
    }

    /**
     * authenticates user to for login
     * @param un 
     * @param pw 
     * @returns authenticated user sans password
     */
    async authenticateUser(un: string, pw: string): Promise<User> {

        try {
            
            //making sure that password and username are valid strings
            if (!isValidStrings(un, pw)) {
                throw new BadRequestError();
            }

            let authUser: User;
            
            authUser = await this.userRepo.getUserByCredentials(un, pw);
           
            // making sure we did not get an empty object
            if (isEmptyObject(authUser)) {
                throw new AuthenticationError('Bad credentials provided.');
            }

            return this.removePassword(authUser);

        } catch (e) {
            throw e;
        }

    }

    /**
     * adds a new user
     * @param newUser 
     * @returns newUser
     */
    async addNewUser(newUser: User): Promise<User> {
        
        try {

            //making sure newUser object is valid
            if (!isValidObject(newUser, 'id')) {
                throw new BadRequestError('Invalid property values found in provided user.');
            }
            
            // checking that username is available
            let usernameAvailable = await this.isUsernameAvailable(newUser.username);

            if (!usernameAvailable) {
                throw new ResourcePersistenceError('The provided username is already taken.');
            }

            //checking that email is available        
            let emailAvailable = await this.isEmailAvailable(newUser.email);
    
            if (!emailAvailable) {
                throw new  ResourcePersistenceError('The provided email is already taken.');
            }
            
            newUser.role_name = 'Staff'; // all new registers have 'staff' role by default
            const persistedUser = await this.userRepo.save(newUser);

            return this.removePassword(persistedUser);

        } catch (e) {
            throw e
        }

    }

    /**
     * Updates exxisting user
     * @param updatedUser 
     * @returns updated user
     */
    async updateUser(updatedUser: User): Promise<boolean> {
        
        try {

            if (!isValidObject(updatedUser)) {
                throw new BadRequestError('Invalid User provided (invalid values found).');
            }

            return await this.userRepo.update(updatedUser);
        } catch (e) {
            throw e;
        }

    }

    /**
     * deletes user with the provided Id
     * @param id 
     * @returns true
     */
    async deleteUserById(id: number): Promise<boolean> {
        
        try {
           
           await this.userRepo.deleteById(id);
            
        } catch (e) {
            throw e;
        }
        return true;
    }

    /**
     * checks if username is in use
     * @param username 
     * @returns true if username is available or false if username is not available
     */
    private async isUsernameAvailable(username: string): Promise<boolean> {

        try {
            await this.getUserByUniqueKey({'username': username});
        } catch (e) {
            console.log('username is available')
            return true;
        }

        console.log('username is unavailable')
        return false;

    }

    /**
     * checks if email has been taken
     * @param email 
     * @returns true if email is available or false if it is not
     */
    private async isEmailAvailable(email: string): Promise<boolean> {
        
        try {
            await this.getUserByUniqueKey({'email': email});
        } catch (e) {
            console.log('email is available')
            return true;
        }

        console.log('email is unavailable')
        return false;
    }

    /**
     * removes password from the returned object
     * @param user 
     * @returns user without password
     */
    private removePassword(user: User): User {
        if (!user || !user.password) return user;
        let usr = {...user};
        delete usr.password;
        return usr;
    }
}