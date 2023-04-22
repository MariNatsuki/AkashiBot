module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module'
  },
  ignorePatterns: ['node_modules/**', '**/dist/**', 'ChatGPT/**'],
  extends: [
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  plugins: ['@typescript-eslint/eslint-plugin', 'prettier', 'simple-import-sort'],
  root: true,
  env: {
    node: true,
    jest: true
  },
  rules: {
    'prettier/prettier': 'error',
    'simple-import-sort/imports': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }
    ],
    'import/no-unresolved': 'off',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }]
  }
};
