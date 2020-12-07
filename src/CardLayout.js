import React, { Component } from "react";
import { Col, Box, Row, Inline } from "jsxstyle";
import { UIColors } from "./colors";
import { thresholdFreedmanDiaconis } from "d3-array";

class MenuToolButtons extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTool: 0,
    };
  }

  render() {
    if (this.props.mapping.length < 1) {
      return "";
    }
    return (
      <Row>
        {this.props.mapping.map((item, idx) => (
          <Inline
            marginLeft="8px"
            key={item}
            hoverCursor="pointer"
            textDecoration={this.state.selectedTool == idx ? "underline" : ""}
            props={{
              onClick: () => {
                item[1]();
                this.setState({ selectedTool: idx });
              },
            }}
          >
            {item[0]}
          </Inline>
        ))}
      </Row>
    );
  }
}

export default class CardLayout extends Component {
  constructor(props) {
    super(props);
    this.children = props.children;
    this.state = {
      tools: [],
    };
    this.setMenuTools = this.setMenuTools.bind(this);
  }

  setMenuTools(t) {
    this.setState({ tools: t });
  }

  render() {
    let newprops = { ...this.props };
    const wid = this.props.size[0];
    newprops.size = [wid, this.props.size[1] - 40];
    newprops["setMenuTools"] = this.setMenuTools;

    return (
      <Col
        borderRadius="12px"
        overflow="hidden"
        backgroundColor={UIColors.cardBg}
      >
        <Row
          color={UIColors.text}
          backgroundColor={UIColors.header}
          width={wid}
          height={40}
          justifyContent="space-between"
          alignItems="center"
          textTransform="uppercase"
          fontWeight="600"
          paddingLeft="12px"
          paddingRight="12px"
          zIndex="2"
        >
          <Box>{this.props.title}</Box>
          <Box>
            <MenuToolButtons mapping={this.state.tools} />
          </Box>
        </Row>
        <Row
          width={wid}
          height={this.props.size[1] - 40}
          justifyContent="center"
          alignItems="center"
          position="relative"
        >
          {React.cloneElement(this.props.children, { ...newprops })}
        </Row>
      </Col>
    );
  }
}
