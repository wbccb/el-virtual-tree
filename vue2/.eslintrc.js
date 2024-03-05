module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ["plugin:vue/essential", "eslint:recommended"],
  parserOptions: {
    parser: "@babel/eslint-parser",
  },
  rules: {
    "max-len": [
      "error",
      {
        code: 150,
        ignoreComments: true,
        ignoreUrls: true,
      },
    ],
    "no-debugger": "off",
    "no-unused-vars": "off",
  },
  ignorePatterns: ["**/src/mock/*.js"],
};
