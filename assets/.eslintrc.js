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
		"ecmaVersion": 2018,
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
		"vue/max-attributes-per-line": [2, {
			"singleline": 4,
			"multiline": {
				"max": 4,
				"allowFirstLine": true,
			}
		}]
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

