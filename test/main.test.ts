// test/main.test.ts
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test'
    import { cli, CLI } from '../src/main';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TEST ════════════════════════════════════════╗

    describe('@je-es/cli', () => {
        let consoleSpy: ReturnType<typeof mock>;
        let consoleErrorSpy: ReturnType<typeof mock>;
        let exitSpy: ReturnType<typeof mock>;

        beforeEach(() => {
            consoleSpy = mock(() => {});
            console.log = consoleSpy;

            consoleErrorSpy = mock(() => {});
            console.error = consoleErrorSpy;

            exitSpy = mock(() => {});
            process.exit = exitSpy as any;
        });

        afterEach(() => {
            consoleSpy.mockRestore();
            consoleErrorSpy.mockRestore();
            exitSpy.mockRestore();
        });

        describe('Builder API', () => {
            test('should create CLI instance with builder', () => {
                const app = cli('test', '1.0.0').build();
                expect(app).toBeInstanceOf(CLI);
            });

            test('should chain builder methods', () => {
                const app = cli('test', '1.0.0')
                    .description('Test CLI')
                    .command({
                    name: 'hello',
                    action: () => console.log('Hello')
                    })
                    .build();

                expect(app).toBeInstanceOf(CLI);
            });
        });

        describe('Command Parsing', () => {
            test('should parse simple command', async () => {
                const action = mock(() => {});
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'hello',
                    action
                    })
                    .build();

                await app.run(['hello']);
                expect(action).toHaveBeenCalled();
            });

            test('should parse command with arguments', async () => {
                const action = mock(() => {});
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'create',
                    args: [{ name: 'name', required: true }],
                    action
                    })
                    .build();

                await app.run(['create', 'myproject']);
                expect(action).toHaveBeenCalledWith({
                    args: { name: 'myproject' },
                    options: {}
                });
            });

            test('should parse command with options', async () => {
                const action = mock(() => {});
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'create',
                    args: [{ name: 'name', required: true }],
                    options: [
                        { name: 'force', flag: '-f', type: 'boolean', default: false },
                        { name: 'type', flag: '-t', type: 'string' }
                    ],
                    action
                    })
                    .build();

                await app.run(['create', 'myproject', '-f', '-t', 'npm']);
                expect(action).toHaveBeenCalledWith({
                    args: { name: 'myproject' },
                    options: { force: true, type: 'npm' }
                });
            });

            test('should handle long options', async () => {
                const action = mock(() => {});
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'create',
                    args: [{ name: 'name', required: true }],
                    options: [
                        { name: 'force', flag: '--force', type: 'boolean', default: false }
                    ],
                    action
                    })
                    .build();

                await app.run(['create', 'myproject', '--force']);
                expect(action).toHaveBeenCalledWith({
                    args: { name: 'myproject' },
                    options: { force: true }
                });
            });

            test('should handle option with equals syntax', async () => {
                const action = mock(() => {});
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'create',
                    args: [{ name: 'name', required: true }],
                    options: [
                        { name: 'type', flag: '--type', type: 'string' }
                    ],
                    action
                    })
                    .build();

                await app.run(['create', 'myproject', '--type=npm']);
                expect(action).toHaveBeenCalledWith({
                    args: { name: 'myproject' },
                    options: { type: 'npm' }
                });
            });

            test('should handle command aliases', async () => {
                const action = mock(() => {});
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'create',
                    aliases: ['c', 'new'],
                    action
                    })
                    .build();

                await app.run(['c']);
                expect(action).toHaveBeenCalled();

                action.mockClear();
                await app.run(['new']);
                expect(action).toHaveBeenCalled();
            });

            test('should handle option aliases', async () => {
                const action = mock(() => {});
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'create',
                    args: [{ name: 'name', required: true }],
                    options: [
                        {
                        name: 'force',
                        flag: '-f',
                        aliases: ['--force'],
                        type: 'boolean',
                        default: false
                        }
                    ],
                    action
                    })
                    .build();

                await app.run(['create', 'myproject', '--force']);
                expect(action).toHaveBeenCalledWith({
                    args: { name: 'myproject' },
                    options: { force: true }
                });
            });
        });

        describe('Validation', () => {
            test('should throw error for missing required argument', async () => {
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'create',
                    args: [{ name: 'name', required: true }],
                    action: mock(() => {})
                    })
                    .build();

                await app.run(['create']);
                expect(exitSpy).toHaveBeenCalledWith(1);
            });

            test('should throw error for missing required option', async () => {
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'create',
                    args: [{ name: 'name', required: true }],
                    options: [
                        { name: 'type', flag: '-t', type: 'string', required: true }
                    ],
                    action: mock(() => {})
                    })
                    .build();

                await app.run(['create', 'myproject']);
                expect(exitSpy).toHaveBeenCalledWith(1);
            });

            test('should validate argument with custom validator', async () => {
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'create',
                    args: [
                        {
                        name: 'name',
                        required: true,
                        validate: (val) => val.length > 3 || 'Name must be longer than 3 characters'
                        }
                    ],
                    action: mock(() => {})
                    })
                    .build();

                await app.run(['create', 'ab']);
                expect(exitSpy).toHaveBeenCalledWith(1);
            });

            test('should validate option with custom validator', async () => {
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'create',
                    args: [{ name: 'name', required: true }],
                    options: [
                        {
                        name: 'type',
                        flag: '-t',
                        type: 'string',
                        required: true,
                        validate: (val) => ['npm', 'yarn'].includes(val) || 'Invalid type'
                        }
                    ],
                    action: mock(() => {})
                    })
                    .build();

                await app.run(['create', 'myproject', '-t', 'invalid']);
                expect(exitSpy).toHaveBeenCalledWith(1);
            });

            test('should use default values for optional arguments', async () => {
                const action = mock(() => {});
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'create',
                    args: [
                        { name: 'name', required: false, default: 'myproject' }
                    ],
                    action
                    })
                    .build();

                await app.run(['create']);
                expect(action).toHaveBeenCalledWith({
                    args: { name: 'myproject' },
                    options: {}
                });
            });

            test('should use default values for options', async () => {
                const action = mock(() => {});
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'create',
                    args: [{ name: 'name', required: true }],
                    options: [
                        { name: 'force', flag: '-f', type: 'boolean', default: false }
                    ],
                    action
                    })
                    .build();

                await app.run(['create', 'myproject']);
                expect(action).toHaveBeenCalledWith({
                    args: { name: 'myproject' },
                    options: { force: false }
                });
            });

            test('should throw error for unknown options when dynamic options disabled', async () => {
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'test',
                    allowDynamicOptions: false,
                    action: mock(() => {})
                    })
                    .build();

                await app.run(['test', '--unknown']);
                expect(exitSpy).toHaveBeenCalledWith(1);
            });

            test('should throw error for extra positional args when dynamic args disabled', async () => {
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'test',
                    args: [{ name: 'name', required: true }],
                    allowDynamicArgs: false,
                    action: mock(() => {})
                    })
                    .build();

                await app.run(['test', 'arg1', 'arg2']);
                expect(exitSpy).toHaveBeenCalledWith(1);
            });
        });

        describe('Type Conversion', () => {
            test('should convert option to number', async () => {
                const action = mock(() => {});
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'test',
                    options: [
                        { name: 'port', flag: '-p', type: 'number' }
                    ],
                    action
                    })
                    .build();

                await app.run(['test', '-p', '3000']);
                expect(action).toHaveBeenCalledWith({
                    args: {},
                    options: { port: 3000 }
                });
            });

            test('should throw error for invalid number', async () => {
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'test',
                    options: [
                        { name: 'port', flag: '-p', type: 'number' }
                    ],
                    action: mock(() => {})
                    })
                    .build();

                await app.run(['test', '-p', 'invalid']);
                expect(exitSpy).toHaveBeenCalledWith(1);
            });

            test('should convert option to boolean', async () => {
                const action = mock(() => {});
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'test',
                    options: [
                        { name: 'verbose', flag: '-v', type: 'boolean', default: false }
                    ],
                    action
                    })
                    .build();

                await app.run(['test', '-v']);
                expect(action).toHaveBeenCalledWith({
                    args: {},
                    options: { verbose: true }
                });
            });
        });

        describe('Dynamic Arguments and Options', () => {
            test('should capture dynamic arguments when enabled', async () => {
                const action = mock(() => {});
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'exec',
                    args: [{ name: 'command', required: true }],
                    allowDynamicArgs: true,
                    action
                    })
                    .build();

                await app.run(['exec', 'node', 'script.js', '--production']);
                expect(action).toHaveBeenCalledWith({
                    args: { command: 'node' },
                    options: {},
                    dynamicArgs: ['script.js', '--production']
                });
            });

            test('should capture dynamic options when enabled', async () => {
                const action = mock(() => {});
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'exec',
                    args: [{ name: 'command', required: true }],
                    allowDynamicOptions: true,
                    action
                    })
                    .build();

                await app.run(['exec', 'node', '--experimental', '--max-old-space=4096']);
                expect(action).toHaveBeenCalledWith({
                    args: { command: 'node' },
                    options: {},
                    dynamicOptions: { experimental: true, 'max-old-space': '4096' }
                });
            });

            test('should handle both dynamic args and options together', async () => {
                const action = mock(() => {});
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'exec',
                    args: [{ name: 'command', required: true }],
                    options: [
                        { name: 'cwd', flag: '--cwd', type: 'string' }
                    ],
                    allowDynamicArgs: true,
                    allowDynamicOptions: true,
                    action
                    })
                    .build();

                await app.run(['exec', 'npm', 'install', 'react', '--cwd', '/app', '--save-dev', '--legacy-peer-deps']);
                expect(action).toHaveBeenCalledWith({
                    args: { command: 'npm' },
                    options: { cwd: '/app' },
                    dynamicArgs: ['install', 'react'],
                    dynamicOptions: { 'save-dev': true, 'legacy-peer-deps': true }
                });
            });

            test('should separate known and unknown options correctly', async () => {
                const action = mock(() => {});
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'run',
                    options: [
                        { name: 'verbose', flag: '-v', type: 'boolean', default: false },
                        { name: 'config', flag: '-c', type: 'string' }
                    ],
                    allowDynamicOptions: true,
                    action
                    })
                    .build();

                await app.run(['run', '-v', '-c', 'app.json', '--unknown1', '--unknown2', 'value']);
                expect(action).toHaveBeenCalledWith({
                    args: {},
                    options: { verbose: true, config: 'app.json' },
                    dynamicOptions: { unknown1: true, unknown2: 'value' }
                });
            });

            test('should handle empty dynamic arrays when none provided', async () => {
                const action = mock(() => {});
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'exec',
                    args: [{ name: 'command', required: true }],
                    allowDynamicArgs: true,
                    allowDynamicOptions: true,
                    action
                    })
                    .build();

                await app.run(['exec', 'node']);
                expect(action).toHaveBeenCalledWith({
                    args: { command: 'node' },
                    options: {},
                    dynamicArgs: [],
                    dynamicOptions: {}
                });
            });

            test('should work with complex exec-like command', async () => {
                const action = mock(() => {});
                const app = cli('docker', '1.0.0')
                    .command({
                    name: 'run',
                    args: [{ name: 'image', required: true }],
                    options: [
                        { name: 'detach', flag: '-d', type: 'boolean', default: false },
                        { name: 'name', flag: '--name', type: 'string' }
                    ],
                    allowDynamicArgs: true,
                    allowDynamicOptions: true,
                    action
                    })
                    .build();

                await app.run(['run', '-d', '--name', 'myapp', 'node:18', '-p', '3000:3000', '-e', 'NODE_ENV=production', 'npm', 'start']);
                expect(action).toHaveBeenCalledWith({
                    args: { image: 'node:18' },
                    options: { detach: true, name: 'myapp' },
                    dynamicArgs: ['npm', 'start'],
                    dynamicOptions: { p: '3000:3000', e: 'NODE_ENV=production' }
                });
            });
        });

        describe('Help System', () => {
            test('should show help with -h flag', async () => {
                const app = cli('test', '1.0.0')
                    .description('Test CLI')
                    .build();

                await app.run(['-h']);
                expect(consoleSpy).toHaveBeenCalled();
            });

            test('should show help with --help flag', async () => {
                const app = cli('test', '1.0.0')
                    .description('Test CLI')
                    .build();

                await app.run(['--help']);
                expect(consoleSpy).toHaveBeenCalled();
            });

            test('should show version with -v flag', async () => {
                const app = cli('test', '1.0.0').build();

                await app.run(['-v']);
                expect(consoleSpy).toHaveBeenCalledWith('test v1.0.0');
            });

            test('should show version with --version flag', async () => {
                const app = cli('test', '1.0.0').build();

                await app.run(['--version']);
                expect(consoleSpy).toHaveBeenCalledWith('test v1.0.0');
            });

            test('should show command-specific help', async () => {
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'create',
                    description: 'Create a project',
                    args: [{ name: 'name', required: true, description: 'Project name' }],
                    options: [
                        { name: 'force', flag: '-f', description: 'Force creation' }
                    ]
                    })
                    .build();

                await app.run(['create', '--help']);
                expect(consoleSpy).toHaveBeenCalled();
            });

            test('should show dynamic indicators in help', async () => {
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'exec',
                    description: 'Execute command',
                    args: [{ name: 'command', required: true }],
                    allowDynamicArgs: true,
                    allowDynamicOptions: true
                    })
                    .build();

                await app.run(['exec', '--help']);
                expect(consoleSpy).toHaveBeenCalled();
                const helpOutput = consoleSpy.mock.calls.map(call => call[0]).join('\n');
                expect(helpOutput).toContain('[...]');
                expect(helpOutput).toContain('additional arguments allowed');
                expect(helpOutput).toContain('additional options allowed');
            });
        });

        describe('Error Handling', () => {
            test('should throw CommandNotFoundError for unknown command', async () => {
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'create',
                    action: mock(() => {})
                    })
                    .build();

                await app.run(['unknown']);
                expect(exitSpy).toHaveBeenCalledWith(1);
            });

            test('should handle async action errors', async () => {
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'test',
                    action: async () => {
                        throw new Error('Test error');
                    }
                    })
                    .build();

                await app.run(['test']);
                expect(exitSpy).toHaveBeenCalledWith(1);
            });
        });

        describe('Complex Scenarios', () => {
            test('should handle multiple arguments and options', async () => {
                const action = mock(() => {});
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'person',
                    args: [
                        { name: 'name', required: true },
                        { name: 'age', required: true }
                    ],
                    options: [
                        { name: 'career', flag: '--career', type: 'string', required: true },
                        { name: 'force', flag: '-f', type: 'boolean', default: false }
                    ],
                    action
                    })
                    .build();

                await app.run(['person', 'maysara', '24', '--career', 'developer', '-f']);
                expect(action).toHaveBeenCalledWith({
                    args: { name: 'maysara', age: '24' },
                    options: { career: 'developer', force: true }
                });
            });

            test('should handle mixed short and long options', async () => {
                const action = mock(() => {});
                const app = cli('test', '1.0.0')
                    .command({
                    name: 'test',
                    options: [
                        { name: 'verbose', flag: '-v', type: 'boolean', default: false },
                        { name: 'output', flag: '--output', type: 'string' }
                    ],
                    action
                    })
                    .build();

                await app.run(['test', '-v', '--output', 'result.txt']);
                expect(action).toHaveBeenCalledWith({
                    args: {},
                    options: { verbose: true, output: 'result.txt' }
                });
            });
        });
    });

// ╚══════════════════════════════════════════════════════════════════════════════════════╝