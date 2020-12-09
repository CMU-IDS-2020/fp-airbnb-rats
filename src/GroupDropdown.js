import React, { Component } from "react";
import "./App.css";
import { UIColors } from "./colors";
import { Box, Col, Row, Inline } from "jsxstyle";
import { schemeTableau10 } from "d3-scale-chromatic";

function DropdownItem(props) {
  return (
    <Row
      justifyContent="space-between"
      alignItems="center"
      cursor="pointer"
      width="100%"
      height="26px"
      backgroundColor={
        props.selected
          ? UIColors.cardBg
          : props.isHover
          ? "grey"
          : UIColors.header
      }
      paddingLeft="4px"
      paddingRight="4px"
      borderBottom={!props.selected ? "1px solid rgba(255, 255, 255, 0.2)" : ""}
      cursor={"pointer"}
      props={
        props.selected
          ? {}
          : {
              onClick: () => props.setSelected(props.listItem),
              onMouseEnter: () => props.setHoverElement(props.listItem),
              onMouseLeave: () => props.setHoverElement(-1),
            }
      }
    >
      <Row alignItems="center">
        <Box
          backgroundColor={schemeTableau10[props.listItem]}
          borderRadius="10px"
          width="10px"
          height="10px"
        />
        <Box marginLeft="6px">{"Component " + props.idx}</Box>
      </Row>
      <Box>
        {props.selected ? (
          <Inline marginLeft="8px">{props.isOpen ? "▾" : "◂"}</Inline>
        ) : (
          ""
        )}
      </Box>
    </Row>
  );
}

class GroupDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: false,
      hoverIdx: -1,
    };
    this.toggleIsOpen = this.toggleIsOpen.bind(this);
    this.setIsOpen = this.setIsOpen.bind(this);
    this.setHoverElement = this.setHoverElement.bind(this);
  }

  toggleIsOpen() {
    this.setState({ dropdownOpen: !this.state.dropdownOpen });
  }

  setIsOpen(open) {
    this.setState({ dropdownOpen: open });
  }

  setHoverElement(idx) {
    this.setState({ hoverIdx: idx });
  }

  render() {
    return (
      <Row
        position="relative"
        width="130px"
        marginLeft="8px"
        fontSize="12px"
        height="26px"
        props={{
          onMouseEnter: () => this.setIsOpen(true),
          onMouseLeave: () => this.setIsOpen(false),
        }}
      >
        <Col
          color={UIColors.text}
          position="absolute"
          top="0px"
          left="0px"
          width="100%"
          zIndex="2"
          className="dropdown"
          userSelect="none"
          textTransform="none"
        >
          <DropdownItem
            key="selected"
            listItem={this.props.selectedGroup}
            idx={this.props.selectedGroup}
            selected={true}
            toggleIsOpen={this.toggleIsOpen}
            setHoverElement={this.setHoverElement}
            isOpen={this.state.dropdownOpen}
          />
          {this.state.dropdownOpen
            ? [...Array(this.props.numComponents).keys()].map((listItem) => {
                return !(listItem == this.props.selectedGroup) ? (
                  <DropdownItem
                    key={"component" + listItem}
                    listItem={listItem}
                    idx={listItem}
                    selected={false}
                    setSelected={this.props.setSelected}
                    setHoverElement={this.setHoverElement}
                    isHover={this.state.hoverIdx === listItem}
                  />
                ) : (
                  ""
                );
              })
            : ""}
          {this.state.dropdownOpen ? (
            <Row
              justifyContent="center"
              alignItems="center"
              padding="4px"
              cursor="pointer"
              backgroundColor={
                this.state.hoverIdx === this.props.numComponents
                  ? "grey"
                  : UIColors.header
              }
              props={{
                onMouseEnter: () =>
                  this.setHoverElement(this.props.numComponents),
                onMouseLeave: () => this.setHoverElement(-1),
                onClick: this.props.addListItems,
              }}
            >
              <div>+ Add item</div>
            </Row>
          ) : (
            ""
          )}
        </Col>
      </Row>
    );
  }
}

export default GroupDropdown;
