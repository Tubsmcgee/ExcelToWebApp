module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'prettier',
    'plugin:import/errors',
    'plugin:import/warnings'
  ],
  plugins: ['react', 'prettier'],
  rules: {
    'prefer-const': 'warn',
    'prefer-arrow-callback': 'warn',
    'no-var': 'error',
    'no-bitwise': 'error',
    'jsx-quotes': ['warn', 'prefer-double'],
    'func-style': 'warn',
    'no-octal-escape': 'error',
    'no-implicit-globals': 'error',
    'no-fallthrough': 'off',
    'no-extend-native': 'error',
    'no-empty-function': 'warn',
    'no-caller': 'error',
    'no-alert': 'warn',
    'no-use-before-define': [
      'warn',
      {
        functions: true,
        classes: true
      }
    ],
    eqeqeq: 'warn',
    'block-scoped-var': 'error',
    'react/display-name': 'off',
    'react/prop-types': 'off',
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'require-yield': 'off',
    'no-duplicate-imports': 'error',
    'dot-notation': 'warn',
    'quote-props': ['warn', 'as-needed'],
    'arrow-body-style': ['warn', 'as-needed'],
    'object-shorthand': 'warn',
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true,
        bracketSpacing: false
      }
    ]
  }
};
