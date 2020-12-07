import React, { Component } from "react";
import "./App.css";
import ContextImage from "./ContextImage";
import BarChart from "./BarChart";
import Cluster from "./Cluster";
import { range } from "d3-array";
import { scaleOrdinal } from "d3-scale";
import { schemeTableau10 } from "d3-scale-chromatic";
import { geoCentroid } from "d3-geo";
import CardLayout from "./CardLayout";
import { Row, Col, Box } from "jsxstyle";
import data from "./kingscourt_irregular";
import { UIColors } from "./colors";

const datagroups = {};

const colorScale = scaleOrdinal(schemeTableau10).domain(
  range(datagroups.length + 1)
);

var resizeTimeout;
const resize = function (onResize) {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(onResize, 100);
};

class App extends Component {
  constructor(props) {
    super(props);
    this.onResize = this.onResize.bind(this);
    this.onBrush = this.onBrush.bind(this);
    this.changeDataGroups = this.changeDataGroups.bind(this);
    this.changeHoverPoint = this.changeHoverPoint.bind(this);
    this.state = {
      screenWidth: 1000,
      screenHeight: 500,
      hover: 0,
      brushExtent: [0, 40],
      dataGroups: datagroups,
      hoverPoint: null,
    };
  }

  changeDataGroups(data) {
    console.log("changing data groups to ", data);
    this.setState({ dataGroups: data });
  }

  changeHoverPoint(pt) {
    if (pt != this.state.hoverPoint) {
      this.setState({ hoverPoint: pt });
    }
  }

  onResize() {
    console.log("resize event", window.innerWidth);
    this.setState({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
    });
  }

  //when component mounts, start listening for resizing so we can update project sizes
  componentDidMount() {
    this.onResize();
    window.addEventListener("resize", () => resize(this.onResize));
  }
  //when component unmounts, stop listening
  componentWillUnmount() {
    window.removeEventListener("resize", () => resize(this.onResize));
  }

  onBrush(d) {
    this.setState({ brushExtent: d });
  }

  render() {
    return (
      <Col className="App" width="100%" height="100%" position="relative">
        <Col
          backgroundColor={UIColors.background}
          width="100%"
          height="100%"
          justifyContent="space-evenly"
        >
          <Row justifyContent="space-evenly">
            <CardLayout
              title="Context Image"
              hoverElement={this.state.hover}
              onHover={this.onHover}
              colorScale={colorScale}
              data={data}
              dataGroups={this.state.dataGroups}
              changeDataGroups={this.changeDataGroups}
              hoverPoint={this.state.hoverPoint}
              changeHoverPoint={this.changeHoverPoint}
              size={[
                (this.state.screenWidth * 1) / 3 - 10,
                (this.state.screenHeight * 2) / 3 - 10,
              ]}
            >
              <ContextImage />
            </CardLayout>
            <CardLayout
              title="Comparison Sandbox"
              hoverElement={this.state.hover}
              onHover={this.onHover}
              colorScale={colorScale}
              data={data}
              dataGroups={this.state.dataGroups}
              changeHoverPoint={this.changeHoverPoint}
              hoverPoint={this.state.hoverPoint}
              size={[
                (this.state.screenWidth * 2) / 3 - 10,
                (this.state.screenHeight * 2) / 3 - 10,
              ]}
            >
              <BarChart />
            </CardLayout>
          </Row>
          <Row justifyContent="space-evenly">
            <CardLayout
              title="Clustering"
              size={[
                (this.state.screenWidth * 1) / 3 - 10,
                (this.state.screenHeight * 1) / 3 - 10,
              ]}
            >
              <Cluster />
            </CardLayout>
            <CardLayout
              title="Parallel coordinates"
              size={[
                (this.state.screenWidth * 2) / 3 - 10,
                (this.state.screenHeight * 1) / 3 - 10,
              ]}
            >
              <Cluster />
            </CardLayout>
          </Row>
        </Col>
      </Col>
    );
  }
}

export default App;
