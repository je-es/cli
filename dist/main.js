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

// src/code/main.ts
var main_exports = {};
__export(main_exports, {
  cli: () => cli
});
module.exports = __toCommonJS(main_exports);

// src/code/mod/cli.ts
var cli = (options) => {
  const passedArgs = process.argv.slice(2);
  const parsedArgs = {};
  for (let i = 0; i < passedArgs.length; i++) {
    const arg = passedArgs[i];
    if (arg.startsWith("-")) {
      const actionName = Helpers.getAction(options.actions, arg);
      const action = options.actions[actionName];
      const actionArgs = {};
      if (action.args) {
        if (passedArgs.length - i - 1 < action.args.length) {
          throw new CLIError(`Missing argument for action '${arg}'.`);
        }
        for (let k = 0; k < action.args.length; k++) {
          const nextArg = passedArgs[k + i + 1];
          if (nextArg.startsWith("-")) {
            throw new CLIError(`Missing/Invalid argument for action '${arg}'.`);
          }
          actionArgs[action.args[k]] = nextArg;
        }
        i += action.args.length;
      }
      parsedArgs[actionName] = actionArgs;
    }
  }
  for (const key in parsedArgs) {
    const action = options.actions[key];
    if (action.requires) {
      action.requires.forEach((require2) => {
        if (!parsedArgs[require2]) {
          throw new CLIError(`Missing required argument for action '${key}'.`);
        }
        parsedArgs[key] = { ...parsedArgs[key], ...parsedArgs[require2] };
      });
    }
    if (action.options) {
      action.options.forEach((option) => {
        parsedArgs[key][option] = parsedArgs[option] ? true : false;
      });
    }
  }
  for (const key in parsedArgs) {
    const action = options.actions[key];
    if (action.callback) {
      action.callback(parsedArgs[key]);
    }
  }
};
var Helpers = {
  /**
   * A description of the entire function.
   *
   * @param   {t_actions} actions     - the actions object.
   * @param   {string}    arg         - the argument.
   * 
   * @throws  {CLIError}              - if the action not found.
   * 
   * @return  {string} the action name.
  */
  getAction: (actions, arg) => {
    for (const action in actions) {
      if (actions[action].flag === arg || actions[action].alias === arg) {
        return action;
      }
    }
    throw new CLIError(`Action '${arg}' not found.`);
  }
};
var CLIError = class extends Error {
  /**
   * Constructs a new CLIError instance.
   *
   * @param {string}  message     - The error message.
  */
  constructor(message) {
    super(message);
    this.name = "CLIError";
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  cli
});
//# sourceMappingURL=main.js.map