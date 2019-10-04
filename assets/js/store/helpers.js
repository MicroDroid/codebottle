export function unionState(oldArray, newArray, oldField = 'id', newField = 'id') {
	const newIds = newArray.map(newItem => newItem[newField]);

	return [
		...oldArray.filter(oldItem => newIds.indexOf(oldItem[oldField]) === -1),
		...newArray,
	];
}