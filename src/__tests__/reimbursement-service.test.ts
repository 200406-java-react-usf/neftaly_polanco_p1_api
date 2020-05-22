
import Validator from '../util/validator';
import {
    ResourceNotFoundError,
    BadRequestError,
    AuthenticationError,
    ResourcePersistenceError,
    NotImplementedError
} from '../errors/errors';
import { ReimbursementService } from '../services/reimbursement-service';
import { Reimbursement } from '../models/reimbursement';

jest.mock('../repos/reimbursement-repo', () => {

    return new class ReimbursementRepository {
        getAll = jest.fn();
        getById = jest.fn();
        getReimbursementByUniqueKey = jest.fn();
        save = jest.fn();
        update = jest.fn();
        deleteById = jest.fn();
        getReimbursementByFilter = jest.fn();
    }

});
describe('ReimbursementService', () => {

    let sut: ReimbursementService;
    let mockRepo;
    let date = new Date();
    let mockReimbursements = [
        new Reimbursement(1, 100, date, date, 'text', 'reciept', 'author-test', 'resv-test', 'pending', 'food'),
        new Reimbursement(2, 200, date, date, 'text', 'reciept', 'author-test', 'resv-test', 'approved', 'food'),
        new Reimbursement(3, 300, date, date, 'text', 'reciept', 'author-test', 'resv-test', 'approved', 'food'),
        new Reimbursement(4, 400, date, date, 'text', 'reciept', 'author-test', 'resv-test', 'approved', 'food'),
        new Reimbursement(5, 500, date, date, 'text', 'reciept', 'author-test', 'resv-test', 'approved', 'food')
    ];

    beforeEach(() => {

        mockRepo = jest.fn(() => {
            return {
                getAll: jest.fn(),
                getById: jest.fn(),
                getReimbursementByUniqueKey: jest.fn(),
                save: jest.fn(),
                update: jest.fn(),
                deleteById: jest.fn()
            }
        });

        // @ts-ignore
        sut = new ReimbursementService(mockRepo);

    });
    // get all -no resource error
    test('should resolve to getAllReimbursements[] (without passwords) when getAllgetAllReimbursements() successfully retrieves getAllReimbursements from the data source', async () => {

        // Arrange
        expect.hasAssertions();
        mockRepo.getAll = jest.fn().mockReturnValue(mockReimbursements);

        // Act
        let result = await sut.getAllReimbursements();

        // Assert
        expect(result).toBeTruthy();
        expect(result.length).toBe(5);
    });

    test('should reject with ResourceNotFoundError when getAllgetAllReimbursements fails to get any getAllReimbursements from the data source', async () => {

        // Arrange
        expect.assertions(1);
        mockRepo.getAll = jest.fn().mockReturnValue([]);

        // Act
        try {
            await sut.getAllReimbursements();
        } catch (e) {

            // Assert
            expect(e instanceof ResourceNotFoundError).toBe(true);
        }

    });

    // get by id - bad req, no resource
    test('should resolve to Reimbursement when getReimbursementById is given a valid an known id', async () => {

        // Arrange
        expect.assertions(2);

        Validator.isValidId = jest.fn().mockReturnValue(true);

        mockRepo.getById = jest.fn().mockImplementation((id: number) => {
            return new Promise<Reimbursement>((resolve) => resolve(mockReimbursements[id - 1]));
        });


        // Act
        let result = await sut.getReimbursementById(1);

        // Assert
        expect(result).toBeTruthy();
        expect(result.id).toBe(1);
    });

    test('should reject with BadRequestError when getReimbursementById is given a invalid value as an id (decimal)', async () => {

        // Arrange
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(false);

        // Act
        try {
            await sut.getReimbursementById(3.14);
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

    test('should reject with BadRequestError when getReimbursementById is given a invalid value as an id (zero)', async () => {

        // Arrange
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(false);

        // Act
        try {
            await sut.getReimbursementById(0);
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

    test('should reject with BadRequestError when getReimbursementById is given a invalid value as an id (NaN)', async () => {

        // Arrange
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(false);

        // Act
        try {
            await sut.getReimbursementById(NaN);
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

    test('should reject with BadRequestError when getReimbursementById is given a invalid value as an id (negative)', async () => {

        // Arrange
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(false);

        // Act
        try {
            await sut.getReimbursementById(-2);
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

    test('should reject with ResourceNotFoundError if getReimbursementById is given an unknown id', async () => {

        // Arrange
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(true);

        // Act
        try {
            await sut.getReimbursementById(9999);
        } catch (e) {

            // Assert
            expect(e instanceof ResourceNotFoundError).toBe(true);
        }

    });

    //get by key, return list - bad req, no resource
    test('should resolve to Reimbursement when getReimbursementByUniqueKey is given a valid an known key(Reimbursementname)', async () => {

        // Arrange
        expect.assertions(2);

        Validator.isPropertyOf = jest.fn().mockReturnValue(true);
        Validator.isEmptyObject = jest.fn().mockReturnValue(false);
        Validator.isValidId = jest.fn().mockReturnValue(true);

        mockRepo.getReimbursementByUniqueKey = jest.fn().mockImplementation((key: string, val: any) => {
            return new Promise<Reimbursement>((resolve) => {
                resolve(mockReimbursements.find(user => user[key] === val));
            });
        });

        // Act
        let query = {
            amount: 100
        }
        let result = await sut.getReimbursementByUniqueKey(query);

        // Assert
        expect(result).toBeTruthy();
        expect(result.id).toBe(1);
    });

    test('should resolve to Reimbursement when getReimbursementByUniqueKey is given id', async () => {

        // Arrange
        expect.assertions(2);

        Validator.isPropertyOf = jest.fn().mockReturnValue(true);
        Validator.isEmptyObject = jest.fn().mockReturnValue(false);
        Validator.isValidId = jest.fn().mockReturnValue(true);
        mockRepo.getById = jest.fn().mockReturnValue(mockReimbursements[0]);

        mockRepo.getReimbursementByUniqueKey = jest.fn().mockImplementation((key: string, val: any) => {
            return new Promise<Reimbursement>((resolve) => {
                resolve(mockReimbursements.find(user => user[key] === +val));
            });
        });

        // Act
        let query = {
            id: 1
        }
        let result = await sut.getReimbursementByUniqueKey(query);

        // Assert
        expect(result).toBeTruthy();
        expect(result.id).toBe(1);
    });

    test('should reject with BadRequestError if invalid key', async () => {

        // Arrange
        expect.hasAssertions();
        Validator.isPropertyOf = jest.fn().mockReturnValue(false);
        Validator.isEmptyObject = jest.fn().mockReturnValue(false);
        Validator.isValidId = jest.fn().mockReturnValue(true);
        mockRepo.getReimbursementByUniqueKey = jest.fn().mockImplementation((key: string, val: any) => {
            return new Promise<Reimbursement>((resolve) => {
                resolve(mockReimbursements.find(user => user[key] === val));
            });
        });


        // Act
        let query = {
            test: 'aanderson'
        }
        try {
            await sut.getReimbursementByUniqueKey(query);
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

    test('should reject with BadRequestError if repo return false', async () => {

        // Arrange
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(false);

        // Act
        let query = {
            Reimbursementname: 'aanderson'
        }
        try {
            await sut.getReimbursementByUniqueKey(query);
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

    test('should reject with BadRequestError if valid key but no result', async () => {

        // Arrange
        expect.hasAssertions();
        Validator.isPropertyOf = jest.fn().mockReturnValue(true);
        Validator.isValidStrings = jest.fn().mockReturnValue(true);
        Validator.isEmptyObject = jest.fn().mockReturnValue({});
        mockRepo.getReimbursementByUniqueKey = jest.fn().mockImplementation(() => {
            return new Promise<Reimbursement>((resolve) => {
                resolve({} as Reimbursement);
            });
        });
        // Act
        let query = {
            amount: 999
        }
        try {
            await sut.getReimbursementByUniqueKey(query);
        } catch (e) {

            // Assert
            expect(e instanceof ResourceNotFoundError).toBe(true);
        }



    });
    // submit save - bad req
    test('should save to Reimbursement', async () => {

        // Arrange
        expect.assertions(2);
        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(true);
        mockRepo.save = jest.fn().mockImplementation((newReimbursement: Reimbursement) => {
            return new Promise<Reimbursement>((resolve) => {
                mockReimbursements.push(newReimbursement);
                resolve(newReimbursement);
            });
        });

        // Act
        let newReimbursement = new Reimbursement(6, 500, date, date, 'text', 'reciept', 'author-test', 'resv-test', 'approved', 'food');
        let result = await sut.addNewReimbursement(newReimbursement);
        // Assert
        expect(result).toBeTruthy();
        expect(result.id).toBe(6);
    });
    test('should reject with BadRequestError if invalid reimbursement', async () => {

        // Arrange
        expect.hasAssertions();
        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(true);
        mockRepo.save = jest.fn().mockImplementation((newReimbursement: Reimbursement) => {
            return new Promise<Reimbursement>((resolve) => {
                mockReimbursements.push(newReimbursement);
                resolve(newReimbursement);
            });
        });

        // Act
        let newReimbursement = new Reimbursement(6, 500, date, null, 'text', 'reciept', 'author-test', 'resv-test', 'approved', null);

        try {
            await sut.addNewReimbursement(newReimbursement);
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });
    // approve or deny - bad req, no return
    test('should update to Reimbursement approve', async () => {

        // Arrange
        expect.hasAssertions();

        Validator.isValidId = jest.fn().mockReturnValue(true);
        mockReimbursements[0].reimb_status = 'pending'
        mockRepo.update = jest.fn().mockReturnValue(mockReimbursements[0]);

        // Act
        //arg: id, author, status
        let result = await sut.updateReimbursement(mockReimbursements[0]);

        // Assert
        expect(result).toBeTruthy();
    });

    test('should reject with BadRequestError if invalid id', async () => {

        // Arrange
        //expect.hasAssertions();
        Validator.isValidId = jest.fn().mockReturnValue(false);
        mockReimbursements[0].reimb_status = 'approved';
        mockRepo.update = jest.fn().mockReturnValue({});

        // Act
        let newReimbursement = new Reimbursement(7, 500, date, date, 'text', 'reciept', 'author-test', 'resv-test', 'approved', 'food');

        try {
            await sut.updateReimbursement(newReimbursement);
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });
    test('should reject with ResourcePersistenceError if invalid status', async () => {

        // Arrange
        expect.hasAssertions();
        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(true);
        mockRepo.update = jest.fn().mockReturnValue(mockReimbursements[0]);
        // Act

        let newReimbursement = new Reimbursement(6, 500, date, date, 'text', 'reciept', 'author-test', 'resv-test', null, 'food');

        try {
            await sut.updateReimbursement(newReimbursement);
        } catch (e) {
            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });
    test('should reject with ResourcePersistenceError if invalid reimbursement', async () => {

        // Arrange
        expect.hasAssertions();
        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(false);
        mockRepo.update = jest.fn().mockReturnValue(mockReimbursements[0]);
        // Act

        let newReimbursement = new Reimbursement(6, 500, date, date, 'text', 'reciept', 'author-test', 'resv-test', null, 'food');

        try {
            await sut.updateReimbursement(newReimbursement);
        } catch (e) {
            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

    test('should reject with ResourcePersistenceError if invalid id', async () => {

        // Arrange
        expect.hasAssertions();
        Validator.isValidId = jest.fn().mockReturnValue(false);
        Validator.isValidObject = jest.fn().mockReturnValue(true);
        mockRepo.update = jest.fn().mockReturnValue(mockReimbursements[0]);
        // Act

        let newReimbursement = new Reimbursement(null, 500, date, date, 'text', 'reciept', 'author-test', 'resv-test', null, 'food');

        try {
            await sut.updateReimbursement(newReimbursement);
        } catch (e) {
            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

   
    test('should return true when deleteById is invoked with a valid id', async () => {
        // Arrange
        expect.assertions(1);
        mockRepo.deleteById = jest.fn().mockReturnValue(mockReimbursements);

        let result = await sut.deleteById(1)
        expect(result).toBeTruthy()
    });

    test('should reject with bad request error when deleteById is invoked with an invalid id', async () => {
        // Arrange
        expect.assertions(1);
        mockRepo.deleteById = jest.fn().mockReturnValue(mockReimbursements);

        try {
            await sut.deleteById(NaN);
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

    test('should filter Reimbursement with status and type', async () => {

        // Arrange
        expect.assertions(2);
        mockRepo.getReimbursementByFilter = jest.fn().mockReturnValue(mockReimbursements);
        
        let query = {
            status: "pending",
            type: "food"
        }
        // Act
        let result = await sut.filterReimb(1);
        // Assert
        expect(result).toBeTruthy();
        expect(result.length).toBe(6);

    });
});