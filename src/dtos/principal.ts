export class Principal {
    id: number;
    username: string;
    role_name: string;

    constructor(id: number, un: string, role: string) {
        this.id = id
        this.username = un;
        this.role_name = role;
    }
}