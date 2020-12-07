import React, { Component } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Box, Inline } from "jsxstyle";
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
import ZoomPan from './assets/zoompan.png'
import ZoomPanIcon from './assets/zoompanicon.png'
import LassoIcon from './assets/lassoicon.png'
import ZoomPanSelected from './assets/zoompan_selected.png'
import LassoIconSelected from './assets/lasso_selected.png'
import EyeIcon from './assets/eyeicon.png'
import EyeIconSelected from './assets/eyeicon_selected.png'

const imgMappings = {
  "zoom" : [ZoomPanIcon, ZoomPanSelected, "move"],
  "pen" : [LassoIcon, LassoIconSelected, "auto"],
  "eye" : [EyeIcon, EyeIconSelected, "crosshair"]
}

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
    this.menuTools;
    this.dropdown = (
      <GroupDropdown
        setSelected={this.setSelectedGroup}
        selectedGroup={this.state.selectedGroup}
      />
    );
  }

  setSelectedGroup(idx) {
    this.setState({ selectedGroup: idx });
    this.dropdown = (
      <GroupDropdown setSelected={this.setSelectedGroup} selectedGroup={idx} />
    );
    let mt = [...this.menuTools];
    mt.push(this.dropdown);
    console.log("setting selected group", mt, idx);
    this.props.setMenuTools(mt);
  }

  getSelectedGroup() {
    return this.state.selectedGroup;
  }

  getTool() {
    return this.state.selectedTool;
  }

  componentDidMount() {
    this.registerTool("zoom", { on: () => {}, off: () => {} });
    this.registerTool("eye", { on: () => {}, off: () => {} });
    this.setSelectedTool("zoom");
  }

  updateToolWithMenu(tool){
    this.menuTools = Object.keys(this.tools).map((t) => (
      <Inline
        marginLeft="8px"
        key={t}
        hoverCursor="pointer"
        props={{
          onClick: () => {
            this.setSelectedTool(t);
          },
        }}
      >
        <Box 
          component="img" 
          props={{src:imgMappings[t][tool == t ? 1 : 0]}} height="26px"/>
      </Inline>
    ));
    let mt = [...this.menuTools];
    mt.push(this.dropdown);
    console.log(mt);
    this.props.setMenuTools(mt);
  }

  registerTool(toolName, toolFuncs) {
    this.tools[toolName] = toolFuncs;
    this.updateToolWithMenu(this.state.selectedTool);
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
    this.updateToolWithMenu(tool)
  }

  onImageLoad(t) {
    this.setState({
      imgLoaded: true,
      imgSize: [t.target.offsetWidth, t.target.offsetHeight],
    });
  }

  render() {
    let cursor = imgMappings[this.state.selectedTool]
    if(cursor != null){
      cursor = cursor[2]
    }
    return (
      <>
        <TransformWrapper
          options={{ disabled: !(this.state.selectedTool == "zoom") }}
        >
          <TransformComponent>
            <Box position="relative"
              hoverCursor={cursor}>
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
                    hoverPoint={this.props.hoverPoint}
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
