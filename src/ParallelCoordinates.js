import React, { Component } from "react";
import "./App.css";
import { scaleBand, scaleLinear } from "d3-scale";
import { range, extent, mean } from "d3-array";
import { select } from "d3-selection";
import { axisLeft } from "d3-axis";
import { Box, Row } from "jsxstyle";
import { schemeTableau10 } from "d3-scale-chromatic";

class ParallelCoordinates extends Component {
  constructor(props) {
    super(props);
    this.createParallelCoordinates = this.createParallelCoordinates.bind(this);
    this.pcpRef = React.createRef();
    this.keys = Object.keys(this.props.data[0]).slice(3);
  }

  componentDidMount() {
    this.createParallelCoordinates();
  }

  createParallelCoordinates() {
    const selection = select(this.pcpRef.current);
    selection.selectAll("g");
  }

  render() {
    return (
      <svg
        ref={this.pcpRef}
        width={this.props.size[0]}
        height={this.props.size[1]}
      ></svg>
    );
  }
}

export default ParallelCoordinates;
