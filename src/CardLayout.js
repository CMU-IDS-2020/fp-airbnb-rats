import React, { Component } from 'react'
import {Col, Box} from 'jsxstyle'

export default class CardLayout extends Component {
    constructor(props){
        super(props)
        this.children = props.children;
    }

    render(){
        return (
        <Col 
            backgroundColor="#444"
            width={this.props.size[0]}
            height={this.props.size[1]}
            overflow="scroll"
        >
            <Box color="white" backgroundColor="grey">{this.props.title}</Box>
            <div>
                {React.cloneElement(this.props.children, { ...this.props })}
            </div>
        </Col>
        );
    }

}