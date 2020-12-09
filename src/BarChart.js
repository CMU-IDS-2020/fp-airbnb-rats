import React, { Component } from "react";
import "./App.css";
import { scaleBand, scaleLinear, scaleLog } from "d3-scale";
import { range, extent, mean, deviation, quantile } from "d3-array";
import { select } from "d3-selection";
import HistogramElement from "./HistogramElement";
import { axisLeft } from "d3-axis";
import { Box, Row } from "jsxstyle";
import { schemeTableau10 } from "d3-scale-chromatic";
import { transition } from "d3-transition";
import { format } from "d3-format";
import { color } from "d3-color";
import { UIColors } from "./colors";

class BarChart extends Component {
  constructor(props) {
    super(props);
    this.createBarChart = this.createBarChart.bind(this);
    this.chartRef = React.createRef();
    this.dataGroupLength = Object.values(this.props.dataGroups).length;
    this.currentHoverGroup = -1;
    this.dataGroupLengths = 0;
    this.dataGroupLengths = [];
    this.keysLength = 23;
    this.bulkAverages = this.props.bulkAverages;

    this.hx = scaleBand()
      .domain(this.props.keys)
      .range([0, this.props.size[0]])
      .padding(0.1);
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
      if (values.length != 0) {
        const trueData = values.map((d) => this.props.data[d]);
        res[idx] = Object.fromEntries(
          this.props.keys
            .map((k) => [k, trueData.map((d) => d[k])])
            .map((k) => [
              k[0],
              [
                mean(k[1]),
                deviation(k[1]),
                quantile(k[1], 0),
                quantile(k[1], 0.25),
                quantile(k[1], 0.5),
                quantile(k[1], 0.75),
                quantile(k[1], 1),
              ],
            ])
        );

        res[idx]["color"] = schemeTableau10[idx];
      }
    });
    return Object.values(res);
  }

  componentDidMount() {
    this.createBarChart();
    //this.updateMenuTool();
  }

  componentDidUpdate(prevProps, prevState) {
    const currentHoverGroup = this.getCurrentHoverGroup();
    let triggerUpdate = false;
    prevProps.keys.forEach((key, idx) => {
      if (key != this.props.keys[idx]) {
        triggerUpdate = true;
      }
    });

    if(prevProps.scaleMode != this.props.scaleMode){
      triggerUpdate = true;
    }

    if (
      prevProps.size[0] != this.props.size[0] ||
      prevProps.size[1] != this.props.size[1]
    ) {
      triggerUpdate = true;
    }

    if (this.keysLength != this.props.keys.length) {
      this.keysLength = this.props.keys.length;
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
      dgValues.filter((dg, idx) => this.dataGroupLengths[idx] != dg.length)
        .length > 0
    ) {
      triggerUpdate = true;
      this.dataGroupLengths = dgValues.map((dg) => dg.length);
    }

    if (triggerUpdate) {
      this.createBarChart();
    }
  }

  createBarChart() {
    const selection = select(this.chartRef.current);
    const selected = this.calculateGroupAverages();
    selected.push(this.bulkAverages);

    const selectedLen = Object.keys(selected).length;

    const hy = scaleBand()
      .domain(range(0, selectedLen))
      .range([this.props.size[1], 0])
      .padding(0.25);

    const meansonly = selected
      .map((d) => Object.values(d).map((g) => g[0]))
      .flat()
      .filter((b) => b !== 0);
    const domainMean = extent(meansonly);
    const ry2 =
      this.props.scaleMode === "log"
        ? scaleLog().domain(domainMean).range([hy.bandwidth(), 0]).nice()
        : scaleLinear()
            .domain([0, domainMean[1]])
            .range([hy.bandwidth(), 0])
            .nice();

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
          : 0.45
      );

    const bars = hgroups
      .selectAll("rect")
      .data((dat) =>
        this.props.keys.map((k, i) => {
          const o = {};
          const d = dat[k];
          o.label = k;
          o.value = d[0];
          o.variance = d[1];
          o.width = this.hx.bandwidth();
          const transformedHeight = d[0] === 0 ? 0 : ry2(d[0]);
          o.height = d[0] === 0 ? 0 : hy.bandwidth() - transformedHeight;
          o.x = this.hx(k);
          o.y = transformedHeight;
          o.i = i;
          o.color = dat["color"];
          o.qmin = d[2];
          o.q1 = d[3];
          o.qmed = d[4];
          o.q3 = d[4];
          o.qmax = d[5];
          o.innerwidth = this.props.size[0];
          o.innerheight = this.props.size[1];
          return o;
        })
      )
      .join("rect")
      .attr("width", (d) => d.width)
      .attr("height", (d) => d.height)
      .attr("fill", (d) => d["color"])
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .on("mouseenter", function (e, d) {
        const boundpadx = -20;
        const boundpady = -80;
        const pd = select(this.parentNode).attr("transform");
        const tx = +pd.split(",")[1].replace(/[^0-9\.]/g, "");
        const dx = d.x > d.innerwidth * 0.75 ? boundpadx : 0;
        const dy = tx + d.y > d.innerheight * 0.5 ? boundpady : 0;
        const dopad = `translate(${dx}, ${dy})`;
        const tg = selection
          .append("g")
          .attr("class", "htooltip")
          .attr("transform", pd)
          .attr("opacity", 0);
        tg.transition().duration(300).attr("opacity", 1);

        const rw = 124;
        const ts = 15;
        tg.append("rect")
          .attr("x", d.x + d.width / 2 - rw / 2)
          .attr("y", d.y - ts / 2)
          .attr("transform", dopad)
          .attr("width", rw)
          .attr("height", ts * 4 + 25)
          .attr("fill", UIColors.background)
          .attr("pointer-events", "none")
          .attr("stroke-width", 1);

        tg.append("text")
          .attr("x", d.x + d.width / 2)
          .attr("y", d.y + 5)
          .attr("transform", dopad)
          .attr("pointer-events", "none")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", ts - 4)
          .attr("font-family", "sans-serif")
          .attr("fill", "white")
          .text(
            `μ = ${format(".2f")(d.value)}, σ = ${format(".2f")(d.variance)}`
          );
        tg.append("text")
          .attr("x", d.x + d.width / 2)
          .attr("y", d.y + 25)
          .attr("transform", dopad)
          .attr("pointer-events", "none")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", ts - 4)
          .attr("font-family", "sans-serif")
          .attr("fill", "white")
          .text(
            `min = ${format(".2f")(d.qmin)}, max = ${format(".2f")(d.qmax)}`
          );
        tg.append("text")
          .attr("x", d.x + d.width / 2)
          .attr("y", d.y + 45)
          .attr("transform", dopad)
          .attr("pointer-events", "none")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", ts - 4)
          .attr("font-family", "sans-serif")
          .attr("fill", "white")
          .text(`Q1 = ${format(".2f")(d.q1)}, Q3 = ${format(".2f")(d.q3)}`);
        tg.append("text")
          .attr("transform", dopad)
          .attr("x", d.x + d.width / 2)
          .attr("y", d.y + 65)
          .attr("pointer-events", "none")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", ts - 4)
          .attr("font-family", "sans-serif")
          .attr("fill", "white")
          .text(`Median = ${format(".2f")(d.qmed)}`);
      })
      .on("mouseleave", function (e, d) {
        selection
          .selectAll(".htooltip")
          .transition()
          .duration(300)
          .attr("opacity", 0)
          .transition()
          .remove();
      });

    hgroups
      .selectAll(".vrect")
      .data((dat) =>
        this.props.keys.map((k, i) => {
          const o = {};
          const d = dat[k];
          o.label = k;
          o.value = d[1];
          o.width = this.hx.bandwidth() / 4;
          const transformedHeight = d[0] === 0 ? 0 : ry2(d[1]);
          o.height = d[0] === 0 ? 0 : hy.bandwidth() - transformedHeight;
          o.x = this.hx(k) + this.hx.bandwidth() / 2 - o.width / 2;
          o.y = transformedHeight;
          o.i = i;
          o.color = dat["color"];
          return o;
        })
      )
      .join("rect")
      .attr("width", (d) => d.width)
      .attr("height", (d) => d.height)
      .attr("pointer-events", "none")
      .attr("fill", (d) => color(d.color).brighter(0.5))
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y);

    hgroups
      .selectAll(".axis")
      .data([this.props.keys[0]])
      .join("g")
      .attr("class", "axis")
      .attr("transform", (d) => `translate(${this.hx(this.props.keys[0])}, 0)`)
      .call(axisLeft(ry2).ticks(5, "0.3f"));

    selection.selectAll(".axis").selectAll("text").attr("fill", "white");

    selection.selectAll(".axis").selectAll(".domain").attr("stroke", "white");
    selection
      .selectAll(".axis")
      .selectAll(".tick")
      .selectAll("line")
      .attr("stroke", "white");

    selection.selectAll(".bulklabel").remove();

    selection
      .selectAll(".histgroup:last-child")
      .append("text")
      .text("Average of all samples")
      .attr("class", "bulklabel")
      .attr("fill", "white")
      .attr("dominant-baseline", "hanging")
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("dy", 4)
      .attr("x", this.props.size[0] / 2)
      .attr("y", hy.bandwidth());

    if (this.props.hoverPoint !== null) {
      selection
        .selectAll(".hvline")
        .data(selected)
        .join("g")
        .attr("transform", (_, i) => `translate(0, ${hy(i)})`)
        .selectAll("line")
        .data(this.props.keys)
        .join("line")
        .attr("class", (d) => "hvline")
        .attr("stroke", "white")
        .attr("stroke-width", 3)
        .attr("x1", (d) => this.hx(d))
        .attr("x2", (d) => this.hx(d) + this.hx.bandwidth())
        .attr("y1", (d) =>
          this.props.data[this.props.hoverPoint][d] === 0
            ? hy.bandwidth()
            : ry2(this.props.data[this.props.hoverPoint][d])
        )
        .attr("y2", (d) =>
          this.props.data[this.props.hoverPoint][d] === 0
            ? hy.bandwidth()
            : ry2(this.props.data[this.props.hoverPoint][d])
        );
    } else {
      selection.selectAll(".hvline").remove();
    }
  }

  render() {
    this.hx = scaleBand()
      .domain(this.props.keys)
      .range([50, this.props.size[0] - 20])
      .padding(0.1);

    return (
      <Box position="relative">
        <Box color="white" position="absolute" width="100%" paddingTop="12px">
          {this.props.keys.map((k) => (
            <HistogramElement
              key={k}
              hideKey={() => this.props.hideKey(k)}
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
