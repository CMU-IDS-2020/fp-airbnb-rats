import React, { Component } from "react";
import "./App.css";
import { Box, Col, Row } from "jsxstyle";
import { UIColors } from "./colors";

import lock from "./assets/lock.svg";
import open_lock from "./assets/open_lock.svg";
import info from "./assets/info.svg";

class HistogramOptions extends Component {
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
      >
        <Col>
          <Box
            component="img"
            props={{
              onMouseEnter: () => this.setState({ dropdownOpen: true }),
              onMouseLeave: () => this.setState({ dropdownOpen: false }),
              src: info,
            }}
            width="100%"
          />
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
        </Col>
        <Box
          component="img"
          props={{
            onClick: () => this.setState({ dropdownOpen: true }),
            src: lock,
          }}
          width="100%"
          marginTop="4px"
        />
      </Box>
    );
  }
}

export default HistogramOptions;
