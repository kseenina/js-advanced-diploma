export default [
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                browser: 'off',
                es2022: 'off',
                node: 'off'
            }
        },
        rules: {

        }
    }
]