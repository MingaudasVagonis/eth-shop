const { ContractFactory, Wallet, providers, BigNumber } = require("ethers");
const server_credentials = require("./assets/server_credentials.json");
const contract_interface = require("./assets/contract_interface.json");

/**
 * @class ContractHandler Handles users' contracts
 */
class ContractHandler {
	static instance = null;

	constructor() {
		this._contracts = [];

		this._provider = new providers.JsonRpcProvider("http://localhost:8545");

		this._wallet = new Wallet(
			server_credentials.private_key,
			this._provider
		);
	}

	static getInstance() {
		if (this.instance == null) this.instance = new ContractHandler();

		return this.instance;
	}

	/**
	 * Checks for an existing contract or creates a new one.
	 *
	 * @param {object} req Request containing user's address in the body.
	 * @param {object} res Response object.
	 */
	async createContract(req, res) {
		const buyer_address = req.body.address;

		/* Check wether the user already has a contract */
		const check_contract = this._contractExists(buyer_address);

		if (check_contract)
			res.status(200).json({
				address: check_contract._token.address,
				abi: contract_interface.abi
			});

		try {
			/* Creating, building and deploying a contract */
			let contract = new Contract(buyer_address, this._provider);

			await contract.build(this._wallet);

			this._constructCallbacks(contract);

			/* Pushing the contract into server's stack */
			this._contracts.push(contract);

			res.status(200).json({
				address: contract._token.address,
				abi: contract_interface.abi
			});
			
		} catch (err) {
			console.log(err);
			return res.status(500).json({ message: err.message });
		}
	}

	/**
	 * Constructs callbacks for contract's events for a given contract.
	 *
	 * @param {Contract} contract Contract.
	 */
	_constructCallbacks(contract) {
		contract._token.on("OrderSent", (cto, goods, orderno, event) =>
			contract.sendPrice(cto, goods, event)
		);

		contract._token.on("SafepaySent", (cto, value, orderno, now) =>
			contract.sendInvoice(cto, value, orderno, now)
		);
	}

	/**
	 * Check wether a contract already exists in the server stack and returns it is it does.
	 *
	 * @param {string} buyer_address Owners address.
	 */
	_contractExists(buyer_address) {
		const contracts = this._contracts;

		for (let i = 0; i < contracts.length; i++)
			if (contracts[i].matchAddress(buyer_address)) return contracts[i];

		return undefined;
	}
}

/**
 * @class Contract
 */
class Contract {
	/**
	 * Constructor.
	 *
	 * @param {string}			buyer_address Contract owener's address.
	 * @param {JsonRpcProvider}  provider 	  Ether provider.
	 */
	constructor(buyer_address, provider) {
		this._buyer_address = buyer_address;
		this._provider = provider;
	}

	/**
	 * Builds and deploys the contract.
	 *
	 * @param {Wallet} wallet Owner's wallet instance.
	 */
	async build(wallet) {
		try {
			this._token = new ContractFactory(
				contract_interface.abi /* Contract's binary interface */,
				contract_interface.bytecode /* Contract's bytecode */,
				wallet
			);

			/* Deploying the contract with servers address */
			this._token = await this._token.deploy(server_credentials.account);

			/* Waiting for it to deploy */
			this._token = await this._token.deployed();
		} catch (er) {
			console.log(er);
		}
	}

	/**
	 * Send invoicee to the contract's owner.
	 *
	 * @param {string} cto 	  Owner's address.
	 * @param {number} value   Invoice's value.
	 * @param {number} orderno Order's number.
	 * @param {number} now 	  Timestamp.
	 */
	async sendInvoice(cto, value, orderno, now) {
		console.log(`Sending invoice to ${cto}`);

		try {
			/* Sending the invoice to the owner with the courier's address */
			const tx = await this._token.sendInvoice(
				orderno,
				Date.now(),
				server_credentials.courier_account
			);

			/* Wating for it to complete */
			await tx.wait();
		} catch (err) {
			console.log(err);
		}
	}

	/**
	 * To notify when the order is sent to the courier
	 * @param {number} orderno Order's number.
	 */
	async sendOrder(orderno) {
		console.log(`Sending order ${ordernow} to courier`);
	}

	/**
	 * Calculating and the price and notifying the buyer.
	 *
	 * @param  {string} from  Owner's address.
	 * @params {string} goods Stringified json with the order.
	 * @param  {Event}  event Contract's order event.
	 */
	async sendPrice(from, goods, event) {
		console.log(`Sending price to ${from}`);

		const items = Object.values(JSON.parse(goods));

		/* Total price for the order */
		const price = items.reduce(
			(total, item) => (total += item.q * item.p),
			0
		);

		try {
			const tx_order_price = await this._token.sendPrice(
				event.args.orderno.toNumber(),
				price,
				1 /* Indicating that the price sent is for the order */
			);

			/* Waiting for it to complete */
			await tx_order_price.wait();

			const tx_shipment_price = await this._token.sendPrice(
				event.args.orderno.toNumber(),
				3 /* Couriers fee */,
				2 /* Indicating that the price sent is for the shipment */
			);

			/* Waiting for it to complete */
			await tx_shipment_price.wait();
		} catch (err) {
			console.log(err.message);
		}
	}

	/**
	 * If the address provided matches contract owner's address.
	 *
	 * @param  {string} buyer_address Address to check.
	 * @return {bool}				 Wether they match.
	 */
	matchAddress = buyer_address => buyer_address === this._buyer_address;
}

module.exports = ContractHandler;
