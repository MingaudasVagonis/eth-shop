const express = require('express')
const bodyParser = require('body-parser');
const routes = require('./routes.js')
const ContractHandler = require('./contract_handler.js')
const { ContractFactory, Wallet, providers, utils } = require('ethers')

const app = express()

/* Ether provider */
const provider = new providers.JsonRpcProvider('http://localhost:8545')

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.use(bodyParser.urlencoded({
  extended: true
}))

routes(app)

app.use(bodyParser.json())

app.listen(8080, mes => console.log(mes))
