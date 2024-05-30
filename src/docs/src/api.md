# [@je-es/cli](../../../README.md) API

> An easy, fast and efficient way to create command line applications in Node JS.

- #### 🌟 Syntax

    ```ts
    import { cli } from '@je-es/cli';
    ```

---

  | API             | Desc                                   |
  | --------------- | -------------------------------------- |
  | [cli](#cli)     | Function to create a cli applications. |
  | [types](#types) | Options for the cli function.          |

---

- #### cli

    ```ts
    /**
     * Parses command line arguments and executes the corresponding callback function.
     *
     * @param {t_cli} options - The options object containing the actions to be executed.
     * @return {void} This function does not return anything.
    */
    const cli
    = (options: t_cli)
    : void
    ```

    - ##### types

        ```ts
        interface t_cli
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
        ```

        ```ts
        interface t_cliAction
        {
            flag                ?: string,
            alias               ?: string,
            args                ?: string[],
            callback            : (args:any) => void
        }
        ```

    - **Example**

      ```ts
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
                  alias       : '--create',
                  args        : ['name'],
                  callback    : ({ name }) =>
                  {
                      console.log(`Creating project '${name}'.`);
                  }
              },

              as:
              {
                  alias       : '--as',
                  args        : ['type'],
                  callback    : ({ type }) =>
                  {
                      console.log(`As '${type}'.`);
                  }
              }
          }
      };

      cli(myCli);
      ```

      _USE_

      ```bash
      npx mecs --create myPack --as npm
      ```

      _RESULT_

      ```bash
      # => Creating project 'myPack'.
      # => As 'npm'.
      ```

---

> **Made with ❤ by [Maysara Elshewehy](https://github.com/Maysara-Elshewehy)**
