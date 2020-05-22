import { UserSchema } from "./schemas";
import { User } from "../models/user";
import { ReimbursementSchema } from "./schemas";
import { Reimbursement } from "../models/reimbursement";

/**
 * 
 * @param resultSet 
 */
export function mapUserResultSet(resultSet: UserSchema): User {
    
    if (!resultSet) {
        return {} as User;
    }

    return new User(
        resultSet.id,
        resultSet.username,
        resultSet.password,
        resultSet.firstName,
        resultSet.lastName,
        resultSet.email,
        resultSet.role_name
    );
}


/**
 * 
 * @param resultSet 
 */
export function mapReimbursementResultSet(resultSet: ReimbursementSchema): Reimbursement {
    
    if (!resultSet) {
        return {} as Reimbursement;
    }

    return new Reimbursement(
        resultSet.id,
        resultSet.amount,
        resultSet.submitted,
        resultSet.resolved,
        resultSet.description,
        resultSet.receipt,
        resultSet.author,
        resultSet.resolver,
        resultSet.reimb_status,
        resultSet.reimb_type
    );
}