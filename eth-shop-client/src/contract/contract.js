import { ContractFactory, Wallet, utils, ethers } from "ethers";
import axios from "axios";

const shipment_cost = 3;

const default_state = {
	expected_total: 0,
	received_total: [0, 0],
	status: "Awaiting confirmation",
	invoiceno: -1,
	orderno: -1,
	invoice: undefined
};

class Contract {
	_order_state = { ...default_state };

	/**
	* Constructor.
	*
	* @param {string} 			account 	  User's account address.
	* @param {string} 			private_key   User's private key used to sign.
	* @param {JsonRpcProvider}  provider 	  Ether's privider.
	* @param {function} 	    callback 	  Callback to update order's status.
	*/
	constructor(account, private_key, provider, callback) {
		this._account = account;

		this._wallet = new Wallet(private_key, provider);

		if (callback) {
			this._callback = callback;

			callback(this._order_state.status);
		}
	}

	/**
	* Executes a callback if theres one with an updated order status.
	*
	* @param {string} order_state New order state to be displayed.
	*/
	_changeOrderState(order_state) {
		this._order_state.status = order_state;

		if (this._callback) this._callback(order_state);
	}


	/** 
	* Initializes the contract.
	*
	* @param {JsonRpcProvider} provider Ether's provider.
	*/
	async init(provider) {
		try {

			/* Getting deployed contract's address */
			const response = await axios({
				url: "http://localhost:8080/contract",
				method: "post",
				responseType: "json",
				data: { address: this._account }
			});

			if (response.status === 200) {

				/* Creating contract instance */
				this._contract = new ethers.Contract(
					response.data.address,
					response.data.abi,
					provider
				);

				/* Connecting contract to the wallet */
				this._contract = await this._contract.connect(this._wallet);

				this._constructCallbacks();

				return true;
			} else return false;
		} catch (err) {
			console.log(err);
			return false;
		}
	}

	/**
	* Constructing event callbacks for the contract 
	*/	
	_constructCallbacks() {
		this._contract.on("PriceSent", this._receivePrice.bind(this));

		this._contract.on("InvoiceSent", this._receiveInvoice.bind(this));
	}

	/**
	* Handles receiving an invoice.
	*
	* @param {string} from      Server address.
	* @param {number} invoiceno Invoice's number.
	* @param {number} orderno   Order's number.
	* @param {date}   date 		Invoice's date.
	* @param {string} courier 	Courier's address.
	* @param {Event}  event 	Invoice event's data.
	*/
	_receiveInvoice(from, invoiceno, orderno, date, courier, event) {

		console.log(
			`Received invoice ${invoiceno} for order ${orderno} date:${date}`
		);

		this._changeOrderState("Waiting for delivery");

		this._order_state.invoiceno = invoiceno.toNumber();
		this._order_state.invoice = event;
	}

	/**
	* Handles delivery confirmation.
	*
	* @return {bool} Whether it was completed.
	*/
	async confirmDelivery() {
		if (!this._order_state.invoiceno) return;

		try {

			/* Invoking contract's delivery event */
			const tx = await this._contract.delivery(
				this._order_state.invoiceno,
				Date.now()
			);

			/* Waiting for it to complete */
			await tx.wait();

			this._order_state = { ...default_state };

			return true;
		} catch (err) {
			console.log(err);

			return false;
		}
	}

	/**
	* Invokes safepPay event and takes funds from owner's account 
	*/
	async sendSafePay() {
		try {

			const tx = await this._contract.sendSafepay(
				this._order_state.orderno,
				{
					value: this._order_state.expected_total
				}
			);

			await tx.wait();

			this._changeOrderState("Waiting for invoice");

		} catch (err) {
			console.log(err.message);
		}
	}

	/**
	* Handles receiving an invoice.
	*
	* @param {string} from    Server address.
	* @param {number} orderno Order's number.
	* @param {number} price   Price to pay.
	* @param {number} type 	  Price's type.
	*/
	_receivePrice(from, orderno, price, type) {

		console.log(
			`Price received from ${from} ${price} type: ${
				type === 1 ? "order" : "shipment"
			}`
		);

		this._order_state.received_total[type - 1] = parseInt(price);

		this._order_state.orderno = orderno.toNumber();

		/* Check whether the price received matches 
			the price that was expected */
		if (
			this._order_state.received_total[0] +
				this._order_state.received_total[1] ===
			this._order_state.expected_total
		) {
			this._changeOrderState("Confirmed");

			this.sendSafePay();
		}
	}

	/**
	* Sends order to the seller.
	* @param {object} order Order.
	* @param {number} total Expected order's total.
	*/
	async sendOrder(order, total) {

		this._order_state.expected_total += total + shipment_cost;

		try {
			const tx = await this._contract.sendOrder(JSON.stringify(order));

			await tx.wait();

		} catch (err) {
			console.log(err.message);
		}
	}
}

export default Contract;
