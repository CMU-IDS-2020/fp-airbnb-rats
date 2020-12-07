import React, { Component } from "react";
import "./App.css";
import { Box } from "jsxstyle";

class Cluster extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    }
    this.sendToApp = this.sendToApp.bind(this);
    this.sendToBackend = this.sendToBackend.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  sendToApp(){
    const yourGroups = {0: [0, 1, 2, 3, 4, 5], 1: [6, 7, 8, 9]}
    this.props.changeDataGroups(yourGroups)
  }

  sendToBackend(){
    alert("The state contains " + this.state.value)
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  render() {
    return (<div>
      <input type="text" 
        onChange={this.handleChange} 
        value={this.state.value}
      />
      <button onClick={this.sendToBackend}>Send to backend</button>
      <button onClick={this.sendToApp}>Send to app</button>
    </div>);
  }
}

export default Cluster;
