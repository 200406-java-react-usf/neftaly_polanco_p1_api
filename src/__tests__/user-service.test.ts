import { UserService } from '../services/user-service';
import { UserRepository } from '../repos/user-repo';
import { User } from '../models/user';
import Validator from '../util/validator';
import {
    ResourceNotFoundError,
    BadRequestError,
    AuthenticationError,
    ResourcePersistenceError,
    
} from '../errors/errors';

jest.mock('../repos/user-repo', () => {

    return new class UserRepository {
        getAll = jest.fn();
        getById = jest.fn();
        getUserByUniqueKey = jest.fn();
        getUserByCredentials = jest.fn();
        save = jest.fn();
        update = jest.fn();
        deleteById = jest.fn();
    }

});
describe('userService', () => {

    let sut: UserService;
    let mockRepo;

    let mockUsers = [
        new User(1, 'aanderson', 'password', 'Alice', 'Anderson', 'aanderson@revature.com', 'Admin'),
        new User(2, 'bbailey', 'password', 'Bob', 'Bailey', 'bbailey@revature.com', 'Employee'),
        new User(3, 'lreddick', 'password', 'Lance', 'Reddick', 'lreddick@gmail.com', 'Employee'),
        new User(4, 'haaron', 'password', 'Henry', 'Aaron', 'haaron@gmail.com', 'Employee'),
        new User(5, 'jce', 'password', 'James', 'Ace', 'jace@mtg.com', 'Manager')
    ];

    beforeEach(() => {

        mockRepo = jest.fn(() => {
            return {
                getAll: jest.fn(),
                getById: jest.fn(),
                getUserByUniqueKey: jest.fn(),
                getUserByCredentials: jest.fn(),
                save: jest.fn(),
                update: jest.fn(),
                deleteById: jest.fn()
            }
        });

        // @ts-ignore
        sut = new UserService(mockRepo);

    });

    test('should resolve to User[] (without passwords) when getAllUsers() successfully retrieves users from the data source', async () => {

        // Arrange
        expect.hasAssertions();
        mockRepo.getAll = jest.fn().mockReturnValue(mockUsers);

        // Act
        let result = await sut.getAllUsers();

        // Assert
        expect(result).toBeTruthy();
        expect(result.length).toBe(5);
    });

    test('should reject with ResourceNotFoundError when getAllUsers fails to get any users from the data source', async () => {

        // Arrange
        expect.assertions(1);
        mockRepo.getAll = jest.fn().mockReturnValue([]);

        // Act
        try {
            await sut.getAllUsers();
        } catch (e) {

            // Assert
            expect(e instanceof ResourceNotFoundError).toBe(true);
        }

    });

    test('should resolve to User when getUserById is given a valid and known id', async () => {

        // Arrange
        expect.assertions(2);

        Validator.isValidId = jest.fn().mockReturnValue(true);

        mockRepo.getById = jest.fn().mockImplementation((id: number) => {
            return new Promise<User>((resolve) => resolve(mockUsers[id - 1]));
        });


        // Act
        let result = await sut.getUserById(1);

        // Assert
        expect(result).toBeTruthy();
        expect(result.id).toBe(1);
    });

    test('should reject with BadRequestError when getUserById is given deecimal as id', async () => {

        // Arrange
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(false);

        // Act
        try {
            await sut.getUserById(3.14);
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

    test('should reject with BadRequestError when getUserById is given 0 as a value', async () => {

        // Arrange
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(false);

        // Act
        try {
            await sut.getUserById(0);
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

    test('should reject with BadRequestError when getUserById is given NaN as value', async () => {

        // Arrange
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(false);

        // Act
        try {
            await sut.getUserById(NaN);
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

    test('should reject with BadRequestError when getUserById is given negative number as a value', async () => {

        // Arrange
        expect.assertions(1);
        mockRepo.getById = jest.fn().mockReturnValue(false);

        // Act
        try {
            await sut.getUserById(-3);
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

    
    test('should reject with ResourceNotFoundError if getUserByid is given an unknown id', async () => {

        // Arrange
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(true);

        // Act
        try {
            await sut.getUserById(7);
        } catch (e) {

            // Assert
            expect(e instanceof ResourceNotFoundError).toBe(true);
        }

    });

    test('should resolve to User when getUserByUniqueKey is given a valid and known key and value', async () => {

        // Arrange
        expect.assertions(2);
        Validator.isPropertyOf = jest.fn().mockReturnValue(true);
        Validator.isValidStrings = jest.fn().mockReturnValue(true);
        Validator.isEmptyObject = jest.fn().mockReturnValue(false);
        Validator.isValidId = jest.fn().mockReturnValue(true);

        mockRepo.getUserByUniqueKey = jest.fn().mockImplementation((key: string, val: string) => {
            return new Promise<User>((resolve) => {
                resolve(mockUsers.find(user => user[key] === val));
            });
        });

        // Act
        let queryObj = {
            username: 'aanderson'
        }
        let result = await sut.getUserByUniqueKey(queryObj);

        // Assert
        expect(result).toBeTruthy();
        expect(result.username).toBe('aanderson');
    });  
       
    test('should reject with BadRequestError if getUserByUniqueKey is provided an invalid key', async () => {

        // Arrange
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(true);

        // Act
        let queryobj = {
            testing: 'lreddick'
        }
        try {
            await sut.getUserByUniqueKey(queryobj);
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

    test('should reject with ResourceNotFoundError if provided a valid key, and an unknown value', async () => {

        // Arrange
        expect.hasAssertions();
        Validator.isPropertyOf = jest.fn().mockReturnValue(true);
        Validator.isValidStrings = jest.fn().mockReturnValue(true);
        Validator.isEmptyObject = jest.fn().mockReturnValue({});
        mockRepo.getUserByUniqueKey = jest.fn().mockImplementation(() => {
            return new Promise<User>((resolve) => {
                resolve({} as User);
            });
        });
        // Act
        let queryobj = {
            username: 'abcde'
        }
        try {
            await sut.getUserByUniqueKey(queryobj);
        } catch (e) {

            // Assert
            expect(e instanceof ResourceNotFoundError).toBe(true);
        }


    });

    test('should resolve to User when authenticateUser is given a valid username and passwoord', async () => {
        // Arrange
        expect.assertions(2);

        Validator.isValidId = jest.fn().mockReturnValue(true);

        mockRepo.getUserByCredentials = jest.fn().mockImplementation((id: number) => {
            return new Promise<User>((resolve) => resolve(mockUsers[0]));
        });

        // Act
        let result = await sut.authenticateUser('username', 'password');

        // Assert
        expect(result).toBeTruthy();
        expect(result.id).toBe(1);
    });

    test('should reject with BadRequestErrorwhen authenticateUser is given a invalid a falsy value for username', async () => {
        // Arrange
        expect.hasAssertions();

        // Act
        try {
            await sut.authenticateUser('', 'password');
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }
    });

    test('should reject with BadRequestErrorwhen authenticateUser is given a invalid a falsy value for password', async () => {
        // Arrange
        expect.hasAssertions();

        // Act
        try {
            await sut.authenticateUser('username', '');
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }
    });

    test('should reject with Authentication Error when authenticate user is provided with wrong password', async () => {
        // Arrange
        expect.hasAssertions();

        Validator.isValidId = jest.fn().mockReturnValue(false);
        mockRepo.getUserByCredentials = jest.fn().mockReturnValue({});

        // Act
        try {
            await sut.authenticateUser('aanderson', 'passwor');
        } catch (e) {

            // Assert
            expect(e instanceof AuthenticationError).toBe(true);
        }
    });

    test('should reject with Authentication Error when authenticate user is provided with an wrong username', async () => {
        // Arrange
        expect.hasAssertions();

        Validator.isValidId = jest.fn().mockReturnValue(false);
        mockRepo.getUserByCredentials = jest.fn().mockReturnValue({});

        // Act
        try {
            await sut.authenticateUser('aanders', 'password');
        } catch (e) {

            // Assert
            expect(e instanceof AuthenticationError).toBe(true);
        }
    });

    test('should resolve to User when addNewUser is invoked with valid input', async () => {
        // Arrange
        expect.assertions(2);

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(true);
        mockRepo.save = jest.fn().mockImplementation((newUser: User) => {
            return new Promise<User>((resolve) => {
                mockUsers.push(newUser);
                resolve(newUser);
            });
        });

        // Act
        let newUser = new User(6, 'tester', 'testing', 'test', 'test', 'tester@gmail.com', 'User')
        let result = await sut.addNewUser(newUser);

        // Assert
        expect(result).toBeTruthy();
        expect(mockUsers.length).toBe(6);
    });

    test('should return bad request error when addNewUser is provided with a falsy user', async () => {
        // Arrange
        expect.hasAssertions();

        Validator.isValidId = jest.fn().mockReturnValue(false);
        Validator.isValidObject = jest.fn().mockReturnValue(true);
        mockRepo.save = jest.fn().mockReturnValue(mockUsers[5]);
        // Act
        try {

            let newUser = new User(6, null, 'password', 'test', 'test', 'test@revature.com', 'User')
            await sut.addNewUser(newUser);

        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);

        }
    });

    test('should return bad request error when addNewUser is provided with a falsy password', async () => {
        // Arrange
        expect.hasAssertions();

        Validator.isValidId = jest.fn().mockReturnValue(false);
        Validator.isValidObject = jest.fn().mockReturnValue(true);
        mockRepo.save = jest.fn().mockReturnValue(mockUsers[5]);
        // Act
        try {

            let newUser = new User(6, 'test', '', 'test', 'test', 'test@revature.com', 'User')
            await sut.addNewUser(newUser);

        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);

        }
    });

    test('should return bad request error if User already exists', async () => {
        // Arrange
        expect.hasAssertions();

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(true);
        mockRepo.getUserByUniqueKey = jest.fn().mockReturnValue(false);
        mockRepo.save = jest.fn().mockReturnValue(mockUsers[5]);

        // Act
        try {
            let newUser = new User(6, 'aanderson', 'password', 'test', 'test', 'test@revature.com', 'User')
            await sut.addNewUser(newUser);

        } catch (e) {
            // Assert
            expect(e instanceof ResourcePersistenceError).toBe(true);
        }
    });

    test('should return bad request error when addNewUser is provided with an existing email', async () => {
        // Arrange
        expect.hasAssertions();

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(true);
        mockRepo.getUserByUniqueKey = jest.fn().mockReturnValue(false);
        mockRepo.save = jest.fn().mockReturnValue(mockUsers[5]);

        // Act
        try {

            let newUser = new User(6, 'test', 'password', 'test', 'test', 'aanderson@gmail.com', 'User')
            await sut.addNewUser(newUser);

        } catch (e) {

            // Assert
            expect(e instanceof ResourcePersistenceError).toBe(true);

        }
    });

    test('should resolve to User when updateUser is called', async () => {
        // Arrange
        expect.hasAssertions();

        Validator.isValidObject = jest.fn().mockReturnValue(true);
        mockRepo.update = jest.fn().mockReturnValue(mockUsers[0]);
        // Act
        
        let result = await sut.updateUser(mockUsers[0]);

        // Assert
        expect(result).toBeTruthy();
    });

    test('should return bad request error when updateUser is provided bad data', async () => {
        // Arrange
        expect.hasAssertions();

        Validator.isValidObject = jest.fn().mockReturnValue(false);
        mockRepo.update = jest.fn().mockReturnValue(mockUsers[5]);

        // Act
        try {
            let updatedUser = new User(5, 'tester', '', 'testing', 'testa', 'tester@revature.com', 'test')
            await sut.updateUser(updatedUser);

        } catch (e) {
            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }
    });    

    test('should return true when deleteById is invoked', async () => {
        // Arrange
        expect.assertions(0);
        mockRepo.deleteById = jest.fn().mockReturnValue(true);

        // Act
        let result = await sut.deleteUserById(1);

        // Assert
        expect(result).toBeTruthy;
    });

    test('should return bad request error when delete by id is provided with NaN', async () => {
        // Arrange
        expect.assertions(0);
        mockRepo.deleteById = jest.fn().mockReturnValue(true);

        // Act
        
        try {
            await sut.deleteUserById(NaN);

        } catch (e) {
            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }
        
    });

});

