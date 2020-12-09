import React, { Component } from "react";
import { Box, Row, Col, Inline } from "jsxstyle";
import { UIColors } from "./colors";

class Toggle extends Component {

    render(){
        return (
            <Row alignItems="center">
                <Box fontSize="12px" marginRight="4px">Log scale</Box>
            <Box 
                backgroundColor={(this.props.toggle) ? "grey" : "black"} 
                width="50px" 
                padding="3px" 
                marginRight="8px" 
                borderRadius="16px"
                cursor="pointer"
                props={{onClick:()=>this.props.setToggle( !this.props.toggle )}}
            >
                <Box 
                    backgroundColor="white" 
                    height="20px" 
                    width="20px" 
                    borderRadius="10px"
                    transform={"translateX(" + ((this.props.toggle) ? 24 : 0) + "px)"}
                />
            </Box>
            </Row>
        )
    }
}

export default Toggle;