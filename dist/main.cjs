"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/main.ts
var main_exports = {};
__export(main_exports, {
  CLI: () => CLI,
  CLIBuilder: () => CLIBuilder,
  CLIError: () => CLIError,
  CommandNotFoundError: () => CommandNotFoundError,
  ValidationError: () => ValidationError,
  cli: () => cli
});
module.exports = __toCommonJS(main_exports);

// src/lib/cli.ts
var CLIError = class _CLIError extends Error {
  constructor(message, code = "CLI_ERROR") {
    var _a;
    super(message);
    this.code = code;
    this.name = "CLIError";
    (_a = Error.captureStackTrace) == null ? void 0 : _a.call(Error, this, _CLIError);
  }
};
var ValidationError = class extends CLIError {
  constructor(message) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
};
var CommandNotFoundError = class extends CLIError {
  constructor(command) {
    super(`Command '${command}' not found`, "COMMAND_NOT_FOUND");
    this.name = "CommandNotFoundError";
  }
};
var ArgumentParser = class {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }
  parse(args) {
    this.tokens = args;
    this.position = 0;
    const result = {
      options: {},
      positional: []
    };
    if (this.hasNext() && !this.peek().startsWith("-")) {
      result.command = this.consume();
    }
    while (this.hasNext()) {
      const token = this.consume();
      if (token.startsWith("--")) {
        const [key, value] = token.slice(2).split("=");
        if (value !== void 0) {
          result.options[key] = value;
        } else if (this.hasNext() && !this.peek().startsWith("-")) {
          result.options[key] = this.consume();
        } else {
          result.options[key] = true;
        }
      } else if (token.startsWith("-") && token.length > 1) {
        const flags = token.slice(1).split("");
        for (let i = 0; i < flags.length; i++) {
          const flag = flags[i];
          if (i === flags.length - 1 && this.hasNext() && !this.peek().startsWith("-")) {
            result.options[flag] = this.consume();
          } else {
            result.options[flag] = true;
          }
        }
      } else {
        result.positional.push(token);
      }
    }
    return result;
  }
  hasNext() {
    return this.position < this.tokens.length;
  }
  peek() {
    return this.tokens[this.position];
  }
  consume() {
    return this.tokens[this.position++];
  }
};
var CLI = class {
  constructor(config) {
    this.commands = /* @__PURE__ */ new Map();
    this.globalOptions = /* @__PURE__ */ new Map();
    this.parser = new ArgumentParser();
    this.config = config;
    this.initializeCommands();
    this.initializeGlobalOptions();
  }
  initializeCommands() {
    if (!this.config.commands) return;
    for (const cmd of this.config.commands) {
      this.commands.set(cmd.name, cmd);
      if (cmd.aliases) {
        for (const alias of cmd.aliases) {
          this.commands.set(alias, cmd);
        }
      }
    }
  }
  initializeGlobalOptions() {
    if (!this.config.globalOptions) return;
    for (const opt of this.config.globalOptions) {
      this.globalOptions.set(opt.name, opt);
      this.globalOptions.set(opt.flag, opt);
      if (opt.aliases) {
        for (const alias of opt.aliases) {
          this.globalOptions.set(alias, opt);
        }
      }
    }
  }
  run() {
    return __async(this, arguments, function* (argv = process.argv.slice(2)) {
      var _a;
      try {
        const parsed = this.parser.parse(argv);
        if (parsed.options.help || parsed.options.h) {
          this.showHelp(parsed.command);
          return;
        }
        if (!parsed.command) {
          if (parsed.options.version || parsed.options.v) {
            console.log(`${this.config.name} v${this.config.version}`);
            return;
          }
          if (this.commands.size === 0) {
            throw new CLIError("No command specified");
          }
          this.showHelp();
          return;
        }
        const command = this.commands.get(parsed.command);
        if (!command) {
          throw new CommandNotFoundError(parsed.command);
        }
        const commandUsesV = (_a = command.options) == null ? void 0 : _a.some(
          (opt) => {
            var _a2;
            return opt.flag === "-v" || ((_a2 = opt.aliases) == null ? void 0 : _a2.includes("-v"));
          }
        );
        if (!commandUsesV && (parsed.options.version || parsed.options.v)) {
          console.log(`${this.config.name} v${this.config.version}`);
          return;
        }
        if (command.allowDynamicArgs) {
          const reparsed = this.reparseForDynamicArgs(argv, parsed.command);
          const result = this.parseCommand(command, reparsed.positional, reparsed.options);
          if (command.action) {
            yield command.action(result);
          }
        } else {
          const result = this.parseCommand(command, parsed.positional, parsed.options);
          if (command.action) {
            yield command.action(result);
          }
        }
      } catch (error) {
        this.handleError(error);
      }
    });
  }
  reparseForDynamicArgs(argv, commandName) {
    var _a, _b, _c;
    let idx = 0;
    while (idx < argv.length && argv[idx] !== commandName) {
      idx++;
    }
    idx++;
    const positional = [];
    const options = {};
    const command = this.commands.get(commandName);
    const numRequiredArgs = ((_a = command == null ? void 0 : command.args) == null ? void 0 : _a.filter((a) => a.required !== false).length) || 0;
    let argsConsumed = 0;
    while (idx < argv.length) {
      const token = argv[idx];
      if (argsConsumed < numRequiredArgs && !token.startsWith("-")) {
        positional.push(token);
        argsConsumed++;
        idx++;
        continue;
      }
      if (token.startsWith("--")) {
        const [key, value] = token.slice(2).split("=");
        const isKnownOption = (_b = command == null ? void 0 : command.options) == null ? void 0 : _b.some(
          (o) => {
            var _a2;
            return o.flag === `--${key}` || o.name === key || ((_a2 = o.aliases) == null ? void 0 : _a2.includes(`--${key}`));
          }
        );
        if (isKnownOption) {
          if (value !== void 0) {
            options[key] = value;
          } else if (idx + 1 < argv.length && !argv[idx + 1].startsWith("-")) {
            options[key] = argv[idx + 1];
            idx++;
          } else {
            options[key] = true;
          }
        } else {
          positional.push(token);
          if (value === void 0 && idx + 1 < argv.length && !argv[idx + 1].startsWith("-")) {
            positional.push(argv[idx + 1]);
            idx++;
          }
        }
      } else if (token.startsWith("-") && token.length > 1 && isNaN(Number(token))) {
        const flags = token.slice(1).split("");
        let allKnown = true;
        for (const flag of flags) {
          const isKnownOption = (_c = command == null ? void 0 : command.options) == null ? void 0 : _c.some(
            (o) => {
              var _a2;
              return o.flag === `-${flag}` || ((_a2 = o.aliases) == null ? void 0 : _a2.includes(`-${flag}`));
            }
          );
          if (!isKnownOption) {
            allKnown = false;
            break;
          }
        }
        if (allKnown) {
          for (let i = 0; i < flags.length; i++) {
            const flag = flags[i];
            if (i === flags.length - 1 && idx + 1 < argv.length && !argv[idx + 1].startsWith("-")) {
              options[flag] = argv[idx + 1];
              idx++;
            } else {
              options[flag] = true;
            }
          }
        } else {
          positional.push(token);
          if (idx + 1 < argv.length && !argv[idx + 1].startsWith("-")) {
            positional.push(argv[idx + 1]);
            idx++;
          }
        }
      } else {
        positional.push(token);
      }
      idx++;
    }
    return { positional, options };
  }
  parseCommand(command, positional, rawOptions) {
    const result = { args: {}, options: {} };
    const knownOptionKeys = /* @__PURE__ */ new Set();
    if (command.options) {
      for (const opt of command.options) {
        knownOptionKeys.add(opt.name);
        knownOptionKeys.add(opt.flag.replace(/^-+/, ""));
        if (opt.aliases) {
          opt.aliases.forEach((a) => knownOptionKeys.add(a.replace(/^-+/, "")));
        }
      }
    }
    let dynamicArgsStart = 0;
    if (command.args) {
      for (let i = 0; i < command.args.length; i++) {
        const argConfig = command.args[i];
        const value = positional[i];
        if (!value) {
          if (argConfig.required !== false) {
            throw new ValidationError(`Missing required argument: ${argConfig.name}`);
          }
          result.args[argConfig.name] = argConfig.default;
          continue;
        }
        if (argConfig.validate) {
          const validation = argConfig.validate(value);
          if (validation !== true) {
            throw new ValidationError(
              typeof validation === "string" ? validation : `Invalid value for argument '${argConfig.name}': ${value}`
            );
          }
        }
        result.args[argConfig.name] = value;
        dynamicArgsStart = i + 1;
      }
    }
    const dynamicOptions = {};
    const optionIndices = /* @__PURE__ */ new Set();
    if (command.options) {
      for (const optConfig of command.options) {
        const value = this.getOptionValue(optConfig, rawOptions);
        if (value === void 0) {
          if (optConfig.required) {
            throw new ValidationError(`Missing required option: --${optConfig.name}`);
          }
          result.options[optConfig.name] = optConfig.default;
          continue;
        }
        const converted = this.convertOptionType(value, optConfig.type);
        if (optConfig.validate) {
          const validation = optConfig.validate(converted);
          if (validation !== true) {
            throw new ValidationError(
              typeof validation === "string" ? validation : `Invalid value for option '${optConfig.name}': ${converted}`
            );
          }
        }
        result.options[optConfig.name] = converted;
      }
    }
    for (const [key, value] of Object.entries(rawOptions)) {
      if (!knownOptionKeys.has(key)) {
        dynamicOptions[key] = value;
      }
    }
    if (command.allowDynamicOptions) {
      let i = dynamicArgsStart;
      while (i < positional.length) {
        const token = positional[i];
        if (token.startsWith("--")) {
          const [key, value] = token.slice(2).split("=");
          optionIndices.add(i);
          if (value !== void 0) {
            dynamicOptions[key] = value;
            i++;
          } else if (i + 1 < positional.length && !positional[i + 1].startsWith("-")) {
            dynamicOptions[key] = positional[i + 1];
            optionIndices.add(i + 1);
            i += 2;
          } else {
            dynamicOptions[key] = true;
            i++;
          }
        } else if (token.startsWith("-") && token.length > 1 && isNaN(Number(token))) {
          optionIndices.add(i);
          const flags = token.slice(1).split("");
          for (let j = 0; j < flags.length; j++) {
            const flag = flags[j];
            if (j === flags.length - 1 && i + 1 < positional.length && !positional[i + 1].startsWith("-")) {
              dynamicOptions[flag] = positional[i + 1];
              optionIndices.add(i + 1);
              i++;
            } else {
              dynamicOptions[flag] = true;
            }
          }
          i++;
        } else {
          i++;
        }
      }
    }
    if (command.allowDynamicArgs) {
      const dynamicArgs = [];
      for (let i = dynamicArgsStart; i < positional.length; i++) {
        if (!optionIndices.has(i)) {
          dynamicArgs.push(positional[i]);
        }
      }
      result.dynamicArgs = dynamicArgs;
    } else if (positional.length > dynamicArgsStart) {
      throw new ValidationError(`Unexpected argument: ${positional[dynamicArgsStart]}`);
    }
    if (command.allowDynamicOptions) {
      result.dynamicOptions = dynamicOptions;
    } else if (Object.keys(dynamicOptions).length > 0) {
      const unknownKey = Object.keys(dynamicOptions)[0];
      throw new ValidationError(`Unknown option: ${unknownKey.length === 1 ? "-" : "--"}${unknownKey}`);
    }
    return result;
  }
  getOptionValue(config, rawOptions) {
    if (rawOptions[config.name] !== void 0) {
      return rawOptions[config.name];
    }
    const flag = config.flag.replace(/^-+/, "");
    if (rawOptions[flag] !== void 0) {
      return rawOptions[flag];
    }
    if (config.aliases) {
      for (const alias of config.aliases) {
        const cleanAlias = alias.replace(/^-+/, "");
        if (rawOptions[cleanAlias] !== void 0) {
          return rawOptions[cleanAlias];
        }
      }
    }
    return void 0;
  }
  convertOptionType(value, type) {
    if (type === "number") {
      const num = Number(value);
      if (isNaN(num)) {
        throw new ValidationError(`Expected number, got: ${value}`);
      }
      return num;
    }
    if (type === "boolean") {
      if (value === true || value === "true") return true;
      if (value === false || value === "false") return false;
      return !!value;
    }
    return String(value);
  }
  showHelp(commandName) {
    if (commandName) {
      const command = this.commands.get(commandName);
      if (command) {
        this.showCommandHelp(command);
        return;
      }
    }
    console.log(`${this.config.name} v${this.config.version}`);
    if (this.config.description) {
      console.log(this.config.description);
    }
    console.log();
    console.log("USAGE:");
    console.log(`  ${this.config.name} <command> [options]`);
    console.log();
    console.log("COMMANDS:");
    const uniqueCommands = /* @__PURE__ */ new Map();
    for (const [name, cmd] of this.commands) {
      if (name === cmd.name) {
        uniqueCommands.set(name, cmd);
      }
    }
    for (const [name, cmd] of uniqueCommands) {
      const aliases = cmd.aliases ? ` (${cmd.aliases.join(", ")})` : "";
      console.log(`  ${name}${aliases}`);
      if (cmd.description) {
        console.log(`    ${cmd.description}`);
      }
    }
    console.log();
    console.log("OPTIONS:");
    console.log("  -h, --help       Show help");
    console.log("  -v, --version    Show version");
  }
  showCommandHelp(command) {
    console.log(`${command.name}`);
    if (command.description) {
      console.log(command.description);
    }
    console.log();
    let usage = `${this.config.name} ${command.name}`;
    if (command.args) {
      usage += " " + command.args.map(
        (a) => a.required !== false ? `<${a.name}>` : `[${a.name}]`
      ).join(" ");
    }
    if (command.allowDynamicArgs) {
      usage += " [...]";
    }
    console.log("USAGE:");
    console.log(`  ${usage}`);
    console.log();
    if (command.args && command.args.length > 0) {
      console.log("ARGUMENTS:");
      for (const arg of command.args) {
        const req = arg.required !== false ? "required" : "optional";
        console.log(`  ${arg.name} (${req})`);
        if (arg.description) {
          console.log(`    ${arg.description}`);
        }
      }
      if (command.allowDynamicArgs) {
        console.log(`  ... (additional arguments allowed)`);
      }
      console.log();
    }
    if (command.options && command.options.length > 0) {
      console.log("OPTIONS:");
      for (const opt of command.options) {
        const aliases = opt.aliases ? `, ${opt.aliases.join(", ")}` : "";
        const req = opt.required ? " (required)" : "";
        console.log(`  ${opt.flag}${aliases}${req}`);
        if (opt.description) {
          console.log(`    ${opt.description}`);
        }
      }
    }
    if (command.allowDynamicOptions) {
      console.log(`  ... (additional options allowed)`);
    }
    if (command.options && command.options.length > 0 || command.allowDynamicOptions) {
      console.log();
    }
    if (command.examples && command.examples.length > 0) {
      console.log("EXAMPLES:");
      for (const example of command.examples) {
        console.log(`  ${example}`);
      }
      console.log();
    }
  }
  handleError(error) {
    if (error instanceof CLIError) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    } else if (error instanceof Error) {
      console.error(`Unexpected error: ${error.message}`);
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    } else {
      console.error("An unknown error occurred");
      process.exit(1);
    }
  }
};
var CLIBuilder = class {
  constructor(name, version) {
    this.config = { name, version, commands: [], globalOptions: [] };
  }
  description(desc) {
    this.config.description = desc;
    return this;
  }
  command(config) {
    if (!this.config.commands) this.config.commands = [];
    this.config.commands.push(config);
    return this;
  }
  globalOption(option) {
    if (!this.config.globalOptions) this.config.globalOptions = [];
    this.config.globalOptions.push(option);
    return this;
  }
  build() {
    return new CLI(this.config);
  }
};
function cli(name, version) {
  return new CLIBuilder(name, version);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CLI,
  CLIBuilder,
  CLIError,
  CommandNotFoundError,
  ValidationError,
  cli
});
//# sourceMappingURL=main.cjs.map