// src/core/types.d.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    interface CommandConfig<T = ParsedCommand> {
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

    interface ArgumentConfig {
        name            : string;
        description?    : string;
        required?       : boolean;
        validate?       : (value: string) => boolean | string;
        default?        : string;
    }

    interface OptionConfig {
        name            : string;
        flag            : string;
        aliases?        : string[];
        description?    : string;
        type?           : 'boolean' | 'string' | 'number';
        default?        : string | boolean | number;
        required?       : boolean;
        validate?       : (value: string | boolean | number) => boolean | string;
    }

    interface CLIConfig {
        name            : string;
        version         : string;
        description?    : string;
        commands?       : CommandConfig[];
        globalOptions?  : OptionConfig[];
    }

    interface ParsedCommand {
        args            : Record<string, string>;
        options         : Record<string, string | boolean | number>;

        dynamicArgs?    : string[];
        dynamicOptions? : Record<string, string | boolean | number>;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔═══════════════════════════════════════ ERRORS ═══════════════════════════════════════╗

    declare class CLIError extends Error {
        constructor(message: string, public code: string = 'CLI_ERROR') {
            super(message);
            this.name = 'CLIError';
            Error.captureStackTrace?.(this, CLIError);
        }
    }

    declare class ValidationError extends CLIError {
        constructor(message: string) {
            super(message, 'VALIDATION_ERROR');
            this.name = 'ValidationError';
        }
    }

    declare class CommandNotFoundError extends CLIError {
        constructor(command: string) {
            super(`Command '${command}' not found`, 'COMMAND_NOT_FOUND');
            this.name = 'CommandNotFoundError';
        }
    }

declare class CLI {
    private config;
    private commands;
    private globalOptions;
    private parser;
    constructor(config: CLIConfig);
    run(argv?: string[]): Promise<void>;
    private initializeCommands;
    private initializeGlobalOptions;
    private reparseForDynamicArgs;
    private parseCommand;
    private getOptionValue;
    private convertOptionType;
    private showHelp;
    private showCommandHelp;
    private handleError;
}

declare class Builder {
    private config;
    constructor(name: string, version: string);
    description(desc: string): this;
    command(config: CommandConfig): this;
    globalOption(option: OptionConfig): this;
    build(): CLI;
}
declare function cli(name: string, version: string): Builder;

export { type ArgumentConfig, Builder, CLI, type CLIConfig, CLIError, type CommandConfig, CommandNotFoundError, type OptionConfig, type ParsedCommand, ValidationError, cli, cli as default };
