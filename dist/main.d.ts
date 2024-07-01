/**
 * @name                                    types.d.ts
*/



/* ┌─────────────────────────────────────── TYPE ───────────────────────────────────────┐  */

    type t_action =
    {
        flag                                ?: string,
        alias                               ?: string,

        args                                ?: string[],
        requires                            ?: string[],
        options                             ?: string[],

        callback                            ?: (args:any) => void
    }

    type t_actions =
    {
        [ key: string ]                     : t_action
    }

    type t_cli =
    {
        info                                :
        {
            name                            : string,
            desc                            : string,
            vers                            : string,
        },

        actions                             : t_actions
    }

/**
 * @name                                    cli.ts
 * @description                             The core module of the CLI.
*/

/**
 * Parses the command line arguments and executes corresponding actions.
 *
 * @param   {t_cli}     options         - The options object containing information about the CLI application.
 *
 * @throws  {CLIError}                  - If an action is not found.
 * @throws  {CLIError}                  - If an action argument is missing.
 * @throws  {CLIError}                  - If an action requires are not found.
*/
declare const cli: (options: t_cli) => void;

export { cli, type t_action, type t_actions, type t_cli };
