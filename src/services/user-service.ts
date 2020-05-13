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
 * 
 */
export class UserService {
    constructor(private userRepo: UserRepository) {
        this.userRepo = userRepo;
    }

    /**
     * 
     */
    async getAllUsers(): Promise<User[]> {

        let users = await this.userRepo.getAll();

        if (users.length == 0) {
            throw new ResourceNotFoundError();
        }
        return users.map(this.removePassword);
    }

    /**
     * 
     * @param id 
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
     * 
     * @param queryObj 
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

            // throw error if key value is not valid
            if(!isValidId(val)) {
                throw new BadRequestError();
            }

            let user = await this.userRepo.getUserByUniqueKey(key, val);
            
            if(isEmptyObject(user)) {
                throw new ResourceNotFoundError();
            }

            return this.removePassword(user);

        } catch (e) {
        throw e;
        }
    }

    /**
     * 
     * @param un 
     * @param pw 
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
     * 
     * @param newUser 
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
     * 
     * @param updatedUser 
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
     * 
     * @param id 
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
     * 
     * @param username 
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
     * 
     * @param email 
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
     * 
     * @param user 
     */
    private removePassword(user: User): User {
        if (!user || !user.password) return user;
        let usr = {...user};
        delete usr.password;
        return usr;
    }
}