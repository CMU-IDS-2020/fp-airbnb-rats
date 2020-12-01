import React, { Component } from 'react'
import './App.css'
import {Box} from 'jsxstyle'

class Cluster extends Component {
  constructor(props){
    super(props)
    this.createCluster = this.createCluster.bind(this)
  }

  componentDidMount() {
    this.createCluster()
  }

  componentDidUpdate() {
    this.createCluster()
  }

  createCluster() {
    const node = this.node
  }

  render() {
    return (<Box color="white">I am the clustering frontend.</Box>);
  }
}

export default Cluster
