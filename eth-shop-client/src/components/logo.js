import React from 'react'
import {Box, Image} from 'grommet'

const dimension = "150px"

export default class Logo extends React.Component {

	constructor(props) {
	  super(props)

	  this.state = {
		_classColored: this.props.transitioned? "logoTransitioned": "",
		_classBox: this.props.transitioned? "logoBoxTransitioned": "logoBoxInitial",
		}
	
	}

	transition(){
		this.setState({_classColored: "fadeOut", _classBox: "logoBox"})
	}

	render(){
		return(
			<Box width={dimension} height={dimension} alignSelf="center" className={this.state._classBox} >
            	<Box width={dimension} height={dimension} style={{position: 'absolute'}}>
                	<Image src={require('../assets/images/logo_white.png')} fit ="contain"/>
            	</Box>
            	<Box width={dimension} height={dimension} style={{position: 'absolute'}} className={this.state._classColored}>
                	<Image src={require('../assets/images/logo.png')} fit ="contain"/>
            	</Box>
            </Box>
		)
	}
}