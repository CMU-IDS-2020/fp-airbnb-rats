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
import Coords from "./Coords";

const imgparams = [628, 520];

class ContextImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgLoaded: false,
      imgSize: [0, 0],
      scale: 0.1,
      offset: [0, 0],
      selectedTool: "",
      selectedGroup: 0,
    };
    this.onImageLoad = this.onImageLoad.bind(this);
    this.registerTool = this.registerTool.bind(this);
    this.setSelectedTool = this.setSelectedTool.bind(this);
    this.getTool = this.getTool.bind(this);
    this.tools = {};
    this.setSelectedGroup = this.setSelectedGroup.bind(this);
    this.getSelectedGroup = this.getSelectedGroup.bind(this);
  }

  setSelectedGroup(idx) {
    this.setState({ selectedGroup: idx });
  }

  getSelectedGroup() {
    return this.state.selectedGroup;
  }

  getTool() {
    return this.state.selectedTool;
  }

  componentDidMount() {
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
    //console.log("rerender", this.props.size)
    return (
      <>
        <GroupDropdown
          setSelected={this.setSelectedGroup}
          selectedGroup={this.state.selectedGroup}
        />
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
                    pen={this.getTool}
                    getSelectedGroup={this.getSelectedGroup}
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
      </>
    );
  }
}

export default ContextImage;
