import root from 'window-or-global';
import hljs from 'highlight.js/lib/highlight';
import marked from 'marked';
import moment from 'moment-mini';
import axios from 'axios';

// Will be replaced by server entry later, just to prevent undef errors
if (typeof (window) === 'undefined')
	root.location = {
		protocol: 'https:',
		hostname: 'codebottle.io'
	};

root.hljs = hljs;

const hljsLanguages = ['java', 'cpp', 'cs', 'css', 'python', 'php', 'javascript',
	'perl', 'ruby', 'powershell', 'lua', 'json', 'bash', 'less', 'markdown', 'scss',
	'sql', 'xml', 'yaml', 'crystal', 'dart', 'swift',
];

hljsLanguages.forEach(langName => {
	const langModule = require(`highlight.js/lib/languages/${langName}`);
	root.hljs.registerLanguage(langName, langModule);
});

root.marked = marked;

root.moment = moment;

root.axios = axios;
root.axios.defaults.headers.common = {
	'Accept': 'application/vnd.codebottle.v1+json',
};