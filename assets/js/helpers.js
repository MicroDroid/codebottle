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
	const newUrl = window.location.href.replace(regExp, param + '=' + value + '$2');
	window.history.pushState('', '', newUrl);
}

export function apiUrl(url) {
	return window.location.protocol
		+ '//api.'
		+ window.location.hostname
		+ '/'
		+ (url.indexOf('/') === 0 ? url.substr(1) : url);
}

export function staticUrl(url) {
	return window.location.protocol
		+ '//static.'
		+ window.location.hostname
		+ '/'
		+ (url.indexOf('/') === 0 ? url.substr(1) : url);
}

export const getAbsoluteUrl = (function() {
	var a;

	return function(url) {
		if(!a) a = document.createElement('a');
		a.href = url;

		return a.href;
	};
})();

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

export function genRandomString(length) {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for(var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
