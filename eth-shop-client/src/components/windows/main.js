import React from "react";
import LandingWindow from "./landing_win";
import ShopWindow from "./shop_win";
import { Switch, Route } from "react-router-dom";

const Main = _ => (
	<Switch>
		<Route exact path="/" component={LandingWindow} />
		<Route path="/main" component={ShopWindow} />
	</Switch>
);

export default Main;
