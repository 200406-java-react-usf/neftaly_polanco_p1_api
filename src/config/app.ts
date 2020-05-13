import { UserRepository } from "../repos/user-repo";
import { UserService } from "../services/user-service";
import { ReimbursementRepository } from "../repos/reimbursement-repo";
import { ReimbursementService } from "../services/reimbursement-service";

const userRepo = new UserRepository();
const userService = new UserService(userRepo);

const reimbRepo = new ReimbursementRepository();
const reimbursementService = new ReimbursementService(reimbRepo);

<<<<<<< HEAD
export {
    userService,
    reimbursementService
}
=======
export default {
    userService,
    reimbursementService
}
>>>>>>> 4d7016c86a4509448c9b9a51a04207a6ecfa73c9
