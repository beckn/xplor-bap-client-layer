module.exports = {
  env: {
    node: true,
    mocha: true,
    browser: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    'node/no-unsupported-features/es-syntax': 'off',
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'error',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-extra-semi': 'off',
    'no-extra-semi': 'off',
    'no-console': 'warn',
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: 'class', next: '*' },
      { blankLine: 'always', prev: 'block-like', next: '*' },
      { blankLine: 'always', prev: 'function', next: '*' },
      {
        blankLine: 'any',
        prev: ['const', 'let', 'var'],
        next: ['const', 'let', 'var'],
      },
    ],
    'no-unused-vars':'off',
    'id-match': 0,

    // Turn on prettier rules
    'prettier/prettier': ['error', { singleQuote: true }],
    'comma-dangle': ['error', 'only-multiline'],
    'max-len': [
      2,
      {
        code: 120,
        tabWidth: 2,
        ignoreUrls: true,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
  },
}
