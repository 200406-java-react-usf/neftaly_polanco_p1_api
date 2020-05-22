import { Request, Response } from "express";
import { AuthenticationError, AuthorizationError } from "../errors/errors";

export const adminGuard = (request: Request, response: Response, next) => {
    if(!request.session.principal) {
        response.status(401).json(new AuthenticationError('No session found! Please provide valid login information.'));
    } else if(request.session.principal.role_name == 'ADMIN' ) {
        next();
    } else {
        response.status(403).json(new AuthorizationError());
    }
}

export const FMGuard = (request: Request, response: Response, next) => {
    if(!request.session.principal) {
        response.status(401).json(new AuthenticationError('No session found! Please provide valid login information.'));
    } else if(request.session.principal.role_name == 'FINANCIAL MANAGER') {
        next();
    } else {
        response.status(403).json(new AuthorizationError());
    }
};

export const EmpGuard = (request: Request, response: Response, next) => {
    if(!request.session.principal) {
        response.status(401).json(new AuthenticationError('No session found! Please provide valid login information.'));
    } else if(request.session.principal.role_name == 'EMPLOYEE' || request.session.principal.role_name == 'FINANCIAL MANAGER') {
        next();
    } else {
        response.status(403).json(new AuthorizationError());
    }
};