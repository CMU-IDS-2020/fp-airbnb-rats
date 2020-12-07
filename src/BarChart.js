import React, { Component } from "react";
import "./App.css";
import { scaleBand, scaleLinear, scaleLog } from "d3-scale";
import { range, extent, mean } from "d3-array";
import { select } from "d3-selection";
import HistogramElement from "./HistogramElement";
import { axisLeft } from "d3-axis";
import { Box, Row } from "jsxstyle";
import HiddenElementDropdown from "./HiddenElementDropdown";
import { schemeTableau10 } from "d3-scale-chromatic";

class BarChart extends Component {
  constructor(props) {
    super(props);
    this.createBarChart = this.createBarChart.bind(this);
    this.hideKey = this.hideKey.bind(this);
    this.setBack = this.setBack.bind(this);
    this.updateMenuTool = this.updateMenuTool.bind(this);
    this.chartRef = React.createRef();
    this.dataGroupLength = Object.values(this.props.dataGroups).length;
    this.state = {
      keys: Object.keys(this.props.data[0]).slice(3),
      removedKeys: [],
    };

    this.currentHoverGroup = -1;
    this.dataGroupLengths = 0;
    this.dataGroupLengths = [];

    this.keysLength = this.state.keys.length;

    this.hx = scaleBand()
      .domain(this.state.keys)
      .range([0, this.props.size[0]])
      .padding(0.1);

    this.hiddenElementDropdown = (
      <HiddenElementDropdown
        setBack={this.setBack}
        listItems={this.state.removedKeys}
      />
    );
  }

  hideKey(key) {
    const index = this.state.keys.indexOf(key);
    if (index > -1) {
      this.state.removedKeys.push(this.state.keys.splice(index, 1)[0]);
    }
    this.setState({
      keys: this.state.keys,
      removedKeys: this.state.removedKeys,
    });
    this.updateMenuTool();
  }

  setBack(key) {
    const index = this.state.removedKeys.indexOf(key);
    if (index > -1) {
      this.state.keys.push(this.state.removedKeys.splice(index, 1)[0]);
    }
    this.setState({
      keys: this.state.keys,
      removedKeys: this.state.removedKeys,
    });
    this.updateMenuTool();
  }

  getCurrentHoverGroup() {
    let group = -1;
    if (this.props.hoverPoint !== null) {
      Object.values(this.props.dataGroups).forEach((g, i) => {
        if (g.includes(this.props.hoverPoint)) {
          group = i;
        }
      });
    }
    return group;
  }

  calculateGroupAverages() {
    const res = {};
    Object.keys(this.props.dataGroups).forEach((idx) => {
      const values = this.props.dataGroups[idx];
      const trueData = values.map((d) => this.props.data[d]);
      res[idx] = Object.fromEntries(
        this.state.keys.map((k) => [k, mean(trueData.map((d) => d[k]))])
      );
      res[idx]["color"] = schemeTableau10[idx];
    });
    // return Object.values(this.props.dataGroups)
    //   .map((g) => g.map((d) => this.props.data[d]))
    //   .map((g) => this.state.keys.map((k) => [k, mean(g.map((d) => d[k]))]))
    //   .map((s) => Object.fromEntries(s));
    return Object.values(res);
  }

  componentDidMount() {
    this.createBarChart();
    this, this.updateMenuTool();
  }

  componentDidUpdate() {
    const currentHoverGroup = this.getCurrentHoverGroup();
    let triggerUpdate = false;

    if (this.keysLength != this.state.keys.length) {
      this.keysLength = this.state.keys.length;
      triggerUpdate = true;
    }

    if (currentHoverGroup != this.currentHoverGroup) {
      this.currentHoverGroup = currentHoverGroup;
      triggerUpdate = true;
    }

    const dgKeys = Object.keys(this.props.dataGroups);
    const dgValues = Object.values(this.props.dataGroups);
    if (dgKeys.length != this.dataGroupLength) {
      triggerUpdate = true;
      this.dataGroupLength = dgKeys.length;
      this.dataGroupLengths = dgValues.map((dg) => dg.length);
    } else if (
      dgValues.filter((dg, idx) => this.dataGroupLength[idx] != dg.length)
        .length > 0
    ) {
      triggerUpdate = true;
      this.dataGroupLengths = dgValues.map((dg) => dg.length);
    }

    if (triggerUpdate) {
      this.createBarChart();
    }
  }

  updateMenuTool() {
    let mt = this.hiddenElementDropdown;
    this.props.setMenuTools([mt]);
  }

  createBarChart() {
    const selection = select(this.chartRef.current);
    const selected = this.calculateGroupAverages();
    const selectedLen = Object.keys(selected).length;

    const hy = scaleBand()
      .domain(range(0, selectedLen))
      .range([this.props.size[1], 0])
      .padding(0.25);

    const gpoints = Object.values(this.props.dataGroups)
      .map((d) => d.map((p) => this.props.data[p]))
      .flat();

    const ry = new Map(
      this.state.keys.map((k) => [
        k,
        scaleLog()
          .domain(
            extent(
              this.props.data
                .map((d) => Object.values(d))
                .flat()
                .filter((d) => d)
            )
          )
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
      .attr("fill", (d, i) => d["color"]);

    const bars = hgroups
      .selectAll("rect")
      .data((d) =>
        this.state.keys.map((k) => {
          const o = {};
          //console.log(k, d)
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
      .data([this.state.keys[0]])
      .join("g")
      .attr("class", "axis")
      .attr("transform", (d) => `translate(${this.hx(this.state.keys[0])}, 0)`)
      .call(axisLeft(ry.get(this.state.keys[0])).ticks(4, ".1"));

    selection.selectAll(".axis").selectAll("text").attr("fill", "white");
    //.text((d) => 100 - +d);
    selection.selectAll(".axis").selectAll(".domain").attr("stroke", "white");
    selection
      .selectAll(".axis")
      .selectAll(".tick")
      .selectAll("line")
      .attr("stroke", "white");
  }

  render() {
    this.hx = scaleBand()
      .domain(this.state.keys)
      .range([100, this.props.size[0]])
      .padding(0.1);

    return (
      <Box position="relative">
        <Box color="white" position="absolute" width="100%" paddingTop="12px">
          {this.state.keys.map((k) => (
            <HistogramElement
              key={k}
              hideKey={() => this.hideKey(k)}
              name={k.split("_")[0]}
              left={this.hx(k) + this.hx.bandwidth() / 2}
            />
          ))}
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
