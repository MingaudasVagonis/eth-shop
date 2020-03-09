import React from 'react'
import { Image, Box, Text, Paragraph} from 'grommet'
import {Cart} from 'grommet-icons'

export default class Product extends React.Component {

	state = {
		_classHero: "product-photo"
	}

	addToCart(){
		
		this.setState({_classHero: "product-hero"})

		this.props.callback(this.props.model)
	}

	render(){
		return (
			<Box animation={{type:"fadeIn", delay: this.props.order * 300, duration: 800}} className="product" margin= {{left: "130px", right: "20px", vertical: "20px"}} round = "45px">
				<Box width="200px" height="200px" round="40px" overflow="hidden" className="product-photo">
					<Image src={this.props.model.image} fit="cover"/>
				</Box>
				<Box width="200px" height="200px" round="40px" overflow="hidden" className={this.state._classHero} onTransitionEnd={_ => this.setState({_classHero: "product-photo"})}>
					<Image src={this.props.model.image} fit="cover"/>
				</Box>
				<Box margin={{left: "130px", top: "30px"}}>
					<Box direction="row" justify="between" align="center">
						<Text className="heavy" size="xxlarge" >{this.props.model.name}</Text>
						<Box onClick={this.addToCart.bind(this)} margin={{right: "15px"}} pad={{vertical: "small", horizontal:"medium"}} round style={{background: 'linear-gradient(to right, #e33e2c , #9e1744)'}}>
							<Cart size="30px"/>
						</Box>
					</Box>
					<Box background="#a41a42" height="3px" width="75%" margin={{top: "10px"}}/>
					<Paragraph size="large" margin={{top:"20px"}}>
						<span style={{color:"white"}}>
							{this.props.model.price}
						</span>
						<span style={{color: "#a41a42", marginLeft: "5px"}}>
						 €
						</span>
					</Paragraph>
					<Paragraph color="#9aa2b1" margin={{top:"10px"}}>
						{this.props.model.description}
					</Paragraph>
				</Box>
			</Box>
		)
	}

}