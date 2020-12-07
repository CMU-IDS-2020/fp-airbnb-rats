import React, { Component } from "react";
import "./App.css";
import { scaleBand, scaleLinear } from "d3-scale";
import { range, extent, mean } from "d3-array";
import { select } from "d3-selection";
import HistogramElement from './HistogramElement';
import { axisLeft } from "d3-axis";
import {Box, Row} from 'jsxstyle'

class BarChart extends Component {
  constructor(props) {
    super(props);
    this.createBarChart = this.createBarChart.bind(this);
    this.chartRef = React.createRef();
    this.dataGroupLength = this.props.dataGroups.length;
    this.keys = Object.keys(this.props.data[0]).slice(3);
    this.currentHoverGroup = -1;
    this.dataGroupLengths = this.props.dataGroups.length;
    this.dataGroupLengths = [];
    this.hx = scaleBand()
    .domain(this.keys)
    .range([0, this.props.size[0]])
    .padding(0.1);
  }

  getCurrentHoverGroup() {
    let group = -1;
    if (this.props.hoverPoint !== null) {
      this.props.dataGroups.forEach((g, i) => {
        if (g.includes(this.props.hoverPoint)) {
          group = i;
        }
      });
    }
    return group;
  }

  calculateGroupAverages() {
    return this.props.dataGroups
      .map((g) => g.map((d) => this.props.data[d]))
      .map((g) => this.keys.map((k) => [k, mean(g.map((d) => d[k]))]))
      .map((s) => Object.fromEntries(s));
  }

  componentDidMount() {
    this.createBarChart();
  }

  componentDidUpdate() {
    const currentHoverGroup = this.getCurrentHoverGroup();
    let triggerUpdate = false;

    if (currentHoverGroup != this.currentHoverGroup) {
      this.currentHoverGroup = currentHoverGroup;
      triggerUpdate = true;
    }

    if (this.props.dataGroups.length != this.dataGroupLength) {
      triggerUpdate = true;
      this.dataGroupLength = this.props.dataGroups.length;
      this.dataGroupLengths = this.props.dataGroups.map((dg) => dg.length);
    } else if (
      this.props.dataGroups.filter(
        (dg, idx) => this.dataGroupLength[idx] != dg.length
      ).length > 0
    ) {
      triggerUpdate = true;
      this.dataGroupLengths = this.props.dataGroups.map((dg) => dg.length);
    }

    if (triggerUpdate) {
      this.createBarChart();
    }
  }

  createBarChart() {
    const selection = select(this.chartRef.current);
    const selected = this.calculateGroupAverages();

    this.hx = scaleBand()
      .domain(this.keys)
      .range([0, this.props.size[0]])
      .padding(0.1);

    const hy = scaleBand()
      .domain(range(selected.length))
      .range([this.props.size[1], 0])
      .padding(0.25);

    const gpoints = this.props.dataGroups
      .map((d) => d.map((p) => this.props.data[p]))
      .flat();

    const ry = new Map(
      this.keys.map((k) => [
        k,
        scaleLinear()
          .domain(extent(gpoints, (d) => d[k]))
          .range([hy.bandwidth() - 30, 0])
          .nice(),
      ])
    );

    const hgroups = selection
      .selectAll(".histgroup")
      .data(selected)
      .join("g")
      .attr("class", "histgroup")
      .attr("transform", (_, i) => `translate(0, ${hy(i)})`)
      .attr("opacity", (_, i) =>
        this.props.hoverPoint === null
          ? 1.0
          : i === this.currentHoverGroup
          ? 1.0
          : 0.25
      )
      .attr("fill", (_, i) => this.props.colorScale(i));
    const bars = hgroups
      .selectAll("rect")
      .data((d) =>
        this.keys.map((k) => {
          const o = {};
          o.label = k;
          o.value = d[k];
          o.width = this.hx.bandwidth();
          o.height = Math.max(ry.get(k)(d[k]), 0);
          o.x = this.hx(k);
          o.y = hy.bandwidth() - o.height;
          return o;
        })
      )
      .join("rect")
      .attr("width", (d) => d.width)
      .attr("height", (d) => d.height)
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y - 30);

    hgroups
      .selectAll(".axis")
      .data(this.keys)
      .join("g")
      .attr("class", "axis")
      .attr("transform", (d) => `translate(${this.hx(d)}, 0)`)
      .each(function (d) {
        select(this).call(axisLeft(ry.get(d)).ticks(4));
      });

    selection.selectAll(".axis").selectAll("text").attr("fill", "white");
    selection.selectAll(".axis").selectAll(".domain").attr("stroke", "white");
    selection
      .selectAll(".axis")
      .selectAll(".tick")
      .selectAll("line")
      .attr("stroke", "white");
  }

  render() {

    this.hx = scaleBand()
    .domain(this.keys)
    .range([0, this.props.size[0]])
    .padding(0.1);

    return (
      <Box
        position="relative"
      >
      <Box color="white"
        position="absolute"
        width="100%"
        paddingTop="12px"
      >
        {this.keys.map(k => <HistogramElement key={k} name={k.split("_")[0]} left={this.hx(k) + this.hx.bandwidth() / 2}/>)}
      </Box>
      <svg
        ref={this.chartRef}
        width={this.props.size[0]}
        height={this.props.size[1]}
      ></svg>
      </Box>
    );
  }
}

export default BarChart;
