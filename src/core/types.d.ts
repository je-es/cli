// src/core/types.d.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export interface CommandConfig<T = ParsedCommand> {
        name            : string;
        aliases?        : string[];
        description?    : string;
        args?           : ArgumentConfig[];
        options?        : OptionConfig[];
        action?         : (parsed: T) => void | Promise<void>;
        examples?       : string[];

        allowDynamicArgs?    : boolean;
        allowDynamicOptions? : boolean;
    }

    export interface ArgumentConfig {
        name            : string;
        description?    : string;
        required?       : boolean;
        validate?       : (value: string) => boolean | string;
        default?        : string;
    }

    export interface OptionConfig {
        name            : string;
        flag            : string;
        aliases?        : string[];
        description?    : string;
        type?           : 'boolean' | 'string' | 'number';
        default?        : string | boolean | number;
        required?       : boolean;
        validate?       : (value: string | boolean | number) => boolean | string;
    }

    export interface CLIConfig {
        name            : string;
        version         : string;
        description?    : string;
        commands?       : CommandConfig[];
        globalOptions?  : OptionConfig[];
    }

    export interface ParsedCommand {
        args            : Record<string, string>;
        options         : Record<string, string | boolean | number>;

        dynamicArgs?    : string[];
        dynamicOptions? : Record<string, string | boolean | number>;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔═══════════════════════════════════════ ERRORS ═══════════════════════════════════════╗

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