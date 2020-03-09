import React, { Component } from "react";
import { Grommet, Box, Image, TextInput, Text } from "grommet";
import { withRouter } from "react-router-dom";
import Logo from "../logo";
import axios from "axios";
import { Helmet } from "react-helmet";

// account : "0x954C8E10ED7eab4E467085F876B9D4534A488737"
// private_key: "0xbfe038810d51b8a788e5f63d2a0822d1f8ef712a7acbbf9877013efb3c5f5514"

class LandingWindow extends Component {

	state = {
		_classFields: "",
		_classMountains: "detailMountains"
	};

	constructor(props) {
		super(props);

		this._logo = React.createRef();

		this._fields = ["", ""];
	}

	signUp() {
		this.setState({
			_classFields: "fadeOut",
			_classMountains: "moveMountains"
		});
		this._logo.transition();
	}

	/**
	 * No real register here, just checking if fields are not empty.
	 */
	registerAndSwitch() {

		if (!this._fields[0] || this._fields[0].length < 1) 
			return;
		if (!this._fields[1] || this._fields[1].length < 1) 
			return;

		this.switchToShop();
	}

	/**
	 * Switches to shop window and passes credentials to it.
	 */
	switchToShop() {

		this.props.history.push({
			pathname: "/main",
			state: { user: { account: this._fields[0], key: this._fields[1] } }
		});
		
	}

	render() {
		return (
			<Grommet theme={theme}>
				<Helmet>
					<title>ETH SHOP</title>
					<link
						rel="icon"
						href={require("../../assets/images/logo_small.png")}
					/>
				</Helmet>
				<Box style={{ overflow: "hidden", height: "100vh" }}>
					<Box height="100vh">
						<Image
							fit="cover"
							src={require("../../assets/images/mountains3.jpg")}
						/>
					</Box>
					<Box
						onAnimationEnd={() => this.setState({ header: true })}
						className="overlay"
						width="100vw"
						background="#1c1d22"
						style={{ opacity: 0.4 }}
					/>
					<Box
						className="overlay"
						width="100vw"
						background="#1c1d22"
						style={{
							WebkitAnimationDelay: "0.5s",
							animationDelay: "0.75s",
							zIndex: "2"
						}}
					>
						<Logo ref={ref => (this._logo = ref)} />
						<Box
							alignSelf="center"
							width="large"
							className={this.state._classFields}
							onAnimationEnd={this.switchToShop.bind(this)}
							style={{ zIndex: 2 }}
						>
							<Box
								margin={{ bottom: "medium", top: "20vh" }}
								gap="small"
							>
								<TextInput
									plain
									focusIndicator
									placeholder="Account"
									onChange={e =>
										(this._fields[0] = e.target.value)
									}
									style={{
										color: "white",
										border: "3px solid #a41a42",
										borderRadius: "25px"
									}}
								/>
								<TextInput
									plain
									focusIndicator
									placeholder="Private Key"
									onChange={e =>
										(this._fields[1] = e.target.value)
									}
									style={{
										color: "white",
										border: "3px solid #a41a42",
										borderRadius: "25px"
									}}
								/>
							</Box>
							<Box
								onClick={this.registerAndSwitch.bind(this)}
								pad={{ vertical: "small", horizontal: "large" }}
								round="25px"
								responsive={false}
								background="#a41a42"
								margin={{ vertical: "small" }}
							>
								<Text
									color="white"
									size="large"
									textAlign="center"
								>
									JOIN NOW
								</Text>
							</Box>
							<Box
								onClick={this.signUp.bind(this)}
								pad={{ vertical: "small", horizontal: "large" }}
								responsive={false}
								margin={{ vertical: "small" }}
							>
								<Text
									color="white"
									size="large"
									textAlign="center"
								>
									SIGN IN
								</Text>
							</Box>
						</Box>
						<Box className={this.state._classMountains}>
							<Image
								src={require("../../assets/images/detail_mountains.png")}
								fit="cover"
							/>
						</Box>
					</Box>
				</Box>
			</Grommet>
		);
	}
}

export default withRouter(LandingWindow);

const theme = {
	text: {
		large: {
			size: "22px",
			height: "22px",
			maxWidth: "528px"
		}
	},
	global: {
		font: {
			family: "litfont",
			plain: true
		},
		focus: {
			border: {
				color: "transparent"
			}
		},
		colors: {
			placeholder: "#0d0e10"
		}
	}
};
