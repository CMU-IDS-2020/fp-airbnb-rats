import React, { Component } from "react";
import "./App.css";
import { UIColors } from "./colors";
import { Box, Col, Row, Inline } from "jsxstyle";
import { schemeTableau10 } from "d3-scale-chromatic";

function DropdownItem(props) {
  //console.log(props)
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
        props.selected ? {} : { onClick: () => props.setSelected(props.idx) }
      }
    >
      <Box
        backgroundColor={props.listItem}
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
      listItems: [[schemeTableau10[0]]],
      dropdownOpen: false,
    };
    this.setListItems = this.setListItems.bind(this);
    this.addListItem = this.addListItem.bind(this);
    this.toggleIsOpen = this.toggleIsOpen.bind(this);
  }

  setListItems(items) {
    this.setState({ listItems: items });
  }

  toggleIsOpen() {
    this.setState({ dropdownOpen: !this.state.dropdownOpen });
  }

  addListItem() {
    this.state.listItems.push(schemeTableau10[this.state.listItems.length]);
    this.setState({ listItems: this.state.listItems });
    this.props.setSelected(this.state.listItems.length - 1);
  }

  render() {
    return (
      <Row 
        position="relative" 
        width="160px" 
        marginLeft="8px"
        height="26px">
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
            listItem={this.state.listItems[this.props.selectedGroup]}
            idx={this.props.selectedGroup}
            selected={true}
            toggleIsOpen={this.toggleIsOpen}
            isOpen={this.state.dropdownOpen}
          />
          {this.state.dropdownOpen
            ? this.state.listItems.map((listItem, idx) => {
                return !(idx == this.props.selectedGroup) ? (
                  <DropdownItem
                    key={"component" + idx}
                    listItem={listItem}
                    idx={idx}
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
              <div onClick={this.addListItem}>+ Add item</div>
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
