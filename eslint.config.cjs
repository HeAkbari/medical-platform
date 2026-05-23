const nx = require('@nx/eslint-plugin');
const nextCoreWebVitals = require('eslint-config-next/core-web-vitals');

module.exports = [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  {
    ignores: ['**/dist', '**/.next', '**/node_modules'],
  },
  ...nextCoreWebVitals.map((config) => ({
    ...config,
    files: ['apps/web/**/*.{js,jsx,ts,tsx}'],
  })),
];
