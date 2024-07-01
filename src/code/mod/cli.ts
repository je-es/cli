/**
 * @name                                    cli.ts
 * @description                             The core module of the CLI.
*/



/* ┌─────────────────────────────────────── TYPE ───────────────────────────────────────┐  */

    import { t_action, t_actions, t_cli }   from './types';

/* └────────────────────────────────────────────────────────────────────────────────────┘  */



/* ┌─────────────────────────────────────── CORE ───────────────────────────────────────┐  */

    /**
     * Parses the command line arguments and executes corresponding actions.
     *
     * @param   {t_cli}     options         - The options object containing information about the CLI application.
     * 
     * @throws  {CLIError}                  - If an action is not found.
     * @throws  {CLIError}                  - If an action argument is missing.
     * @throws  {CLIError}                  - If an action requires are not found.
    */
    export const cli
    = (options: t_cli)
    : void =>
    {
        // - get passed args            ex: [ 'npx', 'myCLI', '--create', 'myApp', '--as', 'npm' ]
        const passedArgs : string[] = process.argv.slice(2);

        // - to store parsed args       ex: { create: { name: 'myApp', type: 'npm' } }
        const parsedArgs : Record<string, any> = {};

        // - loop through passed args
        for (let i = 0; i < passedArgs.length; i++)
        {
            // - get arg                 ex: '-c'
            const arg = passedArgs[i];

            // - is it an action ?
            if (arg.startsWith('-'))
            {
                const actionName            = Helpers.getAction(options.actions, arg);
                const action                = options.actions[actionName];
                const actionArgs            : Record<string, string> = {};

                // - is it an action with args ?
                if (action.args)
                {
                    // - check if there are enough arguments
                    if (((passedArgs.length - i) - 1) < action.args.length)
                    {
                        throw new CLIError(`Missing argument for action '${arg}'.`);
                    }

                    // - parse args
                    for (let k = 0; k < action.args.length; k++)
                    {
                        // - get next arg
                        const nextArg = passedArgs[k + i + 1];

                        // - check if next arg is an action
                        if (nextArg.startsWith("-"))
                        {
                            throw new CLIError(`Missing/Invalid argument for action '${arg}'.`);
                        }

                        // - store arg
                        actionArgs[action.args[k]] = nextArg;
                    }

                    // - update index to skip the parsed args for this action
                    i += action.args.length;
                }

                // - storing parsed args
                parsedArgs[actionName] = actionArgs;
            }
        }

        // - assign actions requires/options
        for (const key in parsedArgs)
        {
            const action : t_action = options.actions[key];

            // Requires
            if (action.requires)
            {
                // - loop through requires
                action.requires.forEach(require =>
                {
                    // - check if require is not found
                    if (!parsedArgs[require])
                    {
                        throw new CLIError(`Missing required argument for action '${key}'.`);
                    }

                    // - merge requires args with action args
                    parsedArgs[key] = { ...parsedArgs[key], ...parsedArgs[require] };
                });
            }

            // Options
            if (action.options)
            {
                // - loop through options
                action.options.forEach(option =>
                {
                    // - set the option value
                    parsedArgs[key][option] = parsedArgs[option] ? true : false;
                });
            }
        }

        // execute actions
        for (const key in parsedArgs)
        {
            const action : t_action = options.actions[key];

            if (action.callback)
            {
                action.callback(parsedArgs[key]);
            }
        }
    };

/* └────────────────────────────────────────────────────────────────────────────────────┘  */



/* ┌─────────────────────────────────────── HELP ───────────────────────────────────────┐  */

    const Helpers =
    {
        /**
         * A description of the entire function.
         *
         * @param   {t_actions} actions     - the actions object.
         * @param   {string}    arg         - the argument.
         * 
         * @throws  {CLIError}              - if the action not found.
         * 
         * @return  {string} the action name.
        */
        getAction: (actions: t_actions, arg: string): string =>
        {
            // - loop through actions
            for (const action in actions)
            {
                // - check if action flag or alias is equal to the passed arg
                if (actions[action].flag === arg || actions[action].alias === arg)
                {
                    // - return action name
                    return action;
                }
            }

            throw new CLIError(`Action '${arg}' not found.`);
        }
    };

    /**
     * The cli error class.
    */
    class CLIError extends Error
    {
        /**
         * Constructs a new CLIError instance.
         *
         * @param {string}  message     - The error message.
        */
        constructor(message: string)
        {
            // - call parent constructor
            super(message);

            // - set name property
            this.name = "CLIError";
        }
    }

/* └────────────────────────────────────────────────────────────────────────────────────┘  */
