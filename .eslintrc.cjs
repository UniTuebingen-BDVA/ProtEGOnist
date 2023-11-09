/* eslint-env node */

module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:react-hooks/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: true,
        tsconfigRootDir: __dirname
    },
    plugins: ['react-refresh'],
    rules: {
        'react-refresh/only-export-components': [
            'warn',
            { allowConstantExport: true }
        ],
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unused-vars': [
            'warn',
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_'
            }
        ],
        // forbid usage of unused variables (marked with an _)
        '@typescript-eslint/naming-convention': [
            'error',
            {
                selector: ['parameter', 'variable'],
                leadingUnderscore: 'forbid',
                filter: {
                    // keep this one open for destructuring
                    regex: '_*',
                    match: false
                },
                format: null
            },
            {
                selector: 'parameter',
                leadingUnderscore: 'require',
                format: null,
                modifiers: ['unused']
            }
        ]
    }
};
