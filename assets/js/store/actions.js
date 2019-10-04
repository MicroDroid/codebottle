import * as types from './mutation-types';
import {apiUrl} from '../helpers';

export default {
	fetchLanguages: ({commit}) => {
		return axios.get(apiUrl('/languages'))
			.then(response => {
				commit(types.STORE_LANGUAGES, response.data);
			}).catch(error => {
				console.log('Failed to fetch languages!');
		});
	},

	fetchCategories: ({commit}) => {
		return axios.get(apiUrl('/categories'))
			.then(response => {
				commit(types.STORE_CATEGORIES, response.data);
			}).catch(error => {
				console.log('Failed to fetch categories!');
		});
	}
};
