export class Role {
    
    role_id: number;
    role_name: string;

    constructor(init: number | string) {

        if (typeof init === 'number') {
            this.role_id = init;
            switch (init) {
                case 1: this.role_name = 'ADMIN'; break;
                case 2: this.role_name = 'FINANCIAL MANAGER'; break;
                case 3: this.role_name = 'EMPLOYEE'; break;
                default: 
                    this.role_id = 4;
                    this.role_name = 'Locked';
            }
        } 
        
        else if (typeof init === 'string') {
            this.role_name = init;
            switch (init.toLowerCase()) {
                case 'ADMIN': this.role_id = 1; break;
                case 'FINANCIAL MANAGER': this.role_id = 2; break;
                case 'EMPLOYEE': this.role_id = 3; break;
                default: 
                    this.role_id = 4;
                    this.role_name = 'Locked';
            }
        } 
        
        else {
            this.role_id = 4;
            this.role_name = 'Locked';
        }

    }

}