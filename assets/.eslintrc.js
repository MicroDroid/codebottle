module.exports = {
    "env": {
        "browser": true,
        "node": false,
        "commonjs": true,
        "es6": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:vue/recommended"
    ],
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
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
    },
    "globals": {
        "axios": false,
        "marked": false,
        "moment": false,
        "$": false,
        "hljs": false,
        "process": false,
        "_": false,
    }
};

