// types
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    interface CommandConfig<T = any> {
        name            : string;
        aliases?        : string[];
        description?    : string;
        args?           : ArgumentConfig[];
        options?        : OptionConfig[];
        action?         : (parsed: T) => void | Promise<void>;
        examples?       : string[];
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
        default?        : any;
        required?       : boolean;
        validate?       : (value: any) => boolean | string;
    }

    interface CLIConfig {
        name            : string;
        version         : string;
        description?    : string;
        commands?       : CommandConfig[];
        globalOptions?  : OptionConfig[];
    }

    interface ParsedCommand {
        name            : string;
        args            : Record<string, string>;
        options         : Record<string, any>;
    }

declare class CLIError extends Error {
    code: string;
    constructor(message: string, code?: string);
}
declare class ValidationError extends CLIError {
    constructor(message: string);
}
declare class CommandNotFoundError extends CLIError {
    constructor(command: string);
}

declare class CLI {
    private config;
    private commands;
    private globalOptions;
    private parser;
    constructor(config: CLIConfig);
    private initializeCommands;
    private initializeGlobalOptions;
    run(argv?: string[]): Promise<void>;
    private parseCommand;
    private getOptionValue;
    private convertOptionType;
    private showHelp;
    private showCommandHelp;
    private handleError;
}
declare class CLIBuilder {
    private config;
    constructor(name: string, version: string);
    description(desc: string): this;
    command(config: CommandConfig): this;
    globalOption(option: OptionConfig): this;
    build(): CLI;
}
declare function cli(name: string, version: string): CLIBuilder;

export { type ArgumentConfig, CLI, CLIBuilder, type CLIConfig, CLIError, type CommandConfig, CommandNotFoundError, type OptionConfig, type ParsedCommand, ValidationError, cli };
