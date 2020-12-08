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
        position="relative"
        userSelect="none"
        props={{
          onMouseEnter: () => this.setState({ dropdownOpen: true }),
          onMouseLeave: () => this.setState({ dropdownOpen: false }),
        }}
      >
        <Box
          color={UIColors.text}
          fontSize="12px"
          backgroundColor={UIColors.cardBg}
        >
          {this.state.dropdownOpen && this.props.listItems.length > 0
            ? "Click to add back"
            : this.props.listItems.length + " elements hidden"}
        </Box>
        {this.state.dropdownOpen && this.props.listItems.length > 0 ? (
          <Box
            position="absolute"
            top="100%"
            left="0px"
            width="100%"
            background={UIColors.header}
            props={{ onClick: this.props.hideKey }}
            hoverCursor="pointer"
            color="white"
          >
            {this.props.listItems.map((li) => {
              return (
                <Box
                  key={li}
                  width="100%"
                  padding="4px"
                  borderTop="1px solid white"
                  props={{ onClick: () => this.props.setBack(li) }}
                >
                  {li.split("_")[0]}
                </Box>
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
