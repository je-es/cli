// src/core/parser.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class ArgumentParser {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            private tokens      : string[] = [];
            private position    = 0;

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ──────────────────────────────┐

            parse(args: string[]): { command?: string; options: Record<string, string | boolean>; positional: string[] } {
                this.tokens = args;
                this.position = 0;

                const result: { command?: string; options: Record<string, string | boolean>; positional: string[] } = {
                options: {},
                positional: []
                };

                // First token might be a command
                if (this.hasNext() && !this.peek().startsWith('-')) {
                result.command = this.consume();
                }

                while (this.hasNext()) {
                    const token = this.consume();

                    if (token.startsWith('--')) {
                        // Long option
                        const [key, value] = token.slice(2).split('=');
                        if (value !== undefined) {
                            result.options[key] = value;
                        } else if (this.hasNext() && !this.peek().startsWith('-')) {
                            result.options[key] = this.consume();
                        } else {
                            result.options[key] = true;
                        }
                    } else if (token.startsWith('-') && token.length > 1) {
                        // Short option(s)
                        const flags = token.slice(1).split('');
                        for (let i = 0; i < flags.length; i++) {
                            const flag = flags[i];
                            if (i === flags.length - 1 && this.hasNext() && !this.peek().startsWith('-')) {
                                result.options[flag] = this.consume();
                            } else {
                                result.options[flag] = true;
                            }
                        }
                    } else {
                        // Positional argument
                        result.positional.push(token);
                    }
                }

                return result;
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── HELP ──────────────────────────────┐

            private hasNext(): boolean {
                return this.position < this.tokens.length;
            }

            private peek(): string {
                return this.tokens[this.position];
            }

            private consume(): string {
                return this.tokens[this.position++];
            }

        // └────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝