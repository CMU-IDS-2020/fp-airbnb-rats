import React, { Component } from "react";
import "./App.css";
import { Box, Row, Col, Inline } from "jsxstyle";
import { UIColors } from "./colors";

function SortDropdownItem(props) {
  return (
    <Row
      justifyContent="center"
      alignItems="center"
      cursor="pointer"
      width="100%"
      borderRadius={props.selected ? "12px 12px 0px 0px" : "0px"}
      backgroundColor={
        props.selected ? "black" : props.isHover ? "grey" : UIColors.header
      }
      padding="4px"
      fontSize="12px"
      borderBottom={!props.selected ? "1px solid rgba(255, 255, 255, 0.2)" : ""}
      cursor={"pointer"}
      props={
        props.selected
          ? {}
          : {
              onClick: () => props.setSelected(props.idx),
              onMouseEnter: () => props.setHoverElement(props.idx),
              onMouseLeave: () => props.setHoverElement(-1),
            }
      }
    >
      <Row
        justifyContent="space-between"
        width="100%"
        alignItems="center"
        props={{ onClick: props.selected ? () => props.toggleIsOpen() : null }}
      >
        {props.listItem}
        {props.selected ? (
          <Col
            hoverCursor="pointer"
            justifyContent="center"
            marginLeft="8px"
            height="20px"
            width="20px"
          >
            {props.isOpen ? "▾" : "◂"}
          </Col>
        ) : (
          ""
        )}
      </Row>
    </Row>
  );
}

class SortElementDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: false,
      hoverIdx: -1,
    };

    this.toggleIsOpen = this.toggleIsOpen.bind(this);
    this.setHoverElement = this.setHoverElement.bind(this);
  }

  toggleIsOpen() {
    this.setState({ dropdownOpen: !this.state.dropdownOpen });
  }

  setHoverElement(idx) {
    this.setState({ hoverIdx: idx });
  }

  render() {
    return (
      <Box
        width="200px"
        marginLeft="12px"
        textTransform="none"
        fontWeight="600"
        position="relative"
        userSelect="none"
        props={{
          onMouseEnter: () => this.setState({ dropdownOpen: true }),
          onMouseLeave: () => this.setState({ dropdownOpen: false }),
        }}
      >
        <Box
          color={UIColors.text}
          fontSize="12px"
          backgroundColor={UIColors.cardBg}
        >
          <SortDropdownItem
            key="selected"
            listItem={this.props.listItems[this.props.selectedIdx]}
            idx={this.props.selectedIdx}
            selected={true}
            toggleIsOpen={this.toggleIsOpen}
            setHoverElement={this.setHoverElement}
            isOpen={this.state.dropdownOpen}
            isHover={false}
          />
        </Box>
        {this.state.dropdownOpen ? (
          <Col
            position="absolute"
            top="100%"
            left="0px"
            width="100%"
            background={UIColors.header}
            hoverCursor="pointer"
            color={UIColors.text}
          >
            {this.props.listItems.map((li, idx) =>
              idx != this.props.selectedIdx ? (
                <SortDropdownItem
                  key={li}
                  listItem={li}
                  idx={idx}
                  selected={false}
                  setSelected={this.props.setSelected}
                  toggleIsOpen={this.toggleIsOpen}
                  setHoverElement={this.setHoverElement}
                  isOpen={this.state.dropdownOpen}
                  isHover={this.state.hoverIdx == idx}
                />
              ) : (
                ""
              )
            )}
          </Col>
        ) : (
          ""
        )}
      </Box>
    );
  }
}

export default SortElementDropdown;
