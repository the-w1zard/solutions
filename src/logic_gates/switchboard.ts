export class SwitchboardRegistrationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'SwitchboardRegistrationError';
    }
  }
  