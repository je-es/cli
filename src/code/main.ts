#!/usr/bin/env node

/**
 * @name                                    main.ts
 * @description                             the main file (entry point)
 * @author                                  Maysara Elshewhy
 * @repo                                    https://github.com/je-es/cli
 *
 * @note                                    This script follows the `MECS` code style
*/


/* ---------------------------------------- PACK ----------------------------------------  */

    export *                                from './modules/cli';
    import { cli, t_cli }                                from './modules/cli';

    const myCli : t_cli =
      {
          info:
          {
              name            : 'mecs',
              description     : 'A simple CLI application',
              version         : '1.0.0'
          },

          actions:
          {
              create:
              {
                  flag       : '-c',
                  alias       : '--create',
                  args        : ['name'],
                  required    : ['as'],
                  callback    : ({ name, type }) =>
                  {
                      console.log(`Creating project '${name} as ${type}'.`);
                  }
              },

              as:
              {
                  args        : ['type']
              }
          }
      };

      cli(myCli);
/* ---------------------------------------- ---- ----------------------------------------  */