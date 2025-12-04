// src/core/index.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { ArgumentParser }   from './parser';
    import * as types           from './types.d';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class CLI {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            private commands            = new Map<string, types.CommandConfig>();
            private globalOptions       = new Map<string, types.OptionConfig>();
            private parser              = new ArgumentParser();

            constructor(public config   : types.CLIConfig) {
                this.initializeCommands();
                this.initializeGlobalOptions();
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ──────────────────────────────┐

            async run(argv: string[] = process.argv.slice(2)): Promise<void> {
                try {
                    const parsed = this.parser.parse(argv);

                    // Handle help (always check this first)
                    if (parsed.options.help || parsed.options.h) {
                        this.showHelp(parsed.command);
                        return;
                    }

                    // No command provided - check for version or show help
                    if (!parsed.command) {
                        // Handle version only when no command
                        if (parsed.options.version || parsed.options.v) {
                            console.log(`${this.config.name} v${this.config.version}`);
                            return;
                        }

                        if (this.commands.size === 0) {
                            throw new types.CLIError('No command specified');
                        }

                        this.showHelp();
                        return;
                    }

                    // Find command
                    const command = this.commands.get(parsed.command);
                    if (!command) {
                        throw new types.CommandNotFoundError(parsed.command);
                    }

                    // Check if -v/--version should be handled as version (only if command doesn't use -v)
                    const commandUsesV = command.options?.some(opt =>
                        opt.flag === '-v' || opt.aliases?.includes('-v')
                    );

                    if (!commandUsesV && (parsed.options.version || parsed.options.v)) {
                        console.log(`${this.config.name} v${this.config.version}`);
                        return;
                    }

                    // If command allows dynamic args, re-parse to preserve option-like arguments
                    if (command.allowDynamicArgs) {
                        const reparsed = this.reparseForDynamicArgs(argv, parsed.command);
                        const result = this.parseCommand(command, reparsed.positional, reparsed.options);
                        if (command.action) {
                            await command.action(result);
                        }
                    } else {
                        // Parse and validate normally
                        const result = this.parseCommand(command, parsed.positional, parsed.options);

                        // Execute command
                        if (command.action) {
                            await command.action(result);
                        }
                    }
                } catch (error) {
                    this.handleError(error);
                }
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── HELP ──────────────────────────────┐

            private initializeCommands(): void {
                if (!this.config.commands) return;

                for (const cmd of this.config.commands) {
                    this.commands.set(cmd.name, cmd);
                    if (cmd.aliases) {
                        for (const alias of cmd.aliases) {
                            this.commands.set(alias, cmd);
                        }
                    }
                }
            }

            private initializeGlobalOptions(): void {
                if (!this.config.globalOptions) return;

                for (const opt of this.config.globalOptions) {
                    this.globalOptions.set(opt.name, opt);
                    this.globalOptions.set(opt.flag, opt);
                    if (opt.aliases) {
                        for (const alias of opt.aliases) {
                            this.globalOptions.set(alias, opt);
                        }
                    }
                }
            }

            private reparseForDynamicArgs(argv: string[], commandName: string): { positional: string[]; options: Record<string, string | boolean> } {
                let idx = 0;

                // Find command in argv
                while (idx < argv.length && argv[idx] !== commandName) {
                    idx++;
                }
                idx++; // Skip command name

                const positional: string[] = [];
                const options: Record<string, string | boolean> = {};
                const command = this.commands.get(commandName);
                const numRequiredArgs = command?.args?.filter(a => a.required !== false).length || 0;
                let argsConsumed = 0;

                while (idx < argv.length) {
                    const token = argv[idx];

                    // Consume required positional arguments first
                    if (argsConsumed < numRequiredArgs && !token.startsWith('-')) {
                        positional.push(token);
                        argsConsumed++;
                        idx++;
                        continue;
                    }

                    // After required args are consumed, handle options vs args
                    if (token.startsWith('--')) {
                        const [key, value] = token.slice(2).split('=');
                        const isKnownOption = command?.options?.some(o =>
                            o.flag === `--${key}` || o.name === key || o.aliases?.includes(`--${key}`)
                        );

                        if (isKnownOption) {
                            // Known option - parse normally
                            if (value !== undefined) {
                                options[key] = value;
                            } else if (idx + 1 < argv.length && !argv[idx + 1].startsWith('-')) {
                                options[key] = argv[idx + 1];
                                idx++;
                            } else {
                                options[key] = true;
                            }
                        } else {
                            // Unknown option - add to positional for later processing as dynamic option
                            positional.push(token);
                            // Check if next token is a value for this option
                            if (value === undefined && idx + 1 < argv.length && !argv[idx + 1].startsWith('-')) {
                                positional.push(argv[idx + 1]);
                                idx++;
                            }
                        }
                    } else if (token.startsWith('-') && token.length > 1 && isNaN(Number(token))) {
                        // Short option(s) - check if all are known
                        const flags = token.slice(1).split('');
                        let allKnown = true;

                        // Check if all flags are known
                        for (const flag of flags) {
                            const isKnownOption = command?.options?.some(o =>
                                o.flag === `-${flag}` || o.aliases?.includes(`-${flag}`)
                            );
                            if (!isKnownOption) {
                                allKnown = false;
                                break;
                            }
                        }

                        if (allKnown) {
                            // All flags are known - parse them
                            for (let i = 0; i < flags.length; i++) {
                                const flag = flags[i];
                                if (i === flags.length - 1 && idx + 1 < argv.length && !argv[idx + 1].startsWith('-')) {
                                    options[flag] = argv[idx + 1];
                                    idx++;
                                } else {
                                    options[flag] = true;
                                }
                            }
                        } else {
                            // Some flags are unknown - add entire token to positional
                            positional.push(token);
                            // Check if next token is a value
                            if (idx + 1 < argv.length && !argv[idx + 1].startsWith('-')) {
                                positional.push(argv[idx + 1]);
                                idx++;
                            }
                        }
                    } else {
                        // Regular positional argument
                        positional.push(token);
                    }

                    idx++;
                }

                return { positional, options };
            }

            private parseCommand(
                command: types.CommandConfig,
                positional: string[],
                rawOptions: Record<string, string | boolean>
            ): types.ParsedCommand {
                const result: types.ParsedCommand = {
                    args: {},
                    options: {}
                };

                // Track which options are known
                const knownOptionKeys = new Set<string>();
                if (command.options) {
                    for (const opt of command.options) {
                            knownOptionKeys.add(opt.name);
                            knownOptionKeys.add(opt.flag.replace(/^-+/, ''));
                            if (opt.aliases) {
                                opt.aliases.forEach(a => knownOptionKeys.add(a.replace(/^-+/, '')));
                        }
                    }
                }

                // Parse arguments
                let dynamicArgsStart = 0;
                if (command.args) {
                    for (let i = 0; i < command.args.length; i++) {
                        const argConfig = command.args[i];
                        const value = positional[i];

                        if (!value) {
                            if (argConfig.required !== false) {
                                throw new types.ValidationError(`Missing required argument: ${argConfig.name}`);
                            }

                            result.args[argConfig.name] = argConfig.default ?? '';
                            continue;
                        }

                        // Validate
                        if (argConfig.validate) {
                        const validation = argConfig.validate(value);
                            if (validation !== true) {
                                throw new types.ValidationError(
                                typeof validation === 'string'
                                    ? validation
                                    : `Invalid value for argument '${argConfig.name}': ${value}`
                                );
                            }
                        }

                        result.args[argConfig.name] = value;
                        dynamicArgsStart = i + 1;
                    }
                }

                // Parse options
                const dynamicOptions: Record<string, string | boolean> = {};
                const optionIndices = new Set<number>();

                if (command.options) {
                    for (const optConfig of command.options) {
                        const value = this.getOptionValue(optConfig, rawOptions);

                        if (value === undefined) {
                            if (optConfig.required) {
                                throw new types.ValidationError(`Missing required option: --${optConfig.name}`);
                            }

                            result.options[optConfig.name] = optConfig.default ?? (optConfig.type === 'boolean' ? false : '');
                            continue;
                        }

                        // Type conversion
                        const converted = this.convertOptionType(value, optConfig.type);

                        // Validate
                        if (optConfig.validate) {
                            const validation = optConfig.validate(converted);
                            if (validation !== true) {
                                throw new types.ValidationError(
                                typeof validation === 'string'
                                    ? validation
                                    : `Invalid value for option '${optConfig.name}': ${converted}`
                                );
                            }
                        }

                        result.options[optConfig.name] = converted;
                    }
                }

                // Handle dynamic options from rawOptions
                for (const [key, value] of Object.entries(rawOptions)) {
                    if (!knownOptionKeys.has(key)) {
                        dynamicOptions[key] = value;
                    }
                }

                // Parse dynamic options from positional args and track their indices (only if allowDynamicOptions)
                if (command.allowDynamicOptions) {
                    let i = dynamicArgsStart;
                    while (i < positional.length) {
                        const token = positional[i];

                        if (token.startsWith('--')) {
                            const [key, value] = token.slice(2).split('=');
                            optionIndices.add(i);
                            if (value !== undefined) {
                                dynamicOptions[key] = value;
                                i++;
                            } else if (i + 1 < positional.length && !positional[i + 1].startsWith('-')) {
                                dynamicOptions[key] = positional[i + 1];
                                optionIndices.add(i + 1);
                                i += 2;
                            } else {
                                dynamicOptions[key] = true;
                                i++;
                            }
                        } else if (token.startsWith('-') && token.length > 1 && isNaN(Number(token))) {
                            optionIndices.add(i);
                            const flags = token.slice(1).split('');
                            for (let j = 0; j < flags.length; j++) {
                                const flag = flags[j];
                                if (j === flags.length - 1 && i + 1 < positional.length && !positional[i + 1].startsWith('-')) {
                                    dynamicOptions[flag] = positional[i + 1];
                                    optionIndices.add(i + 1);
                                    i++;
                                } else {
                                    dynamicOptions[flag] = true;
                                }
                            }
                            i++;
                        } else {
                            i++;
                        }
                    }
                }

                // Handle dynamic arguments - filter out options using tracked indices
                if (command.allowDynamicArgs) {
                    const dynamicArgs: string[] = [];
                    for (let i = dynamicArgsStart; i < positional.length; i++) {
                        if (!optionIndices.has(i)) {
                        dynamicArgs.push(positional[i]);
                        }
                    }
                    result.dynamicArgs = dynamicArgs;
                } else if (positional.length > dynamicArgsStart) {
                    // Throw error if there are extra positional args but dynamic args not allowed
                    throw new types.ValidationError(`Unexpected argument: ${positional[dynamicArgsStart]}`);
                }

                if (command.allowDynamicOptions) {
                    result.dynamicOptions = dynamicOptions;
                } else if (Object.keys(dynamicOptions).length > 0) {
                    // Throw error if there are unknown options but dynamic options not allowed
                    const unknownKey = Object.keys(dynamicOptions)[0];
                    throw new types.ValidationError(`Unknown option: ${unknownKey.length === 1 ? '-' : '--'}${unknownKey}`);
                }

                return result;
            }

            private getOptionValue(config: types.OptionConfig, rawOptions: Record<string, string | boolean>): string | boolean | undefined {
                // Check by name first
                if (rawOptions[config.name] !== undefined) {
                    return rawOptions[config.name];
                }

                // Check by flag (remove ALL leading dashes)
                const flag = config.flag.replace(/^-+/, '');
                if (rawOptions[flag] !== undefined) {
                    return rawOptions[flag];
                }

                // Check aliases
                if (config.aliases) {
                    for (const alias of config.aliases) {
                        const cleanAlias = alias.replace(/^-+/, '');
                        if (rawOptions[cleanAlias] !== undefined) {
                            return rawOptions[cleanAlias];
                        }
                    }
                }

                return undefined;
            }

            private convertOptionType(value: string | boolean, type?: 'boolean' | 'string' | 'number'): string | boolean | number {
                if (type === 'number') {
                    const num = Number(value);
                    if (isNaN(num)) {
                        throw new types.ValidationError(`Expected number, got: ${value}`);
                    }

                    return num;
                }

                if (type === 'boolean') {
                    if (value === true  || value === 'true')  return true;
                    if (value === false || value === 'false') return false;
                    return !!value;
                }

                return String(value);
            }

            private showHelp(commandName?: string): void {
                if (commandName) {
                    const command = this.commands.get(commandName);
                    if (command) {
                        this.showCommandHelp(command);
                        return;
                    }
                }

                console.log(`${this.config.name} v${this.config.version}`);
                if (this.config.description) {
                    console.log(this.config.description);
                }
                console.log();
                console.log('USAGE:');
                console.log(`  ${this.config.name} <command> [options]`);
                console.log();
                console.log('COMMANDS:');

                const uniqueCommands = new Map<string, types.CommandConfig>();
                for (const [name, cmd] of this.commands) {
                    if (name === cmd.name) {
                        uniqueCommands.set(name, cmd);
                    }
                }

                for (const [name, cmd] of uniqueCommands) {
                    const aliases = cmd.aliases ? ` (${cmd.aliases.join(', ')})` : '';
                    console.log(`  ${name}${aliases}`);
                    if (cmd.description) {
                        console.log(`    ${cmd.description}`);
                    }
                }

                console.log();
                console.log('OPTIONS:');
                console.log('  -h, --help       Show help');
                console.log('  -v, --version    Show version');
            }

            private showCommandHelp(command: types.CommandConfig): void {
                console.log(`${command.name}`);
                if (command.description) {
                    console.log(command.description);
                }
                console.log();

                // Usage
                let usage = `${this.config.name} ${command.name}`;
                if (command.args) {
                    usage += ' ' + command.args.map(a =>
                        a.required !== false ? `<${a.name}>` : `[${a.name}]`
                    ).join(' ');
                }

                if (command.allowDynamicArgs) {
                    usage += ' [...]';
                }

                console.log('USAGE:');
                console.log(`  ${usage}`);
                console.log();

                // Arguments
                if (command.args && command.args.length > 0) {
                    console.log('ARGUMENTS:');
                    for (const arg of command.args) {
                        const req = arg.required !== false ? 'required' : 'optional';
                        console.log(`  ${arg.name} (${req})`);
                        if (arg.description) {
                            console.log(`    ${arg.description}`);
                        }
                    }

                    if (command.allowDynamicArgs) {
                        console.log(`  ... (additional arguments allowed)`);
                    }

                    console.log();
                }

                // Options
                if (command.options && command.options.length > 0) {
                    console.log('OPTIONS:');
                    for (const opt of command.options) {
                        const aliases = opt.aliases ? `, ${opt.aliases.join(', ')}` : '';
                        const req = opt.required ? ' (required)' : '';
                        console.log(`  ${opt.flag}${aliases}${req}`);
                        if (opt.description) {
                            console.log(`    ${opt.description}`);
                        }
                    }
                }

                if (command.allowDynamicOptions) {
                    console.log(`  ... (additional options allowed)`);
                }

                if ((command.options && command.options.length > 0) || command.allowDynamicOptions) {
                    console.log();
                }

                // Examples
                if (command.examples && command.examples.length > 0) {
                    console.log('EXAMPLES:');
                    for (const example of command.examples) {
                        console.log(`  ${example}`);
                    }
                    console.log();
                }
            }

            private handleError(error: unknown): void {
                if (error instanceof types.CLIError) {
                    console.error(`Error: ${error.message}`);
                    process.exit(1);
                } else if (error instanceof Error) {
                    console.error(`Unexpected error: ${error.message}`);
                    if (process.env.DEBUG) {
                        console.error(error.stack);
                    }
                    process.exit(1);
                } else {
                    console.error('An unknown error occurred');
                    process.exit(1);
                }
            }

        // └────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝