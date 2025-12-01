<!-- ╔══════════════════════════════ BEG ══════════════════════════════╗ -->

<br>
<div align="center">
    <p>
        <img src="./assets/img/logo.png" alt="logo" style="" height="80" />
    </p>
</div>

<div align="center">
    <img src="https://img.shields.io/badge/v-1.1.0-black"/>
    <a href="https://github.com/maysara-elshewehy">
    </a>
    <a href="https://github.com/je-es"> <img src="https://img.shields.io/badge/@-je--es-black"/> </a>
</div>
<br>

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->




<!-- ╔══════════════════════════════ DOC ══════════════════════════════╗ -->


- ## Quick Start 🔥

    > _**The simplest, fastest, most organized and stable way to build command line applications.**_

    > _We prefer to use [`space`](https://github.com//solution-lib/space) with [`@solution-dist/cli`](https://github.com/solution-dist/cli) for a better experience._

    ```bash
    space init <app-name> -t cli
    ```

    ```bash
    cd <app-name>
    space install
    ```

    ```bash
    # example
     > space start create MyApp -t web
    
    # output
      Creating MyApp as web
    ```

    <br>


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

        <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

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

        <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

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

    <br>

- ## Docs

    - ### Commands

        ```typescript
        .command({
            name                  : 'create',
            aliases               : ['c', 'new'],            // short names
            description           : 'Create project',        // shown in help
            args                  : [...],                   // positional arguments
            options               : [...],                   // flags and options
            allowDynamicArgs      : true,                    // allow unknown arguments
            allowDynamicOptions   : true,                    // allow unknown options
            action                : (parsed) => { ... },     // command handler
            examples              : ['myapp create foo']     // usage examples
        })
        ```

        <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

    - ### Arguments

        ```typescript
        args: [
            {
                name            : 'project',
                required        : true,                // mandatory argument
                description     : 'Project name',
                default         : 'myapp',             // fallback value
                validate        : (v) => v.length > 0 || 'Name required'
            }
        ]
        ```

        <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

    - ### Options

        ```typescript
        options: [
            {
                name            : 'type',
                flag            : '-t',                // short form
                aliases         : ['--type'],          // long form
                type            : 'string',            // string | number | boolean
                required        : true,
                default         : 'npm',
                validate: (v) => ['npm','yarn'].includes(v) || 'Invalid type'
            }
        ]
        ```

        <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

    - ### Dynamic Arguments & Options

        > Enable `allowDynamicArgs` and `allowDynamicOptions` to handle unknown arguments and options.
        >
        > Perfect for commands like `exec` that need to pass through arbitrary arguments.

        ```typescript
        cli('docker', '1.0.0')
        .command({
            name                : 'run',
            args                : [{ name: 'image', required: true }],
            options             : [
                { name: 'detach', flag: '-d', type: 'boolean' },
                { name: 'name', flag: '--name', type: 'string' }
            ],
            allowDynamicArgs    : true,   // capture unknown positional args
            allowDynamicOptions : true,   // capture unknown flags
            action              : ({ args, options, dynamicArgs, dynamicOptions }) => {
                console.log('Image:', args.image);
                console.log('Known options:', options);
                console.log('Extra args:', dynamicArgs);     // ['npm', 'start']
                console.log('Extra options:', dynamicOptions); # { p: '3000:3000', e: 'NODE_ENV=prod' }
            }
        })
        .build()
        .run();
        ```

        ```bash
        # All unknown args/options are captured
        docker run -d --name myapp node:18 -p 3000:3000 -e NODE_ENV=prod npm start

        # Result:
        # args.image          = 'node:18'
        # options.detach      = true
        # options.name        = 'myapp'
        # dynamicArgs         = ['npm', 'start']
        # dynamicOptions      = { p: '3000:3000', e: 'NODE_ENV=prod' }
        ```

       #### Use Cases

        - **Command execution**: `npm exec`, `docker run`, `kubectl exec`

        - **Proxy commands**: Pass arguments to underlying tools

        - **Flexible APIs**: Accept user-defined flags without pre-definition

        ```typescript
       // Example: npm-like exec command
        .command({
            name                : 'exec',
            args                : [{ name: 'package', required: true }],
            allowDynamicArgs    : true,
            allowDynamicOptions : true,
            action              : ({ args, dynamicArgs, dynamicOptions }) => {
                // Run package with all extra args/options
                runPackage(args.package, dynamicArgs, dynamicOptions);
            }
        })
        ```

        ```bash
        myapp exec vite --port 3000 --host build --minify
       // args.package    = 'vite'
       // dynamicArgs     = ['build', '--minify']
       // dynamicOptions  = { port: '3000', host: true }
        ```

        <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

    - ### Built-in Flags

        ```bash
        myapp --help         # show all commands
        myapp create --help  # show command help
        myapp --version      # show version
        ```

    - ### Validation

        ```typescript
       // Argument validation
        args: [{
            name      : 'port',
            validate  : (v) => Number(v) > 0 || 'Port must be positive'
        }]

       // Option validation
        options: [{
            name      : 'env',
            flag      : '--env',
            validate  : (v) => ['dev','prod'].includes(v) || 'Invalid env'
        }]
        ```

        <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

    - ### Type Conversion

        ```typescript
        options: [
            { name: 'port', flag: '-p', type: 'number' },   // "3000" → 3000
            { name: 'verbose', flag: '-v', type: 'boolean' }, # flag → true
            { name: 'name', flag: '-n', type: 'string' }     // default
        ]
        ```

        <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

    - ### Multiple Commands

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

    - ### Aliases

        ```typescript
       // Command aliases
        .command({
            name      : 'create',
            aliases   : ['c', 'new', 'init']
        })

       // Option aliases
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

    - ### Error Handling

        ```typescript
        import { CLIError, ValidationError, CommandNotFoundError } from '@je-es/cli';

        .command({
        name: 'deploy',
            action: async () => {
                throw new CLIError('Deployment failed', 'DEPLOY_ERROR');
            }
        })
        ```

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->



<!-- ╔══════════════════════════════ END ══════════════════════════════╗ -->

<br>

---

<div align="center">
    <a href="https://github.com/solution-lib/space"><img src="https://img.shields.io/badge/by-Space-black"/></a>
</div>

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->
