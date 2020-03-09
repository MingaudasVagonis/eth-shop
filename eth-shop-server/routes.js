const express = require('express') 
const products = require('./assets/products.json')
const contract = require('./assets/contract_interface.json')
const ContractHandler = require('./contract_handler.js')

/* Serves products to be displayed */
const serveProducts = (req, res) => {
	res.status(200).json(products)
}

/* Serves the contract interface */
const serveContract = (req, res) => {
	res.status(200).json(contract)
}

/**
* @see ./contract_handler.js createContract
*/
module.exports = (app) => {

	app.route('/contract'
		.post((req, res) => ContractHandler.getInstance().createContract(req, res))
		.get(serveContract)

	app.route('/products')
		.get(serveProducts)

}
