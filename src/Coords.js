import React, { Component } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Box } from "jsxstyle";
import "./App.css";
import contextImg from "./data/kingscourt_ir/kingscourt_ir_context_image.jpg";
import trackPointer from "./trackPointer";
import { dispatch } from "d3-dispatch";
import { geoPath } from "d3-geo";
import { polygonContains } from "d3-polygon";
import { select } from "d3-selection";
import GroupDropdown from "./GroupDropdown";
import { schemeTableau10 } from "d3-scale-chromatic";

const beamparams = [46, 100, -44, 400];

function lasso() {
  const lDispatch = dispatch("start", "lasso", "end");
  const lasso = function (selection) {
    const node = selection.node();
    const polygon = [];

    selection
      .on("touchmove", (e) => e.preventDefault()) // prevent scrolling
      .on("pointerdown", (e) => {
        trackPointer(e, {
          start: (p) => {
            polygon.length = 0;
            lDispatch.call("start", node, polygon);
          },
          move: (p) => {
            polygon.push(p.point);
            lDispatch.call("lasso", node, polygon);
          },
          end: (p) => {
            lDispatch.call("end", node, polygon);
          },
        });
      });
  };
  lasso.on = function (type, _) {
    return _ ? (lDispatch.on(...arguments), lasso) : lDispatch.on(...arguments);
  };

  lasso.off = function (args) {
    lDispatch.on(args, null);
  };

  return lasso;
}

class Coords extends Component {
  constructor(props) {
    super(props);
    this.createCoords = this.createCoords.bind(this);
    this.getColor = this.getColor.bind(this);
    this.getGroup = this.getGroup.bind(this);
    this.data = this.props.data.slice();
    this.data.forEach((d) => {
      d.X = d.X * beamparams[0] + beamparams[1];
      d.Y = d.Y * beamparams[2] + beamparams[3];
    });
    this.dataX = this.data.map((d) => d.X);
    this.dataY = this.data.map((d) => d.Y);

    this.minimumX = Math.min(...this.dataX);
    this.minimumY = Math.min(...this.dataY);
    this.maximumX = Math.max(...this.dataX);
    this.maximumY = Math.max(...this.dataY);

    const expansion = 0.04;
    this.rangeX = (this.maximumX - this.minimumX) * (1 + expansion);
    this.rangeY = (this.maximumY - this.minimumY) * (1 + expansion);
    this.offsetX = (this.maximumX - this.minimumX) * ((-1 * expansion) / 2);
    this.offsetY = (this.maximumY - this.minimumY) * ((-1 * expansion) / 2);
    this.coordRef = React.createRef();

    this.penOff;
    this.penOn;

    this.tool = this.props.pen();
    this.hoverPoint = null;
  }

  componentDidMount() {
    this.createCoords();
    let penFuncs = this.createPenTool();
    this.penOff = penFuncs.penOff;
    this.penOn = penFuncs.penOn;
    this.penOff();
    this.props.registerTool("pen", { on: this.penOn, off: this.penOff });
    this.dataGroupLength = 1;
    this.dataGroupLengths = [0];
  }

  componentDidUpdate() {
    const dgKeys = Object.keys(this.props.dataGroups);
    const dgValues = Object.values(this.props.dataGroups);
    let needToUpdate = false;

    //console.log(this.props.dataGroups, dgKeys, dgValues)
    //console.log(this.dataGroupLength, this.dataGroupLengths)

    if (dgKeys.length != this.dataGroupLength) {
      needToUpdate = true;
      this.dataGroupLength = dgKeys.length;
      this.dataGroupLengths = dgValues.map((dg) => dg.length);
    } else if (
      dgValues.filter((dg, idx) => this.dataGroupLengths[idx] != dg.length)
        .length > 0
    ) {
      needToUpdate = true;
      this.dataGroupLengths = dgValues.map((dg) => dg.length);
    }

    if (this.hoverPoint != this.props.hoverPoint) {
      this.hoverPoint = this.props.hoverPoint;
      needToUpdate = true;
    }

    if (this.tool != this.props.pen()) {
      this.tool = this.props.pen();
      needToUpdate = true;
    }

    if (needToUpdate) {
      this.createCoords();
    }
  }

  createPenTool() {
    const selection = select(this.coordRef.current);
    const svg = this.coordRef.current;
    const path = geoPath(),
      l = selection.append("path").attr("class", "lasso");

    selection.append("defs").append("style").text(`
		  .lasso { fill-rule: evenodd; fill-opacity: 0.2; stroke-width: 2; stroke: #AEF; fill: #AEF }
		`);

    const sdg = this.props.changeDataGroups;
    let dataGroupsGetter = this.props.getDataGroups;
    let shiftDownGetter = this.props.shiftDownGetter;
    //console.log("data groups", dataGroups)
    function draw(polygon) {
      l.datum({
        type: "LineString",
        coordinates: polygon,
      }).attr("d", path);

      svg.dispatchEvent(new CustomEvent("input"));
    }

    const getSelG = this.props.getSelectedGroup;
    const changeLastUpdatedIdx = (i) => {
      this.lastUpdatedIdx = i;
    };

    function drawEnd(polygon) {
      const dataGroups = dataGroupsGetter();
      const shiftDown = shiftDownGetter();

      l.datum({
        type: "LineString",
        coordinates: [],
      }).attr("d", path);

      if (polygon.length < 2) {
        svg.dispatchEvent(new CustomEvent("input"));
        return;
      }
      const points = selection.selectAll(".pts");
      let selPoints = points
        .filter((d) => polygonContains(polygon, [d.X, d.Y]))
        .data();
      selPoints = selPoints.map((d) => d.i);
      const selectedGroup = getSelG();
      if (!shiftDown) {
        if (dataGroups[selectedGroup]) {
          const arr1 = dataGroups[selectedGroup];
          dataGroups[selectedGroup] = [...new Set([...arr1, ...selPoints])];
        } else {
          dataGroups[selectedGroup] = selPoints;
        }
      }

      const excludeArray = shiftDown ? selPoints : dataGroups[selectedGroup];

      Object.keys(dataGroups).forEach((dg) => {
        const val = dataGroups[dg];
        if (shiftDown) {
          dataGroups[dg] = val.filter(
            (dgElement) => !excludeArray.includes(dgElement)
          );
        } else {
          if (dg != selectedGroup) {
            dataGroups[dg] = val.filter(
              (dgElement) => !excludeArray.includes(dgElement)
            );
          }
        }
      });

      changeLastUpdatedIdx(selectedGroup);
      sdg(dataGroups);
    }

    let lass = lasso();

    return {
      penOn: () => {
        selection.call(lass.on("lasso start", draw));
        selection.call(lass.on("end", drawEnd));
      },
      penOff: () => lass.off("start lasso end"),
    };
  }

  getGroup(i) {
    let gID = -1;
    Object.keys(this.props.dataGroups).forEach((d, j) => {
      if (this.props.dataGroups[d].includes(i)) {
        gID = d;
      }
    });
    return gID;
  }

  getColor(i) {
    const cg = this.getGroup(i);
    if (cg < 0) {
      return "#FFFFFF";
    } else {
      return schemeTableau10[cg];
    }
  }

  createCoords() {
    const selection = select(this.coordRef.current);
    const tool = this.props.pen;
    if (tool() == "eye") {
      selection
        .selectAll(".pts")
        .data(this.props.data.map((d, i) => ({ ...d, i: i })))
        .join("circle")
        .attr("cx", (d) => d.X)
        .attr("cy", (d) => d.Y)
        .attr("r", (d) => (this.hoverPoint == d.i ? 3 : 1.3))
        .attr("fill", (d) =>
          this.hoverPoint == d.i ? "#88AAFF" : this.getColor(d.i)
        )
        .attr("opacity", (d) =>
          this.getGroup(d.i) >= 0 || this.hoverPoint == d.i ? 1 : 0.25
        )
        .attr("class", "pts")
        .attr("key", (d) => `circle-${d.i}`)
        .on(
          "mouseenter",
          function (e, d) {
            console.log("mouse enter", tool());
            const g = this.getGroup(d.i);
            const newPoint = g >= this.props.dataGroups.length ? null : d.i;
            this.props.changeHoverPoint(newPoint);
          }.bind(this)
        )
        .on(
          "mouseleave",
          function (e, d) {
            this.props.changeHoverPoint(null);
          }.bind(this)
        );
    } else {
      selection
        .selectAll(".pts")
        .data(this.props.data.map((d, i) => ({ ...d, i: i })))
        .join("circle")
        .attr("cx", (d) => d.X)
        .attr("cy", (d) => d.Y)
        .attr("r", 1.3)
        .attr("fill", (d) => this.getColor(d.i))
        .attr("opacity", (d) => (this.getGroup(d.i) >= 0 ? 1 : 0.25))
        .attr("class", "pts")
        .attr("key", (d) => `circle-${d.i}`)
        .on("mouseenter", null)
        .on("mouseleave", null);
    }
  }

  render() {
    return (
      <svg
        ref={this.coordRef}
        width={this.props.size[0]}
        height={this.props.size[1]}
      ></svg>
    );
  }
}

export default Coords;
