import React, { Component } from "react";
import "./App.css";
import { Box, Col, Row, Inline } from "jsxstyle";
import { UIColors } from "./colors";

import lock from "./assets/lock.svg";
import open_lock from "./assets/open_lock.svg";
import info from "./assets/info.svg";

class HistogramOptions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: false,
      editAnnotation: false,
      value: "",
    };
    this.name = this.props.name;
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  render() {
    const mainScreen = (
      <>
        <Col
          position="relative"
          zIndex="10"
          width="80%"
          justifyContent="center"
          alignItems="center"
          borderBottom="1px solid grey"
        >
          <Box fontWeight="600" marginBottom="4px">
            {"Component " + this.props.compIdx}
          </Box>
          {this.props.locked ? (
            <Box fontStyle="italic" marginBottom="4px">
              Item is locked
            </Box>
          ) : (
            ""
          )}
        </Col>
        <Box marginTop="4px">
          {this.props.annotation == null ||
          this.props.annotation.length == 0 ? (
            <Inline color="grey">No annotations yet.</Inline>
          ) : (
            this.props.annotation
          )}
        </Box>
        <Box
          fontStyle="italic"
          marginTop="4px"
          border={"1px solid " + UIColors.text}
          padding="8px 12px 8px 12px"
          borderRadius="8px"
          hoverCursor="pointer"
          props={{ onClick: () => this.setState({ editAnnotation: true }) }}
        >
          Edit annotation
        </Box>
      </>
    );

    const editScreen = (
      <>
        <Box fontWeight="600" marginBottom="4px">
          Add your annotation
        </Box>
        <input
          type="text"
          value={this.state.value}
          onChange={this.handleChange}
        />
        <Box
          fontStyle="italic"
          marginTop="4px"
          border={"1px solid " + UIColors.text}
          padding="8px 12px 8px 12px"
          borderRadius="8px"
          hoverCursor="pointer"
          props={{
            onClick: () => {
              this.props.setAnnotation(this.state.value);
              this.setState({ value: "" });
              this.setState({ editAnnotation: false });
            },
          }}
        >
          Done
        </Box>
      </>
    );

    return (
      <Box position="relative" zIndex="0" className="histogram-option">
        <Col
          position="relative"
          fontSize="12px"
          zIndex="10"
          color={UIColors.text}
          props={{
            onMouseEnter: () => this.setState({ dropdownOpen: true }),
            onMouseLeave: () => this.setState({ dropdownOpen: false }),
          }}
        >
          <Box
            position="relative"
            zIndex="0"
            component="img"
            width={this.props.smallMode > 8 ? (23 - this.props.smallMode) + "px" : "100%"}
            props={{
              src: info,
            }}
          />
          {this.state.dropdownOpen ? (
            <Col
              position="absolute"
              bottom="60%"
              width="160px"
              padding="12px"
              alignItems="center"
              backgroundColor={UIColors.header}
              borderRadius="4px"
              boxShadow="12px 12px 12px rgba(0, 0, 0, 0.2), 4px 4px 4px rgba(0, 0, 0, 0.4)"
              left="0px"
              zIndex="90"
            >
              {this.state.editAnnotation ? editScreen : mainScreen}
            </Col>
          ) : (
            ""
          )}
        </Col>
        <Box
          component="img"
          hoverCursor="pointer"
          position="relative"
          zIndex="0"
          props={{
            onClick: this.props.toggleLock,
            src: this.props.locked ? lock : open_lock,
          }}
          width={this.props.smallMode > 8 ? (23 - this.props.smallMode) + "px" : "100%"}
          marginTop={this.props.smallMode > 8 ? "2px" : "4px"}
        />
      </Box>
    );
  }
}

export default HistogramOptions;
