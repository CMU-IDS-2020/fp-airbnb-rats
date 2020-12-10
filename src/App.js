import React, { Component } from "react";
import "./App.css";
import ContextImage from "./ContextImage";
import BarChart from "./BarChart";
import ParallelCoordinates from "./ParallelCoordinates";
import Cluster from "./Cluster";
import { scaleOrdinal } from "d3-scale";
import { schemeTableau10, schemePaired } from "d3-scale-chromatic";
import { range, extent, mean, deviation, quantile } from "d3-array";
import { geoCentroid } from "d3-geo";
import CardLayout from "./CardLayout";
import { Row, Col, Box } from "jsxstyle";
import data from "./kingscourt_irregular";
import { UIColors } from "./colors";
import HiddenElementDropdown from "./HiddenElementDropdown";
import SortElementDropdown from "./SortElementDropdown";
import Toggle from "./Toggle";

const datagroups = { 0: [] };
const datagroupsMetadata = { 0: { annotation: "", locked: false } };

const colSchemes = [...schemeTableau10, ...schemePaired];

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
    this.keydown = this.keydown.bind(this);
    this.keyup = this.keyup.bind(this);
    this.shiftDownGetter = this.shiftDownGetter.bind(this);
    this.changeKeys = this.changeKeys.bind(this);
    this.changeDataGroups = this.changeDataGroups.bind(this);
    this.changeMetadata = this.changeMetadata.bind(this);
    this.changeHoverPoint = this.changeHoverPoint.bind(this);
    this.calculateBulkAverages = this.calculateBulkAverages.bind(this);
    this.calculateAveragesOfAllGroups = this.calculateAveragesOfAllGroups.bind(
      this
    );
    this.hideKey = this.hideKey.bind(this);
    this.onToggle = this.onToggle.bind(this);
    this.setBack = this.setBack.bind(this);
    this.setSortingFunction = this.setSortingFunction.bind(this);
    this.toggleLock = this.toggleLock.bind(this);
    this.setAnnotation = this.setAnnotation.bind(this);

    this.getMetadata = this.getMetadata.bind(this);

    this.state = {
      screenWidth: 1000,
      screenHeight: 500,
      brushExtent: [0, 40],
      dataGroups: datagroups,
      metadata: datagroupsMetadata,
      hoverPoint: null,
      keys: Object.keys(data[0]).slice(3),
      removedKeys: [],
      sortingFunctionIdx: 0,
      scaleMode: "log",
      shiftDown: false,
    };

    this.bulkAverages = this.calculateBulkAverages();
  }

  toggleLock(idx) {
    this.state.metadata[idx]["locked"] = !this.state.metadata[idx]["locked"];
    this.changeMetadata(this.state.metadata);
  }

  setAnnotation(idx, a) {
    this.state.metadata[idx]["annotation"] = a;
    this.changeMetadata(this.state.metadata);
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

  getMetadata() {
    return this.state.metadata;
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
    //console.log("changing data groups to ", data);
    Object.keys(data).forEach((key) => {
      if (this.state.metadata[key] == null) {
        this.state.metadata[key] = { annotation: "", locked: false };
      }
    });
    //console.log("metadata changed to", this.state.metadata)
    this.setState({ dataGroups: data, metadata: this.state.metadata });
  }

  changeMetadata(mData) {
    this.setState({ metadata: mData });
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

  keydown(e) {
    console.log(e.key);
    if (e.key === "Shift") {
      this.setState({ shiftDown: true });
    }
  }

  keyup(e) {
    console.log(e.key);
    if (e.key === "Shift") {
      this.setState({ shiftDown: false });
    }
  }
  //when component mounts, start listening for resizing so we can update project sizes
  componentDidMount() {
    this.onResize();
    window.addEventListener("resize", () => resize(this.onResize));
    window.addEventListener("keydown", this.keydown);
    window.addEventListener("keyup", this.keyup);
    this.setSortingFunction(this.state.sortingFunctionIdx);
  }
  //when component unmounts, stop listening
  componentWillUnmount() {
    window.removeEventListener("resize", () => resize(this.onResize));
    window.removeEventListener("keydown", this.keydown);
    window.removeEventListener("keyup", this.keyup);
  }

  onBrush(d) {
    this.setState({ brushExtent: d });
  }

  onToggle(t) {
    if (t) {
      this.setState({ scaleMode: "log" });
    } else {
      this.setState({ scaleMode: "linear" });
    }
  }
  shiftDownGetter() {
    return this.state.shiftDown;
  }

  render() {
    const barMenuComponents = (
      <Row>
        <Toggle
          toggle={this.state.scaleMode === "log"}
          setToggle={this.onToggle}
        />
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
              shiftDownGetter={this.shiftDownGetter}
              size={[
                (this.state.screenWidth * 1) / 3 - 10,
                (this.state.screenHeight * 3) / 5 - 10,
              ]}
              metadata={this.state.metadata}
              getMetadata={this.getMetadata}
              setMetadata={this.changeMetadata}
              toggleLock={this.toggleLock}
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
              scaleMode={this.state.scaleMode}
              metadata={this.state.metadata}
              setMetadata={this.changeMetadata}
              toggleLock={this.toggleLock}
              setAnnotation={this.setAnnotation}
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
