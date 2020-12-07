import React, { Component } from "react";
import "./App.css";
import { Box } from "jsxstyle";

class HistogramElement extends Component {
  constructor(props) {
    super(props);
    this.name = this.props.title;
  }

  render() {
  return (
    <Box color="white">
      {this.name}
    </Box>);
  }
}

export default HistogramElement;
