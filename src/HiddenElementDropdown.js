import React, { Component } from "react";
import "./App.css";
import { Box, Row } from "jsxstyle";
import { UIColors } from "./colors";

class HiddenElementDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: false,
      hoverIdx: -1,
    };
    this.toggleIsOpen = this.toggleIsOpen.bind(this);
    this.setHoverElement = this.setHoverElement.bind(this);
  }

  toggleIsOpen() {
    this.setState({ dropdownOpen: !this.state.dropdownOpen });
  }

  setHoverElement(idx) {
    this.setState({ hoverIdx: idx });
  }

  render() {
    return (
      <Box
        width="160px"
        textTransform="none"
        fontSize="12px"
        fontWeight="600"
        position="relative"
        userSelect="none"
        props={{
          onMouseEnter: () => this.setState({ dropdownOpen: true }),
          onMouseLeave: () => this.setState({ dropdownOpen: false }),
        }}
      >
        <Row
          color={UIColors.text}
          height="28px"
          width="100%"
          justifyContent="space-between"
          alignItems="center"
          padding="4px"
          backgroundColor={UIColors.cardBg}
        >
          <div>
            {this.state.dropdownOpen && this.props.listItems.length > 0
              ? "Click to add back"
              : this.props.listItems.length + " elements hidden"}
          </div>
          {this.props.listItems.length > 0 ? (
            <div>{this.state.dropdownOpen ? "▾" : "◂"}</div>
          ) : (
            ""
          )}
        </Row>
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
            {this.props.listItems.map((li, idx) => {
              return (
                <Box
                  key={li}
                  width="100%"
                  padding="8px"
                  borderTop="1px solid white"
                  backgroundColor={
                    this.state.hoverIdx === idx ? "grey" : UIColors.header
                  }
                  props={{
                    onClick: () => this.props.setBack(li),
                    onMouseEnter: () => this.setHoverElement(idx),
                    onMouseLeave: () => this.setHoverElement(-1),
                  }}
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
