import React, { Component } from 'react'
import { scaleLinear } from 'd3-scale'
import { extent } from 'd3-array'
import './App.css'

class WorldMap extends Component {
  render() {
    const padding = 10;
    const x = scaleLinear()
	.domain(extent(this.props.data, d => +d.X))
	  .range([0, this.props.size[0] - 2 * padding])
      
    const y = scaleLinear()
	.domain(extent(this.props.data, d => +d.Y))
	.range([this.props.size[1] - 2 * padding, 0])

      const pts = this.props.data.map((d,i) =>
	  <circle cx={x(d.X)}
		  cy={y(d.Y)}
		  r={1}
		  fill={this.props.colorScale((i + Math.floor(Math.random()*50))%5)}
		  key={`circle-${i}`} />
      )

    return <svg width={this.props.size[0]} height={this.props.size[1]}>
	    <g transform={`translate(${padding}, ${padding})`}>
		{pts}
	    </g>
    </svg>
  }
}

export default WorldMap
