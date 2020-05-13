import { UserRepository } from "../repos/user-repo";
import { UserService } from "../services/user-service";
import { ReimbursementRepository } from "../repos/reimbursement-repo";
import { ReimbursementService } from "../services/reimbursement-service";

const userRepo = new UserRepository();
const userService = new UserService(userRepo);

const reimbRepo = new ReimbursementRepository();
const reimbService = new ReimbursementService(reimbRepo);