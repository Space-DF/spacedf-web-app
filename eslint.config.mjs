import { FlatCompat } from '@eslint/eslintrc'
const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
})
const eslintConfig = [
  ...compat.config({
    extends: ['next', 'next/core-web-vitals', 'next/typescript'],
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-page-custom-font': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'react-hooks/exhaustive-deps': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_', // Ignore arguments starting with "_"
          varsIgnorePattern: '^_', // Ignore variables starting with "_"
          ignoreRestSiblings: true, // Ignore destructured siblings
        },
      ],
    },
    ignorePatterns: [
      'node_modules/',
      '**/*.test.ts',
      '**/*.test.tsx',
      'dist/',
      'build/',
    ],
  }),
]
export default eslintConfig
