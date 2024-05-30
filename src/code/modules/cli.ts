/**
 * @name                                    cli.ts
 * @description                             The core module of the CLI
*/


/* ---------------------------------------- INIT ----------------------------------------  */

    export interface t_cliAction
    {
        flag                ?: string,
        alias               ?: string,
        args                ?: string[],
        callback            : (args:any) => void
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
     * @return {void} This function does not return anything.
    */
    export const cli
    = (options: t_cli)
    : void =>
    {
        const args = process.argv.slice(2);

        // Iterate through the arguments
        for (let i = 0; i < args.length; i++)
        {
            const arg = args[i];

            // Check if the argument is a command (starts with '-')
            if (arg.startsWith('-'))
            {
                // Extract the command and its arguments
                const command = arg.replaceAll('-', '');
                const action = options.actions[command];

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
                    action.callback(commandArgs);
                }

                else
                {
                    console.log(`Command '${command}' not found.`);
                }
            }
        }
    };

/* ---------------------------------------- ---- ----------------------------------------  */