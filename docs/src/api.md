# [@je-es/cli](../../README.md) API

---

| Index           | Desc                                     |
| --------------- | ---------------------------------------- |
| [CLI](#cli)     | The main function to use.                |
| [Types](#types) | The main types to use the main function. |

---

- ### CLI

    ```ts
    /**
     * Parses the command line arguments and executes corresponding actions.
     *
     * @param  {t_cli} options              - The options object containing information about the CLI application.
     *
     * @throws {CLIError}                   - If an action is not found.
     * @throws {CLIError}                   - If an action argument is missing.
     * @throws {CLIError}                   - If an action requires are not found.
    */
    const cli
    = (options: t_cli)
    : void
    ```

    - #### Example

        ```ts
        import { cli } from '@je-es/cli';

        cli( { ... } );
        ```

- ### Types

    ```ts
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
    ```


    - #### Example

        ```ts
        import { t_cli } from '@je-es/cli';

        const options : t_cli = { ... };
        ```

    - #### Notes

        - The `requires` indicate that this action requires args from another action, and is identified by the name of the required action.
        
        - When using `options`, a new arg is added to the current action with a boolean value that depends on whether this option is used or not.
---

### Testing

> Extensive testing has been performed on all expected scenarios and use cases. You can run tests with the following command :

```ts
npm test
```

---

> **Made with ❤ by [Maysara Elshewehy](https://github.com/Maysara-Elshewehy)**