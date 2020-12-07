import React, { Component } from "react";
import "./App.css";
import { Box } from "jsxstyle";

class HistogramElement extends Component {
  constructor(props) {
    super(props);
    this.state = {
        dropdownOpen: false
    }
    this.name = this.props.name;
  }

  render() {
  return (
    <Box
        position="absolute"
        transform={"translate3d(" + (this.props.left - 5) + "px , 0px, 0px)"}
    >
        <Box 
            color="white" 
            fontSize="12px"
        >
        {this.name}
        </Box>
        {this.state.dropdownOpen ? (
        <Box
            position="absolute"
            top="0px"
            bottom="0px"
            width="100px"
            background="black"
        >
            Hide element
        </Box>) : ""
        }
    </Box>);
  }
}

export default HistogramElement;
