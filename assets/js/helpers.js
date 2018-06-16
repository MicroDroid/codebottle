import root from 'window-or-global';

let store;

export function extractError(error) {
	if (error.response)
		if (!error.response.data || !error.response.data.error)
			return 'Internal error!';
		else {
			if (error.response.status == 429 && error.response.headers['retry-after'])
				return 'Try again ' + moment().add(error.response.headers['retry-after'] * 1000).fromNow();
			else return error.response.data.error;
		}
	else
		return 'Network error!';
}

export function shorten(str, len, ellipsis = '…') {
	if (str.length <= len)
		return str;

	var result = str.substr(0, len - 1);
	result = result.substr(0, Math.min(result.length, result.lastIndexOf(' ')));

	return result + ellipsis;
}

export function findGetParameter(parameterName) {
	var result = null,
		tmp = [];
	location.search
		.substr(1)
		.split('&')
		.forEach(function (item) {
			tmp = item.split('=');
			if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
		});
	return result;
}

export function cookGetParameters(obj) {
	var str = '';
	Object.keys(obj).map((key) => str += `&${key}=${encodeURIComponent(obj[key])}`);
	return str.substr(1);
}

export function updateUrlParameter(param, value) {
	const regExp = new RegExp(param + '(.+?)(&|$)', 'g');
	const newUrl = root.location.href.replace(regExp, param + '=' + value + '$2');
	root.history.pushState('', '', newUrl);
}

export function apiUrl(url) {
	return root.location.protocol
		+ '//'
		+ (root.serverRendering ? root.apiHost : ('api.' + root.location.hostname))
		+ '/'
		+ (url.indexOf('/') === 0 ? url.substr(1) : url);
}

export function staticUrl(url) {
	return root.location.protocol
		+ '//static.'
		+ root.location.hostname
		+ '/'
		+ (url.indexOf('/') === 0 ? url.substr(1) : url);
}

export function getAbsoluteUrl(url) {
	return root.location.protocol
		+ '//'
		+ root.location.hostname
		+ '/'
		+ (url.indexOf('/') === 0 ? url.substr(1) : url);
}

export function setStore(theStoreToBeSet) {
	store = theStoreToBeSet;
}

export function cookToast(content, duration) {
	store.dispatch('cookToast', {content, duration});
}

// No, I don't use this to FREEZE THE ENTIRE COMPUTER!
export function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function hljsLanguageById(id) {
	switch (id) {
	case 1:
		return 'java';
	case 2:
		return 'cpp';
	case 3:
		return 'cs';
	case 4:
		return 'python';
	case 5:
		return 'php';
	case 6:
		return 'javascript';
	case 7:
		return 'perl';
	case 8:
		return 'ruby';
	case 9:
		return 'powershell';
	case 10:
		return 'lua';
	default:
		return '';
	}
}

export function genRandomString(length) {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for(var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
