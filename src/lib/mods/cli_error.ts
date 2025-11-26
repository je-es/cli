// cli.ts
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class CLIError extends Error {
        constructor(message: string, public code: string = 'CLI_ERROR') {
            super(message);
            this.name = 'CLIError';
            Error.captureStackTrace?.(this, CLIError);
        }
    }

    export class ValidationError extends CLIError {
        constructor(message: string) {
            super(message, 'VALIDATION_ERROR');
            this.name = 'ValidationError';
        }
    }

    export class CommandNotFoundError extends CLIError {
        constructor(command: string) {
            super(`Command '${command}' not found`, 'COMMAND_NOT_FOUND');
            this.name = 'CommandNotFoundError';
        }
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝