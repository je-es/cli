/**
 * @name                                    cli.ts
 * @description                             The core module of the CLI
*/


/* ---------------------------------------- INIT ----------------------------------------  */

    export interface t_cliAction
    {
        flag                ?: string,
        alias               ?: string,
        required            ?: string[],
        args                ?: string[],
        callback            ?: (args:any) => void
    }

    export interface t_cli
    {
        info                :
        {
            name            : string,
            description     : string,
            version         : string,
        },

        actions             :
        {
            [ key: string ] : t_cliAction
        },
    }

/* ---------------------------------------- ---- ----------------------------------------  */


/* ---------------------------------------- CORE ----------------------------------------  */

    /**
     * Parses command line arguments and executes the corresponding callback function.
     *
     * @param {t_cli} options - The options object containing the actions to be executed.
    */
    export const cli
    = async (options: t_cli) =>
    {
        // setup actions
        {
            for (const key in options.actions)
            {
                if (!options.actions[key].flag && !options.actions[key].alias)
                {
                    options.actions[key].alias = '--' + key;
                }
            }
        }

        const args = process.argv.slice(2);

        // Iterate through the arguments
        for (let i = 0; i < args.length; i++)
        {
            const arg = args[i];

            // Check if the argument is a command (starts with '-')
            if (arg.startsWith('-'))
            {
                // Extract the command and its arguments
                const mode = arg[0] == '-' && arg[1] == '-' ? 'long' : 'short';
                const command = mode == 'long' ? arg.replaceAll('-', '') : searchShort(arg, options.actions);
                const action = options.actions[arg] ? options.actions[arg] : options.actions[command];

                // If the command exists, execute its callback with arguments
                if (action)
                {
                    let commandArgs: any = {};

                    // Parse the arguments for the command
                    if(action.args)
                    {
                        // Iterate through the action args
                        for (let j = 0; j < action.args.length; j++)
                        {
                            const name = action.args[j];
                            commandArgs[name] = '';
                        }

                        // Iterate through the remaining arguments
                        for (let j = i + 1; j < args.length; j++)
                        {
                            const nextArg = args[j];

                            if (nextArg.startsWith('-'))
                            {
                                break
                            }

                            // get key name by commandArgs length depending on action args it self
                            const name = action.args[j - i - 1];
                            commandArgs[name] = nextArg;
                        }
                    }

                    // Required actions check
                    if(action.required)
                    {
                        // for example required = ['as']
                        // as is an action has a callback this callback must return a value
                        // so we must assign a value to commandArgs['as']

                        // Iterate through the required actions
                        for (let j = 0; j < action.required.length; j++)
                        {
                            const name = action.required[j];
                            const res  = await required(options.actions[name]);
                            commandArgs = { ...commandArgs, ...res };
                        }
                    }

                    // Execute the callback function with the parsed arguments
                    if(action.callback)
                    await action.callback(commandArgs);
                }

                else
                {
                    throw new Error(`Command '${command}' not found.`);
                }
            }
        }
    };

    const required
    = async (action: t_cliAction) =>
    {
        const args = process.argv.slice(2);

        // Iterate through the arguments
        for (let i = 0; i < args.length; i++)
        {
            const arg = args[i];

            if(arg != action.flag && arg != action.alias) continue;

            // If the command exists, execute its callback with arguments
            if (action)
            {
                let commandArgs: any = {};

                // Parse the arguments for the command
                if(action.args)
                {
                    // Iterate through the action args
                    for (let j = 0; j < action.args.length; j++)
                    {
                        const name = action.args[j];
                        commandArgs[name] = '';
                    }

                    // Iterate through the remaining arguments
                    for (let j = i + 1; j < args.length; j++)
                    {
                        const nextArg = args[j];

                        if (nextArg.startsWith('-'))
                        {
                            break
                        }

                        // get key name by commandArgs length depending on action args it self
                        const name = action.args[j - i - 1];
                        commandArgs[name] = nextArg;
                    }
                }

                // Execute the callback function with the parsed arguments
                return commandArgs;
            }

            else
            {
                throw new Error(`Command '${arg}' not found.`);
            }
        }
    };

    const searchShort
    = (arg: string, actions: t_cli['actions']) : string =>
    {
        for (const key in actions)
        {
            if (actions[key].flag == arg || actions[key].alias == arg)
            {
                return key;
            }
        }

        throw new Error(`Command '${arg}' not found.`);
    };

/* ---------------------------------------- ---- ----------------------------------------  */