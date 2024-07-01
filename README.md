# [@je-es](https://github.com/je-es)/cli

> A powerful and user-friendly tool for building CLI applications effortlessly.

- #### 📥 Install

    ```Bash
    npm i @je-es/cli
    ```

- #### 🌟 Syntax

    ```ts
    import { cli, t_cli } from '@je-es/cli';
    ```

- #### 🔥 Usage

    > This is just a simple example to cover different use cases, you are free to create whatever you want !

    ```ts
    // The cli-application options
    const options : t_cli =
    {
        info    :
        {
            name            : 'people',
            desc            : 'a simple cli application to add people',
            vers            : '1.0.0'
        },

        actions :
        {
            'add' :
            {
                flag        : '-a',
                alias       : '--add',
                args        : ['name', 'age'],

                requires    : ['career'],
                options     : ['force'],

                callback    : ( args: { name: string, age: string, career: string, force?: boolean } ) =>
                {
                    // is this person is already registered ?
                    if( ... )
                    {
                        // IF not forced, throw an error
                        if( !force )
                        {
                            throw new Error('This person is already registered');
                        }

                        // Remove the person (forcefully)
                        else
                        {
                            ...
                        }
                    }

                    // Register the new person
                    ...
                }
            },

            'career' :
            {
                alias       : '--career',
                args        : ['career'],
            },

            'force' :
            {
                flag        : '-f',
            }
        }
    };
    ```

    ```ts
    // Initialize the CLI with the options
    cli(options);
    ```

    - #### NOTES

        - At the beginning of the main file, add the following line:

            ```ts
            #!/usr/bin/env node

            ...
            ```

        - In the `package.json` file, add the following option :

            ```json
            {
                "bin" :
                {
                    "people" : "./dist/main.js"
                    //  ^              ^
                    // name           path
                },
            }
            ```

    - #### Run the application

        ```ts
        npx people --add Maysara 24 --career Developer -f
        ```

        > **IF there are any syntax errors or missing arguments, an error will be thrown, see the [API](./docs/src/api.md) to learn more.**
---

### Documentation

  - [API](./docs/src/api.md)
  

---

> **Made with ❤ by [Maysara Elshewehy](https://github.com/Maysara-Elshewehy)**