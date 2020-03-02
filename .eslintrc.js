module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      legacyDecorators: true,
    },
  },
  globals: {
    globals: {
      ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: true,
      page: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: ['@typescript-eslint', 'jsx-a11y', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  rules: {
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/interface-name-prefix': [2, 'always'],
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/prefer-interface': 0,
    '@typescript-eslint/explicit-member-accessibility': [
      2,
      { accessibility: 'no-public', overrides: { properties: 'explicit' } },
    ],
    '@typescript-eslint/camelcase': [
      2,
      {
        properties: 'always',
        ignoreDestructuring: true,
      },
    ],
    'react/react-in-jsx-scope': 0,
    'react/display-name': 0,
    camelcase: 0,
    'no-constant-condition': 0,
    '@typescript-eslint/no-unused-vars': [
      2,
      {
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/member-ordering': [
      2,
      {
        default: 'never',
        classes: [
          'public-field',
          'protected-field',
          'private-field',
          'constructor',
          'public-method',
          'protected-method',
          'private-method',
        ],
      },
    ],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn', // <--- THIS IS THE NEW RULE
  },
};
