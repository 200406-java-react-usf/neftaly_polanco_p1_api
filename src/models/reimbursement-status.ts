export class ReimbursementStatus {

    id: number;
    reimb_status: string;

    constructor(id: number, reimb_status: string) {
        this.id = id;
        this.reimb_status = reimb_status;
    }
}