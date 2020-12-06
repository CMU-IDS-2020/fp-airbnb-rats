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
import GroupDropdown from './GroupDropdown'
import { schemeTableau10 } from "d3-scale-chromatic";

const beamparams = [45, 100, -45, 400];

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
  }

  componentDidMount() {
    this.createCoords();
    let penFuncs = this.createPenTool();
    this.penOff = penFuncs.penOff;
    this.penOn = penFuncs.penOn;
    this.penOff();
	this.props.registerTool("pen", { on: this.penOn, off: this.penOff });
	this.dataGroupLengths = this.props.dataGroups.length;
	this.lastUpdatedIdx = 0
	this.dataGroupLengths = []
  }

  componentDidUpdate() {
	  if(this.props.dataGroups.length != this.dataGroupLength){
		this.createCoords();
		this.dataGroupLength = this.props.dataGroups.length
		this.dataGroupLengths = this.props.dataGroups.map(dg => dg.length)
	  } else if (this.dataGroupLengths.length > 0 
		&& this.dataGroupLengths[this.lastUpdatedIdx] != 
			this.props.dataGroups[this.lastUpdatedIdx].length){
			this.createCoords();
			this.dataGroupLengths[this.lastUpdatedIdx] = this.props.dataGroups[this.lastUpdatedIdx].length
	  }
  }

  createPenTool() {
    const selection = select(this.coordRef.current);
    const svg = this.coordRef.current;
    console.log(svg);
    const path = geoPath(),
      l = selection.append("path").attr("class", "lasso");

    selection.append("defs").append("style").text(`
		  .lasso { fill-rule: evenodd; fill-opacity: 0.1; stroke-width: 1.5; stroke: #000; }
		`);

    const sdg = this.props.changeDataGroups;
    let dataGroups = this.props.dataGroups;
    function draw(polygon) {
      l.datum({
        type: "LineString",
        coordinates: polygon,
      }).attr("d", path);

      svg.dispatchEvent(new CustomEvent("input"));
	}
	
	const getSelG = this.props.getSelectedGroup
	const changeLastUpdatedIdx = (i) => {this.lastUpdatedIdx = i}

    function drawEnd(polygon) {
      if (polygon.length < 2) {
        svg.dispatchEvent(new CustomEvent("input"));
        return;
      }
      const points = selection.selectAll(".pts");
      let selPoints = points
        .filter((d) => polygonContains(polygon, [d.X, d.Y]))
        .data();
	  selPoints = selPoints.map((d) => d.i);
	  const selectedGroup = getSelG()
	  if(dataGroups[selectedGroup]){
		const arr1 = dataGroups[selectedGroup]
		dataGroups[selectedGroup] = arr1.concat(selPoints)
	  } else {
		dataGroups[selectedGroup] = selPoints;
	  }

	  changeLastUpdatedIdx(selectedGroup)
      //dataGroups.push(selPoints);
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

  createCoords() {
    const selection = select(this.coordRef.current);
	const cs = this.props.colorScale

    const getGroup = (i) => {
      const g = this.props.dataGroups.filter((d) => d.includes(i));
      if (g.length > 0) {
        let gID = -1;
        this.props.dataGroups.forEach((d, j) => {
          if (d.includes(i)) {
            gID = j;
          }
		});
		
        return gID;
      } else {
        return -1;
      }
	};
	
	const getColor = (i) => {
		const cg = getGroup(i);
		//console.log("bla", cg)
		if(cg < 0){
			return "#FFFFFF"
		} else {
			return schemeTableau10[cg]
		}
	}

    selection
      .selectAll(".pts")
      .data(this.props.data.map((d, i) => ({ ...d, i: i })))
      .join("circle")
      .attr("cx", (d) => d.X)
      .attr("cy", (d) => d.Y)
      .attr("r", 1)
      .attr("fill", (d) => getColor(d.i))
      .attr("opacity", (d) =>
        getGroup(d.i) < 0 ? 0.35 : 1
      )
      .attr("class", "pts")
      .attr("key", (d) => `circle-${d.i}`)
      .on(
        "mouseenter",
        function (e, d) {
          const g = getGroup(d.i);
          const newPoint = g >= this.props.dataGroups.length ? null : d.i;
          if(this.props.pen !== "zoom"){
			this.props.changeHoverPoint(newPoint);
		  } else {
			this.props.changeHoverPoint(null);  
		  }
        }.bind(this)
      )
      .on(
        "mouseleave",
        function (e, d) {
          this.props.changeHoverPoint(null);
        }.bind(this)
      );
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

export default Coords