import React, { Component } from "react";
import "./App.css";
import { scaleBand, scaleLinear } from "d3-scale";
import { range, extent } from "d3-array";
import { select } from "d3-selection";
import { transition } from "d3-transition";

class BarChart extends Component {
  constructor(props) {
    super(props);
    this.createBarChart = this.createBarChart.bind(this);
    this.chartRef = React.createRef();
    this.dataGroupLength = this.props.dataGroups.length;
  }

  componentDidMount() {
    this.createBarChart();
  }

  componentDidUpdate() {
    if (this.props.dataGroups.length != this.dataGroupLength) {
      this.createBarChart();
      this.dataGroupLength = this.props.dataGroups.length;
    }
  }

  createBarChart() {
    const selection = select(this.chartRef.current);

    const keys = Object.keys(this.props.data[0]).slice(3);

    const selected = this.props.dataGroups
      .map((d) => d.map((p) => this.props.data[p]))
      .map((d) =>
        d.reduce((a, b) => {
          const o = {};
          keys.forEach((k) => {
            o[k] = a[k] + b[k];
          });
          keys.forEach((k) => {
            o[k] = o[k] / d.length;
          });
          return o;
        })
      );

    const hx = scaleBand()
      .domain(keys)
      .range([0, this.props.size[0]])
      .padding(0.1);

    const hy = scaleBand()
      .domain(range(selected.length))
      .range([this.props.size[1], 0])
      .padding(0.25);

    const mh = hy.bandwidth();

    const gpoints = this.props.dataGroups
      .map((d) => d.map((p) => this.props.data[p]))
      .flat();

    const ry = new Map(
      keys.map((k) => [
        k,
        scaleLinear()
          .domain(extent(gpoints, (d) => d[k]))
          .range([mh - 20, 0]),
      ])
    );

    let currentHoverGroup = -1;
    if (this.props.hoverPoint !== null) {
      this.props.dataGroups.forEach((g, i) => {
        if (g.includes(this.props.hoverPoint)) {
          currentHoverGroup = i;
        }
      });
    }

    selection
      .selectAll("g")
      .data(selected)
      .join("g")
      .attr("transform", (_, i) => `translate(0, ${hy(i)})`)
      .attr("opacity", (_, i) =>
        this.props.hoverPoint === null
          ? 1.0
          : i === currentHoverGroup
          ? 1.0
          : 0.25
      )
      .attr("fill", (_, i) => this.props.colorScale(i))
      .selectAll("rect")
      .data((d) =>
        keys.map((k) => {
          const o = {};
          o.label = k;
          o.value = d[k];
          o.width = hx.bandwidth();
          o.height = Math.max(ry.get(k)(d[k]), 0);
          o.x = hx(k);
          o.y = mh - o.height;
          return o;
        })
      )
      .join("rect")
      .attr("width", (d) => d.width)
      .attr("height", (d) => d.height)
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y);

    selection
      .selectAll("text")
      .data(keys)
      .join("text")
      .text((d) => d.split("_")[0])
      .attr("fill", "white")
      .attr("x", (d) => hx(d) + hx.bandwidth() / 2)
      .attr("y", 10)
      .style("text-anchor", "middle")
      .style("font-size", "8px")
      .attr("font-family", "sans-serif");

    if (this.props.hoverPoint === null) {
      selection.selectAll(".hlgroup").remove();
    } else {
      const pt = this.props.data[this.props.hoverPoint];
      selection
        .append("g")
        .attr("class", "hlgroup")
        .attr("transform", `translate(0, ${hy(currentHoverGroup)})`)
        .selectAll("line")
        .data(
          keys.map((k) => {
            const o = {};
            o.value = pt[k];
            o.label = k;
            return o;
          })
        )
        .join("line")
        .attr("stroke", "white")
        .attr("x1", (d) => hx(d.label))
        .attr("x2", (d) => hx(d.label) + hx.bandwidth())
        .attr("y1", (d) => ry.get(d.label)(d.value))
        .attr("y2", (d) => ry.get(d.label)(d.value));
    }
  }

  render() {
    return (
      <svg
        ref={this.chartRef}
        width={this.props.size[0]}
        height={this.props.size[1]}
      ></svg>
    );
  }
}

export default BarChart;
