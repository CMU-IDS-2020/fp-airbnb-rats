import React, { Component } from "react";
import "./App.css";
import { UIColors } from "./colors";
import { Box, Col, Row, Inline } from "jsxstyle";
import { schemeTableau10 } from "d3-scale-chromatic";

function DropdownItem(props) {
  return (
    <Row
      justifyContent="center"
      alignItems="center"
      borderRadius={props.selected ? "12px 12px 0px 0px" : "0px"}
      backgroundColor={props.selected ? "black" : UIColors.header}
      padding="4px"
      borderBottom={!props.selected ? "1px solid rgba(255, 255, 255, 0.2)" : ""}
      cursor={props.selected ? "default" : "pointer"}
      props={
        props.selected
          ? {}
          : { onClick: () => props.setSelected(props.listItem) }
      }
    >
      <Box
        backgroundColor={schemeTableau10[props.listItem]}
        borderRadius="10px"
        width="10px"
        height="10px"
      />
      <Box marginLeft="6px">
        {"Component " + props.idx}
        {props.selected ? (
          <Inline
            hoverCursor="pointer"
            marginLeft="8px"
            props={{ onClick: () => props.toggleIsOpen() }}
          >
            {props.isOpen ? "▾" : "◂"}
          </Inline>
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
    };
    this.toggleIsOpen = this.toggleIsOpen.bind(this);
  }

  toggleIsOpen() {
    this.setState({ dropdownOpen: !this.state.dropdownOpen });
  }

  render() {
    return (
      <Row position="relative" width="160px" marginLeft="8px" height="26px">
        <Col
          color={UIColors.text}
          position="absolute"
          top="0px"
          left="0px"
          zIndex="2"
          className="dropdown"
          userSelect="none"
        >
          <DropdownItem
            key="selected"
            listItem={this.props.selectedGroup}
            idx={this.props.selectedGroup}
            selected={true}
            toggleIsOpen={this.toggleIsOpen}
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
              backgroundColor={UIColors.header}
            >
              <div onClick={this.props.addListItems}>+ Add item</div>
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
