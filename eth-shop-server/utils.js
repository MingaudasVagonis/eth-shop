/**
* Async way of doing forEach on array.
*
* @param {array} 	array    Array.
* @param {function} callback Async function that takes the element of an array as a parameter.
*/
const asyncForEach = async (array, callback) => {
  	for (let index = 0; index < array.length; index++) 
  		await callback(array[index], index, array)
}

module.exports = {
	asyncForEach
}