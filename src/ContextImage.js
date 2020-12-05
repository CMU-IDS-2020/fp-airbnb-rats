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

const beamparams = [45, 100, -45, 400];
const imgparams = [628, 520];

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
	this.dataGroupLength = this.props.dataGroups.length;
  }

  componentDidUpdate() {
	  if(this.props.dataGroups.length != this.dataGroupLength){
		this.createCoords();
		this.dataGroupLength = this.props.dataGroups.length
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

      dataGroups.push(selPoints);
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
		if(cg < 0){
			return "#FFFFFF"
		} else {
			return cs(cg)
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
          this.props.changeHoverPoint(newPoint);
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

class ContextImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgLoaded: false,
      imgSize: [0, 0],
      scale: 0.1,
      offset: [0, 0],
      selectedTool: "",
    };
    this.onImageLoad = this.onImageLoad.bind(this);
    this.registerTool = this.registerTool.bind(this);
    this.setSelectedTool = this.setSelectedTool.bind(this);
    this.tools = {};
  }

  componentDidMount() {
    console.log("mount");
    this.registerTool("zoom", { on: () => {}, off: () => {} });
    this.setSelectedTool("zoom");
  }

  registerTool(toolName, toolFuncs) {
    this.tools[toolName] = toolFuncs;
    const toolCallbacks = Object.keys(this.tools).map((t) => [
      t,
      () => this.setSelectedTool(t),
    ]);
    this.props.setMenuTools(toolCallbacks);
  }

  setSelectedTool(tool) {
    Object.keys(this.tools).forEach((t) => {
      if (t === tool) {
        this.tools[t].on();
      } else {
        this.tools[t].off();
      }
    });
    this.setState({ selectedTool: tool });
  }

  onImageLoad(t) {
    this.setState({
      imgLoaded: true,
      imgSize: [t.target.offsetWidth, t.target.offsetHeight],
    });
  }

  render() {
    return (
      <TransformWrapper
        options={{ disabled: !(this.state.selectedTool == "zoom") }}
      >
        <TransformComponent>
          <Box position="relative">
            <Box
              zIndex={1}
              width={this.props.size[0]}
              height={this.props.size[1]}
              position="absolute"
              top="0px"
              left="0px"
            >
              {this.state.imgLoaded ? (
                <Coords
                  data={this.props.data}
                  size={this.state.imgSize}
                  colorScale={this.props.colorScale}
                  dataGroups={this.props.dataGroups}
                  changeDataGroups={this.props.changeDataGroups}
                  changeHoverPoint={this.props.changeHoverPoint}
                  registerTool={this.registerTool}
                />
              ) : (
                "Loading image..."
              )}
            </Box>
            <Box
              zIndex={0}
              component="img"
              width={imgparams[0]}
              height={imgparams[1]}
              filter="grayscale(80%) brightness(60%)"
              props={{
                src: contextImg,
                onLoad: this.onImageLoad,
              }}
            />
          </Box>
        </TransformComponent>
      </TransformWrapper>
    );
  }
}

export default ContextImage;
