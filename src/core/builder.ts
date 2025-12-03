// src/core/builder.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import * as types   from './types.d';
    import { CLI }      from '../core';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class Builder {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            private config: types.CLIConfig;

            constructor(name: string, version: string) {
                this.config = { name, version, commands: [], globalOptions: [] };
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ──────────────────────────────┐

            description(desc: string): this {
                this.config.description = desc;
                return this;
            }

            command(config: types.CommandConfig): this {
                if (!this.config.commands) this.config.commands = [];
                this.config.commands.push(config);
                return this;
            }

            globalOption(option: types.OptionConfig): this {
                if (!this.config.globalOptions) this.config.globalOptions = [];
                this.config.globalOptions.push(option);
                return this;
            }

            build(): CLI {
                return new CLI(this.config);
            }

        // └────────────────────────────────────────────────────────────────────┘

    }

    export function cli(name: string, version: string): Builder {
        return new Builder(name, version);
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝