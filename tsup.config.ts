/**
 * @file                                tsup.config.ts
 * @description                         Configuration for `tsup`
 *
 * @version                             0.0.1
 *
 * @note                                Follows the `MECS` code style
*/



/* ┌─────────────────────────────────────── PACK ───────────────────────────────────────┐  */

    import { defineConfig }                 from 'tsup';

/* └────────────────────────────────────────────────────────────────────────────────────┘  */



/* ┌─────────────────────────────────────── CORE ───────────────────────────────────────┐  */

    export default                          defineConfig
    ({
        entry                               : ["src/code/main.ts"],
        format                              : ["cjs", "esm"],
        dts                                 : true,
        splitting                           : false,
        sourcemap                           : true,
        clean                               : true,
    });

/* └────────────────────────────────────────────────────────────────────────────────────┘  */