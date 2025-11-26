// types.d.ts
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export interface CommandConfig<T = any> {
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
        default?        : any;
        required?       : boolean;
        validate?       : (value: any) => boolean | string;
    }

    export interface CLIConfig {
        name            : string;
        version         : string;
        description?    : string;
        commands?       : CommandConfig[];
        globalOptions?  : OptionConfig[];
    }

    export interface ParsedCommand {
        name            : string;
        args            : Record<string, string>;
        options         : Record<string, any>;

        dynamicArgs?    : string[];
        dynamicOptions? : Record<string, any>;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝