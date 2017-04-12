module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'plugin:ember-suave/recommended'
  ],
  env: {
    browser: true
  },
  rules: {
    'array-bracket-spacing': 'off',
    'one-var': 'off',
    'object-shorthand': 'off',
    'operator-linebreak': 'off',
    'ember-suave/no-const-outside-module-scope': 'off',
    'ember-suave/no-direct-property-access': 'off'
  },
  globals: {
    'google': true
  }
};
