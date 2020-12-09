import React, { Component } from "react";
import "./App.css";
import { scaleBand, scaleLinear } from "d3-scale";
import { range, extent, mean, cross } from "d3-array";
import { select } from "d3-selection";
import { axisLeft } from "d3-axis";
import { Box, Row } from "jsxstyle";
import { schemeTableau10 } from "d3-scale-chromatic";
import { line } from "d3-shape";

class ParallelCoordinates extends Component {
  constructor(props) {
    super(props);
    this.createParallelCoordinates = this.createParallelCoordinates.bind(this);
    this.pcpRef = React.createRef();
  }

  componentDidMount() {
    this.createParallelCoordinates();
  }

  componentDidUpdate() {
    this.createParallelCoordinates();
  }

  calculateGroupAverages() {
    const res = {};
    Object.keys(this.props.dataGroups).forEach((idx) => {
      const values = this.props.dataGroups[idx];
      const trueData = values.map((d) => this.props.data[d]);
      res[idx] = Object.fromEntries(
        this.props.keys
          .map((k) => [k, trueData.map((d) => d[k])])
          .map((k) => [k[0], mean(k[1])])
      );
      res[idx]["color"] = schemeTableau10[idx];
    });
    return Object.values(res);
  }

  createParallelCoordinates() {
    const selection = select(this.pcpRef.current);
    const selected = this.calculateGroupAverages();

    const pad = 30;

    const px = scaleBand()
      .domain(this.props.keys)
      .range([pad, this.props.size[0] - pad / 3])
      .padding(0.25);

    const py = new Map(
      this.props.keys.map((k) => [
        k,
        scaleLinear()
          .domain(extent(this.props.data, (d) => +d[k]))
          .range([this.props.size[1] - pad, pad])
          .nice(),
      ])
    );

    const ln = line()
      .defined(([, value]) => value != null)
      .y(([key, value]) => py.get(key)(value))
      .x(([key]) => px(key));

    selection
      .selectAll(".pcp-ln")
      .data(selected)
      .join("g")
      .attr("class", "pcp-ln")
      .attr("stroke", (_, i) => schemeTableau10[i])
      .attr("stroke-width", 1.5)
      .attr("fill", "none")
      .selectAll("path")
      .data((d) => [d])
      .join("path")
      .attr("d", (d) =>
        ln(cross(this.props.keys, [d], (key, d) => [key, d[key]]))
      );

    selection
      .selectAll(".axis")
      .data(this.props.keys)
      .join("g")
      .attr("class", "axis")
      .attr("transform", (k) => `translate(${px(k)}, 0)`)
      .each(function (d) {
        select(this).call(axisLeft(py.get(d)).ticks(5));
      });

    selection
      .selectAll(".label")
      .data(this.props.keys)
      .join("text")
      .attr("class", "label")
      .attr("x", (d) => px(d))
      .attr("y", this.props.size[1] - pad * 0.5)
      .attr("fill", "white")
      .attr("dominant-baseline", "middle")
      .attr("text-anchor", "end")
      .attr("font-size", "8px")
      .attr("font-family", "sans-serif")
      .text((d) => d.split("_")[0]);

    selection.selectAll(".axis").selectAll("text").attr("fill", "white");
    selection.selectAll(".axis").selectAll("path").attr("stroke", "white");
    selection.selectAll(".tick").selectAll("line").attr("stroke", "white");
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
