import React, { Component } from "react";
import "./App.css";
import { scaleBand, scaleLinear, scaleLog } from "d3-scale";
import { range, extent, mean, variance } from "d3-array";
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
        this.state.keys.map((k) => [k, trueData.map((d) => d[k])])
          .map((k) => [k[0], [mean(k[1]), variance(k[1])]])
      );
      res[idx]["color"] = schemeTableau10[idx];
    });
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

    console.log(selected)

    const hy = scaleBand()
      .domain(range(0, selectedLen))
      .range([this.props.size[1], 0])
      .padding(0.25);

    const meansonly = selected.map(d => Object.values(d).map(g => g[0])).flat().filter((b) => b !== 0)
    const domainMean = extent(meansonly)
    const ry2 = scaleLog().domain(domainMean).range([hy.bandwidth(), 0]).nice()

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
      .data((dat) =>
        this.state.keys.map((k, i) => {
          const o = {};
          const d = dat[k]
          o.label = k;
          o.value = d[0];
          o.width = this.hx.bandwidth();
          const transformedHeight = d[0] === 0 ? 0 : ry2(d[0]);
          o.height = hy.bandwidth() - transformedHeight;
          o.x = this.hx(k);
          o.y = transformedHeight;
          o.i = i;
          console.log(dat, k, o)
          return o;
        })
      )
      .join("rect")
      .attr("width", (d) => d.width)
      .attr("height", (d) => d.height)
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)

    hgroups
      .selectAll(".axis")
      .data([this.state.keys[0]])
      .join("g")
      .attr("class", "axis")
      .attr("transform", (d) => `translate(${this.hx(this.state.keys[0])}, 0)`)
      .call(axisLeft(ry2).ticks(5, "0.2f"));

    selection.selectAll(".axis").selectAll("text").attr("fill", "white")
    
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
