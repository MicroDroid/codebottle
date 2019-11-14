module.exports = {
    "env": {
        "browser": false,
        "node": true,
        "commonjs": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        // Turn it off because is breaks with Koa' ctx.body = ... thing
        // I'll override-remove this in other .eslintrc's so be sure to
        // Remove the override from there when bug is fixed.
        "require-atomic-updates": "off",

        "no-unused-vars": ["error", { "args": "none", "ignoreRestSiblings": true }],

        "comma-dangle": ["error", "always-multiline"],
        "arrow-parens": ["error", "as-needed"],

        "indent": ["error", "tab", { SwitchCase: 1 }],
        "object-curly-spacing": ["error", "always"],
        "space-infix-ops": ["error"],

        "max-len": ["error", {
            code: 120,
            ignoreUrls: true,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
            ignoreRegExpLiterals: true
        }],

        "eqeqeq": ["error", "always"],

        "indent": [
            "error",
            "tab"
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};