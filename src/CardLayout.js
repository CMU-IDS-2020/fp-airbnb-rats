import React, { Component } from 'react'
import {Col, Box, Row} from 'jsxstyle'
import {UIColors} from './colors'

export default class CardLayout extends Component {
    constructor(props){
        super(props)
        this.children = props.children;
    }

    render(){
        let newprops = {...this.props}
        const wid = this.props.size[0]
        const hei = this.props.size[0]
        newprops.size[0] = this.props.size[0] - 30;
        newprops.size[1] = this.props.size[1] - 40;
        return (
        <Col
            borderRadius="12px"
            overflow="hidden"
            backgroundColor={UIColors.cardBg} 
        >
            <Row color={UIColors.text} 
            backgroundColor={UIColors.header} 
            width={wid}
            height={40}
            justifyContent="flex-start"
            alignItems="center"
            textTransform="uppercase"
            fontWeight="600"
            paddingLeft="12px"
            >
                {this.props.title}
            </Row>
            <Row             
            width={wid}
            height={this.props.size[1]}
            justifyContent="center"
            alignItems="center"
            >
                {React.cloneElement(this.props.children, { ...newprops })}
            </Row>
        </Col>
        );
    }

}