/* ---------------------------------------- PACK ----------------------------------------  */

    import { cli, t_cli }                   from '../../dist/main';

/* ---------------------------------------- ---- ----------------------------------------  */



/* ---------------------------------------- TEST ----------------------------------------  */

    // describe("Basic Tests", () =>
    // {
    //     test("Should be defined !", () =>
    //     {
    //         expect(Dummy).toBeDefined();
    //     });
    // });

    // Mock process.argv
    const originalArgv = process.argv;
    beforeEach(() => process.argv = ['node', 'cli.ts'] );

    afterEach(() => process.argv = originalArgv );

    describe('cli', () =>
    {
        // Mock callback function
        const mockCallback = jest.fn();

        const options: t_cli =
        {
            info: {
            name: 'Test CLI',
            description: 'Testing CLI',
            version: '1.0.0',
            },
            actions: {
            test: {
                flag: 't',
                alias: 'test',
                args: ['arg1', 'arg2'],
                callback: mockCallback,
            },
            },
        };

        it('should execute callback function when valid command is passed', () =>
        {
            // Mock process.argv with valid command
            process.argv.push('-test', 'value1', 'value2');
            cli(options);
            expect(mockCallback).toHaveBeenCalledWith({ arg1: 'value1', arg2: 'value2' });
        });

        it('should log error message when command not found', () =>
        {
            // Mock process.argv with invalid command
            process.argv.push('-invalid');
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            cli(options);
            expect(consoleSpy).toHaveBeenCalledWith("Command 'invalid' not found.");
        });
    });

/* ---------------------------------------- ---- ----------------------------------------  */