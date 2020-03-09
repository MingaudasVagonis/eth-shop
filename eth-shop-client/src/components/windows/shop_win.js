import React from "react";
import { Grommet, Box, Image, Stack, Text, DropButton } from "grommet";
import { Cart } from "grommet-icons";
import Logo from "../logo";
import Product from "../product";
import axios from "axios";
import Popup from "reactjs-popup";
import { Helmet } from "react-helmet";
import Contract from "../../contract/contract.js";
import { providers } from "ethers";

export default class ShopWindow extends React.Component {
	state = {
		_products: [],
		_cart: [],
		_render_cart: false,
		_render_orders: false,
		_lockPopup: false
	};

	constructor(props) {
		super(props);

		this._user = props.location.state.user;

		this._provider = new providers.JsonRpcProvider("http://localhost:8545");
	}

	componentDidMount() {
		this.setUpShop();
	}

	/**
	* Created a contract for the user
	*/
	async setUpShop() {

		this._contract = new Contract(
			this._user.account,
			this._user.key,
			this._provider,
			_order_state => this.setState({ _order_state })
		);

		const contract_init = await this._contract.init(this._provider);

		/* If contract exists continue setting up the shop, 
			prob should be better to do those things in parallel tbh */
		if (contract_init) 
			await this.fetchProducts();
	}

	/**
	* Calculates the total for the orde.
	*
	* @return {number} Order's total.
	*/
	total() {
		if (this.state._cart.length === 0) 
			return 0;
		return this.state._cart.reduce(
			(total, value) => (total += value.price),
			0
		);
	}

	/** 
	* Adds a product to the cart.
	*
	* @param {object} model Product's model.
	*/
	addToCart(model) {
		this.setState(prevState => ({
			_cart: [...prevState._cart, model]
		}));
	}

	/**
	* Sends the order to the seller.
	*/
	async commitOrder() {

		/* Locking popup */
		this.setState({ _lockPopup: true });

		/* Calculating how much each product cost 
			by adding up all of it's instances */

		const reduced = this.state._cart.reduce((total, value) => {
			total[value.name] = {
				q: (total[value.name] || { q: 0 }).q + 1,
				p: value.price
			};
			return total;
		}, {});

		/* Sending order to the seller */
		await this._contract.sendOrder(reduced, this.total());

		/* Releasing popup */
		this.setState({ _lockPopup: false, _render_cart: false });
	}

	/**
	* Fetches products from the server.
	*/
	async fetchProducts() {
		try {
			const response = await fetch("http://localhost:8080/products", {
				mode: "cors"
			});

			if (response.status === 200) {
				const json_response = await response.json();

				this.setState({ _products: json_response });
			}
		} catch (err) {
			console.log(err.message);
		}
	}

	/**
	* Conditional items render.
	*/
	renderItems() {
		if (this.state._products.length === 0) return;

		return (
			<Box
				direction="row"
				wrap={true}
				alignContent="start"
				justify="center"
				margin={{ top: "20px" }}
			>
				{this.state._products.map((product, key) => (
					<Product
						model={product}
						key={key}
						order={key}
						callback={this.addToCart.bind(this)}
					/>
				))}
			</Box>
		);
	}

	/**
	* Conditional cart render.
	*/
	renderCart() {
		if (!this.state._render_cart) return;

		/* Reducing individual product's instances to one each */
		const reduced = this.state._cart.reduce((total, value) => {
			total[value.name] = (total[value.name] || 0) + 1;
			return total;
		}, {});

		return (
			<Popup
				open={this.state._render_cart}
				onClose={_ => this.setState({ _render_cart: false })}
				closeOnDocumentClick={!this.state._lockPopup}
				contentStyle={{
					padding: "0px",
					borderWidth: "0px",
					width: "auto",
					backgroundColor: "#1c1d22",
					borderRadius: "30px"
				}}
			>
				<Box gap="small" width="500px" margin="15px">
					<Box
						direction="row"
						pad={{ horizontal: "10px" }}
						justify="between"
					>
						<Text color="white" size="medium" gap="small">
							SHOPPING CART
						</Text>
						<Text
							color="white"
							size="medium"
							gap="small"
						>{`TOTAL:  ${this.total()}€`}</Text>
					</Box>
					{[...new Set(this.state._cart)].map((item, ind) => (
						<Box
							key={ind}
							direction="row"
							style={{ borderRadius: "18px" }}
							background="#0d0e10"
							width="95%"
							margin={{ vertical: "small" }}
							alignSelf="center"
							justify="between"
							responsive={false}
							pad={{ right: "small" }}
							align="center"
						>
							<Box direction="row" align="center">
								<Box
									height="50px"
									width="50px"
									style={{ borderRadius: "18px" }}
									overflow="hidden"
									margin={{ right: "medium" }}
								>
									<Image src={item.image} fit="cover" />
								</Box>
								<Text size="large">{item.name}</Text>
							</Box>
							<Text>{`${reduced[item.name]} x ${
								item.price
							}€`}</Text>
						</Box>
					))}
					<Box
						onClick={this.commitOrder.bind(this)}
						responsive={false}
						pad={{ vertical: "small", horizontal: "large" }}
						width="95%"
						round
						style={{
							background:
								"linear-gradient(to right, #e33e2c , #9e1744)"
						}}
						alignSelf="center"
						responsive={false}
					>
						<Text color="white" size="large" textAlign="center">
							ORDER
						</Text>
					</Box>
				</Box>
			</Popup>
		);
	}

	/**
	* Handles delivery confimation.
	*/
	async _confirmDelivery() {

		/* Can confirm only when order is sent out, not the best way 
			to do this cause it can be change by client */

		if (this.state._order_state === "Waiting for delivery") {
			
			this.setState({ _lockPopup: true });

			await this._contract.confirmDelivery();

			this.setState({ _lockPopup: false, renderOrders: false });
		}
	}

	/**
	* Conditional orders render.
	*/
	renderOrders() {
		if (!this.state._renderOrders) return;

		console.log(this.state);

		const button_background =
			this.state._order_state === "Waiting for delivery"
				? "linear-gradient(to right, #e33e2c , #9e1744)"
				: "linear-gradient(to right, #9aa2b1 , #69797f)";

		return (
			<Popup
				open={this.state._renderOrders}
				onClose={_ => this.setState({ _render_orders: false })}
				overlayStyle={{ zIndex: 800 }}
				closeOnDocumentClick={!this.state._lockPopup}
				contentStyle={{
					padding: "0px",
					borderWidth: "0px",
					width: "auto",
					backgroundColor: "#1c1d22",
					borderRadius: "30px",
					zIndex: 800
				}}
			>
				<Box gap="small" width="700px" margin="15px">
					<Text color="white" size="medium" gap="small">
						MY ORDER
					</Text>
					<Box
						onClick={this._confirmDelivery.bind(this)}
						style={{ flexDirection: "row" }}
						justify="between"
						pad="medium"
					>
						<Text>{`Status: ${this.state._order_state}`}</Text>
						<Box
							style={{
								borderRadius: "25px",
								background: button_background
							}}
							pad={{ horizontal: "large", vertical: "medium" }}
						>
							<Text size="large">Confirm Delivered</Text>
						</Box>
					</Box>
				</Box>
			</Popup>
		);
	}

	render() {
		return (
			<Grommet full={true} theme={theme}>
				<Helmet>
					<title>ETH SHOP</title>
					<link
						rel="icon"
						href={require("../../assets/images/logo_small.png")}
					/>
				</Helmet>
				<Box background="#1c1d22" responsive={false}>
					<Box height="100vh">
						<Image
							fit="cover"
							src={require("../../assets/images/mountains3.jpg")}
						/>
					</Box>
					<Box className="overlaySet" responsive={false}>
						<Logo ref={ref => (this._logo = ref)} transitioned />
						<Box
							width="100vw"
							height="100px"
							background="#0d0e10"
							responsive={false}
							direction="row"
							justify="between"
							pad={{ horizontal: "medium" }}
						>
							<Box
								onClick={_ =>
									this.setState({ _renderOrders: true })
								}
								alignSelf="center"
							>
								<Text size="large" className="heavy">
									MY ORDER
								</Text>
							</Box>
							<Box direction="row" align="center">
								<Text
									size="xlarge"
									alignSelf="center"
									className="heavy"
									color="#a41a42"
									margin={{ horizontal: "medium" }}
								>{`${this.total()} €`}</Text>
								<Box
									width="45px"
									alignSelf="center"
									onClick={_ =>
										this.setState({ _render_cart: true })
									}
								>
									<Stack anchor="top-right">
										<Cart size="30px" />
										<Box
											background="#a41a42"
											pad={{ horizontal: "xsmall" }}
											round
										>
											<Text size="xsmall">
												{this.state._cart.length}
											</Text>
										</Box>
									</Stack>
								</Box>
							</Box>
						</Box>
						{this.renderItems()}
					</Box>
					{this.renderCart()}
					{this.renderOrders()}
				</Box>
			</Grommet>
		);
	}
}

const theme = {
	global: {
		focus: {
			border: {
				color: "#00000000"
			}
		},
		colors: {
			control: "#00000000"
		}
	}
};
