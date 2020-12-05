import React, { Component } from "react";
import { scaleLinear } from "d3-scale";
import { extent } from "d3-array";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Box, Row, Inline } from "jsxstyle";
import "./App.css";
import contextImg from "./data/kingscourt_ir/kingscourt_ir_context_image.jpg";
import trackPointer from "./trackPointer";
import { dispatch } from "d3-dispatch";
import { geoPath } from "d3-geo";
import {polygonContains} from 'd3-polygon';
import { select } from "d3-selection";
import { chartColors } from "./colors";

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

  return lasso;
}

class Coords extends Component {
  constructor(props) {
    super(props);
    this.createCoords = this.createCoords.bind(this);
    this.data = this.props.data;
    this.dataX = this.data.map((d) => d.X * beamparams[0] + beamparams[1]);
    this.dataY = this.data.map((d) => d.Y * beamparams[2] + beamparams[3]);

    this.minimumX = Math.min(...this.dataX);
    this.minimumY = Math.min(...this.dataY);
    this.maximumX = Math.max(...this.dataX);
    this.maximumY = Math.max(...this.dataY);

    const expansion = 0.04;
    this.rangeX = (this.maximumX - this.minimumX) * (1 + expansion);
    this.rangeY = (this.maximumY - this.minimumY) * (1 + expansion);
    this.offsetX = (this.maximumX - this.minimumX) * ((-1 * expansion) / 2);
	this.offsetY = (this.maximumY - this.minimumY) * ((-1 * expansion) / 2);
	this.state = {
		refLoaded: false
	}
	this.coordRef = React.createRef();
  }

  componentDidMount() {
	this.createCoords();
	this.createPenTool()
	console.log("did mount", this)
	if(this.coordRef.current){
		this.setState({refLoaded: true});
	}
  }

  componentDidUpdate() {
	//this.createCoords();
	if(this.coordRef.current && !this.state.refLoaded){
		this.setState({refLoaded: true});
	}
  }

  createPenTool(){
		const selection = select(this.coordRef.current)
		//console.log(selection, select(selection))
		const svg = this.coordRef.current
		console.log(svg)
		const path = geoPath(),
		l = selection.append("path").attr("class", "lasso"),
		g = selection.append("g")
		// points = g
		//   .selectAll("circle")
		//   .data(data)
		//   .join("circle")
		//   .attr("r", 1.5)
		//   .attr("transform", d => `translate(${d})`);
	
	  selection.append("defs").append("style").text(`
		  .selected {r: 2.5; fill: red}
		  .lasso { fill-rule: evenodd; fill-opacity: 0.1; stroke-width: 1.5; stroke: #000; }
		`);
	
	  function draw(polygon) {
		l.datum({
		  type: "LineString",
		  coordinates: polygon
		}).attr("d", path);
	
		//const selected = polygon.length > 2 ? [] : data;
	
		// note: d3.polygonContains uses the even-odd rule
		// which is reflected in the CSS for the lasso shape
		// points.classed(
		//   "selected",
		//   polygon.length > 2
		//     ? d => polygonContains(polygon, d) && selected.push(d)
		//     : false
		// );
	
		//svg.value = { polygon, selected };
		svg.dispatchEvent(new CustomEvent('input'));
	  }
	
	  selection.call(lasso().on("start lasso end", draw));
	  //draw(defaultLasso);
	
	  //return svg;
  }

  createCoords() {
    const node = this.node;
    let data1, data2;
    if (this.data.length > 3000) {
      data1 = this.data.slice(0, 3000);
      data2 = this.data.slice(3000);
    } else {
      data1 = this.data;
    }

    const getColGroup = (i) => {
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
        return this.props.dataGroups.length;
      }
    };

    const pts1 = data1.map((d, i) => (
      <circle
        cx={d.X * beamparams[0] + beamparams[1]}
        cy={d.Y * beamparams[2] + beamparams[3]}
        r={1}
        fill={this.props.colorScale(getColGroup(i))}
        opacity={getColGroup(i) >= this.props.dataGroups.length ? 0.35 : 1}
        onMouseEnter={(k) =>
          getColGroup(i) >= this.props.dataGroups.length
            ? this.props.changeHoverPoint(null)
            : this.props.changeHoverPoint(i)
        }
        onMouseLeave={(k) => this.props.changeHoverPoint(null)}
        key={`circle-${i}`}
      />
    ));

    const pts2 = data2.map((d, i) => (
      <circle
        cx={d.X * beamparams[0] + beamparams[1]}
        cy={d.Y * beamparams[2] + beamparams[3]}
        r={1}
        fill={this.props.colorScale(getColGroup(i))}
        opacity={getColGroup(i) >= this.props.dataGroups.length ? 0.35 : 1}
        onMouseEnter={(k) =>
          getColGroup(i) >= this.props.dataGroups.length
            ? this.props.changeHoverPoint(null)
            : this.props.changeHoverPoint(i)
        }
        onMouseLeave={(k) => this.props.changeHoverPoint(null)}
        key={`circle-${i}`}
      />
    ));
    select(this.coordRef.current).append(pts1);
  }

  render() {
	  
    return (
      <svg
        ref={this.coordRef}
        width={this.props.size[0]}
        height={this.props.size[1]}
      >
	  </svg>
    );
  }
}

class MenuToolButtons extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTool: "zoom",
    };
    this.mapping = this.props.mapping;
    this.sst = this.props.setSelectedTool;
  }

  render() {
    return (
      <Row>
        {this.mapping.map((item) => (
          <Inline
            marginLeft="8px"
            key={item}
            hoverCursor="pointer"
            textDecoration={this.state.selectedTool == item ? "underline" : ""}
            props={{
              onClick: () => {
                this.sst(item);
                this.setState({ selectedTool: item });
              },
            }}
          >
            {item}
          </Inline>
        ))}
      </Row>
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
      selectedTool: "zoom",
    };
    this.onImageLoad = this.onImageLoad.bind(this);
    this.setSelectedTool = this.setSelectedTool.bind(this);

    const menuToolButtons = ["pen", "zoom"];

    props.setMenuTools(
      <MenuToolButtons
        mapping={menuToolButtons}
        setSelectedTool={this.setSelectedTool}
      />
    );
  }

  setSelectedTool(tool) {
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
                  changeHoverPoint={this.props.changeHoverPoint}
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
