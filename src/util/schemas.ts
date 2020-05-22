/**
 * 
 */
export interface UserSchema {
    id: number,
    username: string,
    password: string,
    first_name: string,
    last_name: string,
    email: string,
    role_name: string
}

/**
 * 
 */
export interface ReimbursementSchema {
    id: number;
    amount: number;
    submitted: Date;
    resolved: Date;
    description: string;
    receipt: string;
    author: string;
    resolver: string;
    reimb_status: string;
    reimb_type: string;
}