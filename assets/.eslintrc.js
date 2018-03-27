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
        ],
        "indent": "off",
        "vue/script-indent": [
            "error",
            "tab",
            {"baseIndent": 1}
        ],
        "vue/html-indent": [
            "error",
            "tab",
        ],
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

