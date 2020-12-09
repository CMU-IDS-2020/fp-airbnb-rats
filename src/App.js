import React, { Component } from "react";
import "./App.css";
import ContextImage from "./ContextImage";
import BarChart from "./BarChart";
import ParallelCoordinates from "./ParallelCoordinates";
import Cluster from "./Cluster";
import { scaleOrdinal } from "d3-scale";
import { schemeTableau10 } from "d3-scale-chromatic";
import { range, extent, mean, deviation, quantile } from "d3-array";
import { geoCentroid } from "d3-geo";
import CardLayout from "./CardLayout";
import { Row, Col, Box } from "jsxstyle";
import data from "./kingscourt_irregular";
import { UIColors } from "./colors";
import HiddenElementDropdown from "./HiddenElementDropdown";
import SortElementDropdown from "./SortElementDropdown";

const datagroups = { 0: [] };

const sortingFunctions = {
  "mean-h-l": "Mean: High to Low",
  "mean-l-h": "Mean: Low to high",
  "variance-h-l": "Std Dev / Mean: High to Low",
  "variance-l-h": "Std Dev / Mean: Low to High",
};

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
    this.changeKeys = this.changeKeys.bind(this);
    this.changeDataGroups = this.changeDataGroups.bind(this);
    this.changeHoverPoint = this.changeHoverPoint.bind(this);
    this.calculateBulkAverages = this.calculateBulkAverages.bind(this);
    this.calculateAveragesOfAllGroups = this.calculateAveragesOfAllGroups.bind(
      this
    );
    this.hideKey = this.hideKey.bind(this);
    this.setBack = this.setBack.bind(this);
    this.setSortingFunction = this.setSortingFunction.bind(this);

    this.state = {
      screenWidth: 1000,
      screenHeight: 500,
      brushExtent: [0, 40],
      dataGroups: datagroups,
      hoverPoint: null,
      keys: Object.keys(data[0]).slice(3),
      removedKeys: [],
      sortingFunctionIdx: 0,
    };

    this.bulkAverages = this.calculateBulkAverages();
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
  }

  reorderKeys(sortingFunctionIdx) {
    const sortingData = this.calculateAveragesOfAllGroups();
    if (sortingData == null) return;
    let compareFunction;
    const sortMode = Object.keys(sortingFunctions)[sortingFunctionIdx];
    switch (sortMode) {
      case "variance-h-l":
        compareFunction = (a, b) => {
          if (a[2] > b[2]) {
            return -1;
          } else if (a[2] < b[2]) {
            return 1;
          }
          return 0;
        };
        break;
      case "variance-l-h":
        compareFunction = (a, b) => {
          if (a[2] > b[2]) {
            return 1;
          } else if (a[2] < b[2]) {
            return -1;
          }
          return 0;
        };
        break;
      case "mean-h-l":
        compareFunction = (a, b) => {
          if (a[1] > b[1]) {
            return -1;
          } else if (a[1] < b[1]) {
            return 1;
          }
          return 0;
        };
        break;
      case "mean-l-h":
        compareFunction = (a, b) => {
          if (a[1] > b[1]) {
            return 1;
          } else if (a[1] < b[1]) {
            return -1;
          }
          return 0;
        };
        break;
    }
    const sortedKeys = sortingData.sort(compareFunction);
    return sortedKeys.map((key) => key[0]);
  }

  changeKeys(keys) {
    this.setState({ keys: keys });
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
    this.setSortingFunction(this.state.sortingFunctionIdx);
  }

  setSortingFunction(idx) {
    this.setState({ sortingFunctionIdx: idx, keys: this.reorderKeys(idx) });
  }

  calculateBulkAverages() {
    let bulkAverages = this.state.keys
      .map((key) => [key, data.map((datapoint) => datapoint[key])])
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
      ]);
    bulkAverages = Object.fromEntries(bulkAverages);
    bulkAverages["color"] = "#AAAAAA";
    return bulkAverages;
  }

  calculateAveragesOfAllGroups() {
    const points = Object.values(this.state.dataGroups).flat();
    if (points.length == 0) {
      let bulkAvgKeysNoColor = Object.keys(this.bulkAverages).filter(
        (k) => k != "color"
      );
      return bulkAvgKeysNoColor.map((key) => [
        key,
        this.bulkAverages[key][0],
        this.bulkAverages[key][1] / this.bulkAverages[key][0],
      ]);
    }

    let trueData = points.map((cluster) => {
      return data[cluster];
    });
    const mapped = this.state.keys
      .map((key) => [key, trueData.map((datapoint) => datapoint[key])])
      .map((k) => [k[0], mean(k[1]), deviation(k[1]) / mean(k[1])]);
    return mapped;
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
    this.setSortingFunction(this.state.sortingFunctionIdx);
  }
  //when component unmounts, stop listening
  componentWillUnmount() {
    window.removeEventListener("resize", () => resize(this.onResize));
  }

  onBrush(d) {
    this.setState({ brushExtent: d });
  }

  render() {
    const barMenuComponents = (
      <Row>
        <HiddenElementDropdown
          setBack={this.setBack}
          listItems={this.state.removedKeys}
        />
        <SortElementDropdown
          listItems={Object.values(sortingFunctions)}
          selectedIdx={this.state.sortingFunctionIdx}
          setSelected={this.setSortingFunction}
        />
      </Row>
    );

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
              data={data}
              dataGroups={this.state.dataGroups}
              changeDataGroups={this.changeDataGroups}
              hoverPoint={this.state.hoverPoint}
              changeHoverPoint={this.changeHoverPoint}
              size={[
                (this.state.screenWidth * 1) / 3 - 10,
                (this.state.screenHeight * 3) / 5 - 10,
              ]}
            >
              <ContextImage />
            </CardLayout>
            <CardLayout
              title="Comparison Sandbox"
              data={data}
              dataGroups={this.state.dataGroups}
              changeHoverPoint={this.changeHoverPoint}
              hoverPoint={this.state.hoverPoint}
              changeKeys={this.changeKeys}
              size={[
                (this.state.screenWidth * 2) / 3 - 10,
                (this.state.screenHeight * 3) / 5 - 10,
              ]}
              keys={this.state.keys}
              removedKeys={this.state.removedKeys}
              bulkAverages={this.bulkAverages}
              setBack={this.setBack}
              hideKey={this.hideKey}
              menuComponents={barMenuComponents}
            >
              <BarChart />
            </CardLayout>
          </Row>
          <Row justifyContent="space-evenly">
            <CardLayout
              title="Clustering"
              changeDataGroups={this.changeDataGroups}
              size={[
                (this.state.screenWidth * 1) / 3 - 10,
                (this.state.screenHeight * 2) / 5 - 10,
              ]}
            >
              <Cluster />
            </CardLayout>
            <CardLayout
              title="Parallel coordinates"
              size={[
                (this.state.screenWidth * 2) / 3 - 10,
                (this.state.screenHeight * 2) / 5 - 10,
              ]}
              data={data}
              keys={this.state.keys}
              dataGroups={this.state.dataGroups}
              bulkAverages={this.bulkAverages}
            >
              <ParallelCoordinates />
            </CardLayout>
          </Row>
        </Col>
      </Col>
    );
  }
}

export default App;
