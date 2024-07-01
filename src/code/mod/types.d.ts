/**
 * @name                                    types.d.ts
*/



/* ┌─────────────────────────────────────── TYPE ───────────────────────────────────────┐  */

    export type t_action =
    {
        flag                                ?: string,
        alias                               ?: string,

        args                                ?: string[],
        requires                            ?: string[],
        options                             ?: string[],

        callback                            ?: (args:any) => void
    }

    export type t_actions =
    {
        [ key: string ]                     : t_action
    }

    export type t_cli =
    {
        info                                :
        {
            name                            : string,
            desc                            : string,
            vers                            : string,
        },

        actions                             : t_actions
    }

/* └────────────────────────────────────────────────────────────────────────────────────┘  */