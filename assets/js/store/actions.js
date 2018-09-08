import * as types from './mutation-types';
import {apiUrl} from '../helpers';

let toastEater = null;

module.exports = {
	fetchLanguages: ({commit}) => {
		axios.get(apiUrl('/languages'))
			.then(response => {
				commit(types.STORE_LANGUAGES, response.data);
			}).catch(error => {
				console.log('Failed to fetch languages!');
		});
	},

	fetchCategories: ({commit}) => {
		axios.get(apiUrl('/categories'))
			.then(response => {
				commit(types.STORE_CATEGORIES, response.data);
			}).catch(error => {
				console.log('Failed to fetch categories!');
		});
	},

	cookToast: ({commit}, data) => {
		if (toastEater)
			clearTimeout(toastEater);
		commit(types.COOK_TOAST, data);
		toastEater = setTimeout(() => {
			commit(types.EAT_TOAST);
		}, data.duration);
	},
};
