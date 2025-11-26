<!-- ╔══════════════════════════════ BEG ══════════════════════════════╗ -->

<br>
<div align="center">
    <p>
        <img src="./assets/img/logo.png" alt="logo" style="" height="100" />
    </p>
</div>

<div align="center">
    <img src="https://img.shields.io/badge/v-1.0.1-black"/>
    <a href="https://github.com/maysara-elshewehy">
    </a>
    <a href="https://github.com/je-es"><img src="https://img.shields.io/badge/@-je--es-black"/></a>
    <a href="https://github.com/maysara-elshewehy"><img src="https://img.shields.io/badge/by-Maysara-black"/></a>
</div>

<div align="center">
    <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/>
    <br>
</div>

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->



<!-- ╔══════════════════════════════ DOC ══════════════════════════════╗ -->


- ## Install

    ```bash
    npm install @je-es/cli
    ```

    <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

- ## Quick Start

    ```typescript
    import { cli } from '@je-es/cli';

    cli('myapp', '1.0.0')
    .command({
        name        : 'create',
        args        : [{ name: 'project', required: true }],
        options     : [
            { name: 'type', flag: '-t', type: 'string', required: true },
            { name: 'force', flag: '-f', type: 'boolean', default: false }
        ],
        action      : ({ args, options }) => { console.log(`Creating ${args.project} as ${options.type}`); }
    })
    .build()
    .run();
    ```

    ```bash
    # Usage
    myapp create myproject -t npm -f
    ```

    <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>


- ## Commands

    ```typescript
    .command({
    name          : 'create',
    aliases       : ['c', 'new'],             # short names
    description   : 'Create project',         # shown in help
    args          : [...],                    # positional arguments
    options       : [...],                    # flags and options
    action        : (parsed) => { ... },      # command handler
    examples      : ['myapp create foo']      # usage examples
    })
    ```

    <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

- ## Arguments

    ```typescript
    args: [
    {
        name            : 'project',
        required        : true,                 # mandatory argument
        description     : 'Project name',
        default         : 'myapp',              # fallback value
        validate        : (v) => v.length > 0 || 'Name required'
    }
    ]
    ```

    <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

- ## Options

    ```typescript
    options: [
    {
        name            : 'type',
        flag            : '-t',                 # short form
        aliases         : ['--type'],           # long form
        type            : 'string',             # string | number | boolean
        required        : true,
        default         : 'npm',
        validate: (v) => ['npm','yarn'].includes(v) || 'Invalid type'
    }
    ]
    ```

    <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

- ## Built-in Flags

    ```bash
    myapp --help         # show all commands
    myapp create --help  # show command help
    myapp --version      # show version
    ```

- ## Validation

    ```typescript
    # Argument validation
    args: [{
    name      : 'port',
    validate  : (v) => Number(v) > 0 || 'Port must be positive'
    }]

    # Option validation
    options: [{
    name      : 'env',
    flag      : '--env',
    validate  : (v) => ['dev','prod'].includes(v) || 'Invalid env'
    }]
    ```

    <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

- ## Type Conversion

    ```typescript
    options: [
    { name: 'port', flag: '-p', type: 'number' },    # "3000" → 3000
    { name: 'verbose', flag: '-v', type: 'boolean' }, # flag → true
    { name: 'name', flag: '-n', type: 'string' }      # default
    ]
    ```

    <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

- ## Multiple Commands

    ```typescript
    cli('myapp', '1.0.0')
    .command({
        name    : 'create',
        action  : () => { /* ... */ }
    })
    .command({
        name    : 'delete',
        action  : () => { /* ... */ }
    })
    .build()
    .run();
    ```

    ```bash
    myapp create
    myapp delete
    ```

    <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

- ## Aliases

    ```typescript
    # Command aliases
    .command({
    name      : 'create',
    aliases   : ['c', 'new', 'init']
    })

    # Option aliases
    options: [{
    name      : 'force',
    flag      : '-f',
    aliases   : ['--force', '--overwrite']
    }]
    ```

    ```bash
    myapp create         # full name
    myapp c              # alias
    myapp new            # alias

    myapp create -f      # short flag
    myapp create --force # long flag
    ```

    <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

- ## Error Handling

    ```typescript
    import { CLIError, ValidationError, CommandNotFoundError } from '@je-es/cli';

    .command({
    name: 'deploy',
    action: async () => {
        throw new CLIError('Deployment failed', 'DEPLOY_ERROR');
    }
    })
    ```

    <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

- ## Examples

    - ### Basic CLI

        ```typescript
        cli('git', '1.0.0')
        .command({
            name        : 'commit',
            args        : [{ name: 'message', required: true }],
            options     : [{ name: 'amend', flag: '-a', type: 'boolean' }],
            action      : ({ args, options }) => {
            console.log(`Committing: ${args.message}`);
            }
        })
        .build()
        .run();
        ```

        ```bash
        git commit "fix bug" -a
        ```

    - ### Multiple Arguments

        ```typescript
        .command({
        name      : 'person',
        args      : [
            { name: 'name', required: true },
            { name: 'age', required: true, validate: (v) => !isNaN(Number(v)) }
        ],
        action    : ({ args }) => { console.log(`${args.name}, ${args.age} years old`); }
        })
        ```

        ```bash
        myapp person "John Doe" 30
        ```

    - ### With Validation

        ```typescript
        .command({
        name      : 'start',
        options   : [{
            name        : 'port',
            flag        : '-p',
            type        : 'number',
            validate    : (v) => v >= 1000 && v <= 9999 || 'Port must be 1000-9999'
        }],
        action    : ({ options }) => { console.log(`Starting on port ${options.port}`); }
        })
        ```

        ```bash
        myapp start -p 3000    # ✓
        myapp start -p 999     # ✗ validation error
        ```

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->



<!-- ╔══════════════════════════════ END ══════════════════════════════╗ -->

<br>
<div align="center">
    <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/>
    <br>
</div>
<br>
<div align="center">
    <a href="https://github.com/maysara-elshewehy"><img src="https://img.shields.io/badge/by-Maysara-black"/></a>
</div>

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->
