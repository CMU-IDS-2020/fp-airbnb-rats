import React, { Component } from "react";
import "./App.css";
import { Box } from "jsxstyle";
import { UIColors } from "./colors";

class HiddenElementDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: false,
    };
  }

  render() {
    return (
      <Box
        zIndex="10"
        position="absolute"
        top="0px"
        left="0px"
        userSelect="none"
        props={{
          onMouseEnter: () => this.setState({ dropdownOpen: true }),
          onMouseLeave: () => this.setState({ dropdownOpen: false }),
        }}
      >
        <Box color="white" fontSize="12px">
          {this.props.listItems.length + " element hidden"}
        </Box>
        {this.state.dropdownOpen && this.props.listItems.length > 0 ? (
          <Box
            position="absolute"
            top="100%"
            left="0px"
            width="60px"
            background={UIColors.header}
            props={{ onClick: this.props.hideKey }}
            hoverCursor="pointer"
            padding="4px"
            border="1px solid white"
            borderRadius="4px"
            color="white"
          >
            {this.props.listItems.map((li) => {
              return (
                <div key={li} onClick={() => this.props.setBack(li)}>
                  {li.split("_")[0]}
                </div>
              );
            })}
          </Box>
        ) : (
          ""
        )}
      </Box>
    );
  }
}

export default HiddenElementDropdown;
