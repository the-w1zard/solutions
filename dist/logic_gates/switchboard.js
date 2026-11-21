export class SwitchboardRegistrationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SwitchboardRegistrationError';
    }
}
