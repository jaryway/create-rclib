module.exports = {
  extends: ['react-app', 'react-app/jest', 'plugin:compat/recommended'],
  settings: {
    react: {
      version: 'detect',
    },
    polyfills: ['fetch', 'Promise', 'FileReader', 'Array', 'Object', 'object-values'],
  },
  rules: {
    'no-empty-pattern': 1,
    'jsx-a11y/anchor-is-valid': 0,
    '@typescript-eslint/no-unused-expressions': 1,
    'import/no-anonymous-default-export': 0,
    'no-script-url': 'off',
    'react-hooks/rules-of-hooks': 0,
    'react-hooks/exhaustive-deps': 1,
    '@typescript-eslint/no-unused-vars': [
      1,
      {
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
      },
    ],
  },
};
