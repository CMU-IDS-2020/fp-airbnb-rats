import React, { Component } from 'react'
import './App.css'
import { scaleBand, scaleLinear } from 'd3-scale'
import { range, extent } from 'd3-array'

class BarChart extends Component {
  constructor(props){
    super(props)
    this.createBarChart = this.createBarChart.bind(this)
  }

  componentDidMount() {
    this.createBarChart()
  }

  componentDidUpdate() {
    this.createBarChart()
  }

  createBarChart() {
    const node = this.node
  }

  render() {

      const keys = Object.keys(this.props.data[0]).slice(3);

      const selected = this.props.dataGroups
	    .map(d => d.map(p => this.props.data[p]))
	    .map(d => d.reduce((a,b) => {
		const o = {};
		keys.forEach(k => {
		    o[k] = a[k] + b[k];
		});
		return o;
	    }));

      const hx = scaleBand()
	    .domain(keys)
	    .range([0, this.props.size[0]])
	    .padding(0.1);

      const hy = scaleBand()
	    .domain(range(selected.length))
	    .range([this.props.size[1], 0])
	    .padding(0.25);

      const mh = hy.bandwidth();
      const ry = new Map(keys.map(k => [
	  k, scaleLinear()
	      .domain(extent(this.props.data, d => d[k]))
	      .range([mh, 0])
      ]));

      const labels = keys.map((k, i) =>
	  <text x={hx(k) + hx.bandwidth()/2}
		y={10}
		fill="white"
		key={"histogram" + i}
		style={{textAnchor: "middle", fontSize: "8px"}}
		fontFamily="sans-serif">{k.split('_')[0]}</text>
      );

      
      const boxes = selected.map((d,i) => {
	  const hdata = Object.keys(d)
		.slice(3).map(x => {
		    const o = {};
		    o.x = hx(x);
		    o.label = x;
		    o.value = d[x];
		    o.w = hx.bandwidth();
		    o.h = ry.get(x)(d[x]);
		    return o;
		});

	  const bars = hdata.map((d,j) =>
	      <rect x={d.x}
		    y={mh-d.h}
		    width={d.w}
		    height={d.h}
		    key={`histbox-${i}-${j}`} />
	  );

	  return <g transform={`translate(0, ${hy(i)})`}
		    fill={this.props.colorScale(i)}
		    opacity={this.props.hoverPoint != null ? 1.0 : 0.25}
		    key={`hist-${i}`}>{bars}</g>
      });

    return <svg ref={node => this.node = node} width={this.props.size[0]} height={this.props.size[1]}>
	{labels}
	{boxes}
    </svg>
  }
}

export default BarChart
