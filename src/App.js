import React, { Component } from 'react'
import './App.css'
import ContextImage from './ContextImage'
import BarChart from './BarChart'
import Cluster from './Cluster'
import worlddata from './world'
import { range } from 'd3-array'
import { scaleOrdinal } from 'd3-scale'
import { schemeTableau10 } from 'd3-scale-chromatic'
import { geoCentroid } from 'd3-geo'
import CardLayout from './CardLayout'
import {Row, Col, Box} from 'jsxstyle'
import data from './kingscourt_irregular'
import {UIColors} from './colors'

const appdata = worlddata.features
  .filter(d => geoCentroid(d)[0] < -20)

appdata
  .forEach((d,i) => {
    const offset = Math.random()
    d.launchday = i
    d.data = range(30).map((p,q) => q < i ? 0 : Math.random() * 2 + offset)
  })

const datagroups = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 
        [32, 33, 34, 35, 36, 37, 38, 39, 40], 
        [120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133],
        [200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213],
        [300, 301, 302, 303, 304, 305, 306, 307],
        [1000, 1001, 1002, 1003, 1004]
    ]


const colorScale = scaleOrdinal(schemeTableau10)
      .domain(range(datagroups.length+1))

var resizeTimeout;
const resize = function(onResize){
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(onResize, 100);
};

class App extends Component {
  constructor(props){
    super(props)
    this.onResize = this.onResize.bind(this)
    this.onHover = this.onHover.bind(this)
    this.onBrush = this.onBrush.bind(this)
    this.changeDataGroups = this.changeDataGroups.bind(this)
    this.state = { 
      screenWidth: 1000, 
      screenHeight: 500, 
      hover: 0, 
      brushExtent: [0,40], 
      dataGroups: datagroups
    }
  }

  changeDataGroups(data){
    this.setState({dataGroups: data})
  }

  onResize() {
      console.log("resize event", window.innerWidth)
      this.setState({ screenWidth: window.innerWidth, screenHeight: window.innerHeight })
  }

  //when component mounts, start listening for resizing so we can update project sizes
  componentDidMount() {
      this.onResize();
      window.addEventListener('resize', () => resize(this.onResize));
  }
  //when component unmounts, stop listening
  componentWillUnmount() {
      window.removeEventListener('resize', () => resize(this.onResize));
  }

  onHover(d) {
    this.setState({ hover: d.id })
  }

  onBrush(d) {
    this.setState({ brushExtent: d })
  }

  render() {
    const filteredAppdata = appdata
      .filter((d,i) => d.launchday >= this.state.brushExtent[0] && d.launchday <= this.state.brushExtent[1])
    return (
      <Col className="App"
        width="100%"
        height="100%"
        position="relative"
      >
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
            size={[this.state.screenWidth * 1/3 - 10, this.state.screenHeight  * 2/3 - 10]}>
            <ContextImage />
          </CardLayout>
          <CardLayout 
            title="Comparison Sandbox"
            hoverElement={this.state.hover} 
            onHover={this.onHover} 
            colorScale={colorScale} 
            data={data} 
            dataGroups={this.state.dataGroups}
            size={[this.state.screenWidth * 2/3 - 10, this.state.screenHeight * 2/3 - 10]}>
            <BarChart/>
          </CardLayout>
        </Row>
        <Row justifyContent="space-evenly">
          <CardLayout 
            title="Clustering"
            size={[this.state.screenWidth * 1/3 - 10, this.state.screenHeight * 1/3 - 10]}>
            <Cluster/>
          </CardLayout>
          <CardLayout 
            title="Placeholder 1"
            size={[this.state.screenWidth * 1/3 - 10, this.state.screenHeight * 1/3 - 10]}>
            <Cluster/>
          </CardLayout>
          <CardLayout 
            title="Placeholder 2"
            size={[this.state.screenWidth * 1/3 - 10, this.state.screenHeight * 1/3 - 10]}>
            <Cluster/>
          </CardLayout>
          </Row>
        </Col>
      </Col>
    )
  }
}

export default App
