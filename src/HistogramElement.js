import React, { Component } from "react";
import "./App.css";
import { Box } from "jsxstyle";
import { UIColors } from "./colors";

class HistogramElement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: false,
    };
    this.name = this.props.name;
  }

  render() {
    return (
      <Box
        position="absolute"
        top="12px"
        left="0px"
        userSelect="none"
        transform={"translate3d(" + (this.props.left - 5) + "px , 0px, 0px)"}
        props={{
          onMouseEnter: () => this.setState({ dropdownOpen: true }),
          onMouseLeave: () => this.setState({ dropdownOpen: false }),
        }}
      >
        <Box color="white" fontSize="12px">
          {this.name}
        </Box>
        {this.state.dropdownOpen ? (
          <Box
            position="absolute"
            bottom="calc(-100% - 12px)"
            left="0px"
            width="60px"
            background={UIColors.header}
            props={{ onClick: this.props.hideKey }}
            hoverCursor="pointer"
            padding="4px"
            border="1px solid white"
            borderRadius="4px"
          >
            Hide
          </Box>
        ) : (
          ""
        )}
      </Box>
    );
  }
}

export default HistogramElement;
