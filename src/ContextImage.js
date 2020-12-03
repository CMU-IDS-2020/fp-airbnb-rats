import React, { Component } from 'react'
import { scaleLinear } from 'd3-scale'
import { extent } from 'd3-array'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {Box, Row, Inline} from 'jsxstyle'
import './App.css'
import contextImg from './data/kingscourt_ir/kingscourt_ir_context_image.jpg'

const beamparams = [45,100,-45,400]
const imgparams = [628, 520]

class Coords extends Component {

  render() {
	
	const padding = 0;
	
	const data = this.props.data

	const dataX = data.map((d) => d.X * beamparams[0] + beamparams[1])
	const dataY = data.map((d) => d.Y * beamparams[2] + beamparams[3])
	const minimumX = Math.min(...dataX) 
	const minimumY = Math.min(...dataY)  
	const maximumX = Math.max(...dataX)
	const maximumY = Math.max(...dataY)

	const expansion = 0.04
	const rangeX = (maximumX - minimumX) * (1 + expansion)
	const rangeY = (maximumY - minimumY) * (1 + expansion)
	const offsetX = (maximumX - minimumX) * (-1 * expansion/2)
	const offsetY = (maximumY - minimumY) * (-1 * expansion/2)
	

	let data1, data2;
	if(this.props.data.length > 3000){
		data1 = this.props.data.slice(0, 3000);
		data2 = this.props.data.slice(3000);
	} else {
		data1 = this.props.data;
	}
	
      const pts1 = data1.map((d,i) =>
	  <circle cx={d.X * beamparams[0] + beamparams[1]}
		  cy={d.Y * beamparams[2] + beamparams[3]}
		  r={1}
		  fill={this.props.colorScale((i + Math.floor(Math.random()*50))%5)}
		  key={`circle-${i}`} />
	  )

	  const pts2 = data2.map((d,i) =>
	  <circle cx={d.X * beamparams[0] + beamparams[1]}
		  cy={d.Y * beamparams[2] + beamparams[3]}
		  r={1}
		  fill={this.props.colorScale((i + Math.floor(Math.random()*50))%5)}
		  key={`circle-${i}`} />
	  )

    return (
	<svg width={this.props.size[0]} height={this.props.size[1]}>
		 <rect 
			 x={minimumX + offsetX} 
			 y={minimumY + offsetY} 
			 width={rangeX} 
			 height={rangeY} 
			 rx="10" 
			 stroke="#4499FF" 
			 fill="none"
		/>
	    <g transform={`translate(${padding}, ${padding})`}>
		{pts1}
	    </g>
		<g transform={`translate(${padding}, ${padding})`}>
		{pts2}
	    </g>
	</svg>)
  }
}

class ContextImage extends Component {

	constructor(props){
		super(props)
		this.state = {
			imgLoaded: false,
			imgSize: [0, 0],
			scale: 0.1,
			offset: [0, 0]
		}
		this.onImageLoad = this.onImageLoad.bind(this)

		const menuToolButtonMappings = {"pen": () => console.log("I am pen"), "zoom": () => console.log("I am zoom")}

		const menuTools = (
			<Row>{
				Object.keys(menuToolButtonMappings).map(
					item => 
					<Inline marginLeft="8px" key={item} props={{onClick:menuToolButtonMappings[item]}}>{item}</Inline>
					)}
			</Row>)
		props.setMenuTools(menuTools)
	}

	onImageLoad(t){
		this.setState({imgLoaded: true, imgSize: [t.target.offsetWidth, t.target.offsetHeight]})
	}

	render() {
		return (
		<TransformWrapper>
        	<TransformComponent>
			<Box 
				position="relative" 
			>
				<Box 
					zIndex={1} 
					width={this.props.size[0]}
					height={this.props.size[1]}
					position="absolute"
					top="0px"
					left="0px"
				>
					{this.state.imgLoaded ? 
					(<Coords 
						data={this.props.data} 
						size={this.state.imgSize} 
						colorScale={this.props.colorScale}
					/>) : "Loading image..."
					}
				</Box>
				<Box 
					zIndex={0} 
					component="img" 
					width={imgparams[0]}
					height={imgparams[1]}
					filter= "grayscale(80%) brightness(60%)"
					props={{
						src:contextImg,
						onLoad: this.onImageLoad
					}} 
				/>
			</Box>
			</TransformComponent>
		</TransformWrapper>
		)
	}
}

export default ContextImage
