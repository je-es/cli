/**
 * @name                                    main.spec.ts
*/



/* ┌─────────────────────────────────────── TYPE ───────────────────────────────────────┐  */

    import { cli, t_cli }                   from '../code/main';

/* └────────────────────────────────────────────────────────────────────────────────────┘  */



/* ┌─────────────────────────────────────── TEST ───────────────────────────────────────┐  */

    describe('CLI', () =>
    {
        let originalArgs: string[];

        beforeEach(() => { originalArgs = process.argv; });

        afterEach(() => { process.argv = originalArgs; });

        const options: t_cli =
        {
            info:
            {
                name    : 'myCLI',
                desc    : 'A simple CLI application',
                vers    : '1.0.0'
            },

            actions:
            {
                create:
                {
                    flag            : '-c',
                    alias           : '--create',
                    args            : ['name'],
                    requires        : ['as'],
                    options         : ['force'],
                    callback        : (args: { name: string, type: string, force?: boolean }) =>
                    {
                        console.log(`Creating project '${args.name}' as ${args.type}, forced: ${args.force}'.`);
                    }
                },

                as:
                {
                    alias           : '--as',
                    args            : ['type']
                },

                force:
                {
                    flag            : '-f',
                    alias           : '--force',
                },

                person:
                {
                    flag            : '-p',
                    alias           : '--person',
                    args            : ['name', 'age'],
                    requires        : ['career'],
                    options         : ['force'],
                    callback        : (args: { name: string, age: string, career: string, force?: boolean }) =>
                    {
                        console.log(`Creating person '${args.name}' with age ${args.age} and career ${args.career}' with forced: ${args.force}.`);
                    }
                },

                career:
                {
                    alias           : '--career',
                    args            : ['career']
                },
            }
        };

        it('should be defined', () =>
        {
            expect(cli).toBeDefined();
        });

        it('should be a function', () =>
        {
            expect(cli).toBeInstanceOf(Function);
        });

        it('should throw if action not found', () =>
        {
            process.argv = ['npx', 'myCLI', '--create', 'myApp', '--as', 'npm', '--invalidArg'];
            expect(() => cli(options)).toThrow();
        });

        it('should not throw if action is found', () =>
        {
            process.argv = ['npx', 'myCLI', '--create', 'myApp', '--as', 'npm', '-f'];
            expect(() => cli(options)).not.toThrow();
        });

        it('should throw if action arguments are missing', () =>
        {
            process.argv = ['npx', 'myCLI', '--person', 'maysara', '--career', 'developer'];
            expect(() => cli(options)).toThrow();
        });

        it('should not throw if action arguments are provided', () =>
        {
            process.argv = ['npx', 'myCLI', '--person', 'maysara', '24', '--career', 'developer'];
            expect(() => cli(options)).not.toThrow();
        });

        it('should throw if action requires are not found', () =>
        {
            process.argv = ['npx', 'myCLI', '--person', 'maysara', '24'];
            expect(() => cli(options)).toThrow();

            process.argv = ['npx', 'myCLI', '--person', 'maysara', '24', '--career'];
            expect(() => cli(options)).toThrow();
        });

        it('should not throw if action requires are found', () =>
        {
            process.argv = ['npx', 'myCLI', '--person', 'maysara', '24', '--career', 'developer', '--force'];
            expect(() => cli(options)).not.toThrow();
        });

    });

/* └────────────────────────────────────────────────────────────────────────────────────┘  */