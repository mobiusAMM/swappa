"use strict";

module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  ignorePatterns: ["*.js", "src/generated/*"],
  extends: ["@saberhq/eslint-config"],
  parserOptions: {
    project: "tsconfig.json",
  },
};
