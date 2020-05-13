import { Reimbursement } from '../models/reimbursement';
import { ReimbursementRepository }  from '../repos/reimbursement-repo';
import { 
    isValidId, 
    isValidObject, 
    isEmptyObject, 
    isPropertyOf
} from '../util/validator';
import { BadRequestError,  ResourceNotFoundError } from '../errors/errors';

/**
 * 
 */
export class ReimbursementService {
    
    constructor(private reimbursementRepo: ReimbursementRepository) {
        this.reimbursementRepo = reimbursementRepo;
    }

    /**
     * 
     */
    async getAllReimbursements(): Promise<Reimbursement[]> {

        let reimbursements = await this.reimbursementRepo.getAll();

        if (reimbursements.length == 0) {
            throw new ResourceNotFoundError();
        }

        return reimbursements;

    }

    /**
     * 
     * @param id 
     */
    async getReimbursementById(id: number): Promise<Reimbursement> {

        try {

            if (!isValidId(id)) {
                throw new BadRequestError();
            }

            let reimbursement = {...await this.reimbursementRepo.getById(id)};

            if (isEmptyObject(reimbursement)) {
                throw new ResourceNotFoundError();
            }

            return reimbursement;

        } catch (e) {
            throw e;
        }

    }

    /**
     * 
     * @param queryObj 
     */
    async getReimbursementByUniqueKey(queryObj: any): Promise<Reimbursement> {

        try {
            let queryKeys = Object.keys(queryObj);

            if(!queryKeys.every(key => isPropertyOf(key, Reimbursement))) {
                throw new BadRequestError();
            }

            //searching by only one key (at least for now)
            let key = queryKeys[0];
            let val = queryObj[key];

            //reuse getById logic if given key is id
            if (key === 'id') {
                return await this.getReimbursementById(+val);
            }

            // throw error if key value is not valid
            if(!isValidId(val)) {
                throw new BadRequestError();
            }

            let reimbursement = await this.reimbursementRepo.getReimbursementByUniqueKey(key, val);
            
            if(isEmptyObject(reimbursement)) {
                throw new ResourceNotFoundError();
            }

            return reimbursement;

        } catch (e) {
        throw e;
        }
    }

    /**
     * 
     * @param newReimbursement 
     */
    async addNewReimbursement(newReimbursement: Reimbursement): Promise<Reimbursement> {
            
        try {

            if (!isValidObject(newReimbursement, 'id')) {
                throw new BadRequestError('Invalid property values found in provided reimbursement.');
            }

            const persistedReimbursement = await this.reimbursementRepo.save(newReimbursement);
            
            return persistedReimbursement;
        } catch (e) {
            throw e;
        }

    }

    /**
     * 
     * @param id 
     * @param updatedReimbursement 
     */
    async updateReimbursement(updatedReimbursement: Reimbursement): Promise<boolean> {
        
        if (!isValidObject(updatedReimbursement)) {
            throw new BadRequestError('Invalid reimbursement provided.');
        }
        
        return await this.reimbursementRepo.update(updatedReimbursement);

    }

    /**
     * 
     * @param id 
     */
    async deleteById(id: number): Promise<boolean> {
        
        if(!isValidId(id)) {
            throw new BadRequestError();
        }

        return await this.reimbursementRepo.deleteById(id);

    }
}