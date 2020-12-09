import React, { Component } from "react";
import "./App.css";
import { Box, Row, Col, Inline } from "jsxstyle";
import $ from "jquery";
import { UIColors } from "./colors";

var flaskAppURL = "http://ec2-54-198-69-44.compute-1.amazonaws.com/";
var yourGroups = { 0: [0, 1, 2, 3, 4, 5], 1: [6, 7, 8, 9] };

class Cluster extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: "km",
      running: false,
    };
    this.sendToApp = this.sendToApp.bind(this);
    this.sendToBackend = this.sendToBackend.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.setTab = this.setTab.bind(this);
    this.setIsRunning = this.setIsRunning.bind(this);
  }

  setIsRunning(isRunning) {
    this.setState({ running: isRunning });
  }

  setTab(key) {
    this.setState({ selectedTab: key });
  }

  sendToApp() {
    //console.log("inside sendToApp");
    //console.log(yourGroups);
    this.props.changeDataGroups(yourGroups);
  }

  async getData(elmnt, params) {
    var url = "";
    var K = 5;

    if (elmnt.id == "km") {
      K = params[0];
      var pca = params[1];
      var variance = params[2];
      var perplexity = params[3];
      var params_url =
        "kmeans?K=" +
        K +
        "&pca=" +
        pca +
        "&variance=" +
        variance +
        "&perplexity=" +
        perplexity;
      var url = flaskAppURL + params_url;
    } else if (elmnt.id == "hc") {
      K = params[0];
      var linkage = params[1];
      var params_url = "hierarchical?num=" + K + "&linkage=" + linkage;
      var url = flaskAppURL + params_url;
    } else {
      //console.log("hello");
      var maxmin = params[0];
      var params_url = "none?type=" + maxmin;
      var url = flaskAppURL + params_url;
    }
    console.log(url);

    const IS = this.setIsRunning;
    IS(true);

    var x = 0;
    var result = await $.ajax({
      url: url,
      type: "GET",
      success: function (data) {
        IS(false);
        var response = JSON.parse(data);
        yourGroups = response;
        console.log("Successful request callback");
        console.log(yourGroups);
        x = 1;
      },
      error: function (error) {
        console.log(error);
        x = 1;
      },
    });
  }

  async sendToBackend() {
    var params = [];
    if (this.state.selectedTab == "km") {
      console.log("kmeans submitted");
      var k = $('input[name="k"]').val();
      var dr = $('input[name="dr"]:checked').val();
      var variance = $('input[name="variance"]').val();
      var perplexity = $('input[name="perplexity"]').val();
      if (k == "") {
        k = 5;
        $('input[name="k"]').val(5);
      }

      if (dr == undefined) {
        dr = 0;
        $("input[name='dr'][value='0']").prop("checked", true);
      }

      if (variance == "") {
        variance = 0.95;
        $('input[name="variance"]').val(0.95);
      }

      if (perplexity == "") {
        perplexity = 30;
        $('input[name="perplexity"]').val(30);
      }
      params.push(k);
      params.push(dr);
      params.push(variance);
      params.push(perplexity);

      console.log(params);
      var element = document.getElementById("km");
      var r = await this.getData(element, params);
      this.sendToApp();
    } else if (this.state.selectedTab == "hc") {
      console.log("hierarchical submitted");
      var num = $('input[name="hc"]').val();
      var linkage = $('input[name="linkage"]:checked').val();

      if (num == "") {
        num = 3;
        $('input[name="hc"]').val(3);
      }

      if (linkage == undefined) {
        linkage = "ward";
        $("input[name='linkage'][value='ward']").prop("checked", true);
      }

      params.push(num);
      params.push(linkage);
      console.log(params);

      var element = document.getElementById("hc");
      var r = await this.getData(element, params);
      this.sendToApp();
    } else if (this.state.selectedTab == "nc") {
      console.log("no cluster submitted");
      var maxmin = $('input[name="maxmin"]:checked').val();

      if (maxmin == undefined) {
        maxmin = "max";
        $("input[name='maxmin'][value='max']").prop("checked", true);
      }

      params.push(maxmin);

      element = document.getElementById("nc");
      var r = await this.getData(element, params);
      this.sendToApp();
    } else {
      alert("Please select an option, thank you!");
    }
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  showSubOptions_dr(id) {
    var pca_so = document.getElementById("pca_subOptions");
    var tsne_so = document.getElementById("tsne_subOptions");
    pca_so.style.display = "none";
    tsne_so.style.display = "none";

    var div_id = document.getElementById(id);

    if (id == "pca") pca_so.style.display = "block";

    if (id == "tsne") tsne_so.style.display = "block";
  }

  tabmappings = {
    km: "K-means",
    hc: "Hierarchical",
    nc: "No Clusters",
  };

  render() {
    let suboptionMenu;
    if (this.state.selectedTab === "km") {
      suboptionMenu = (
        <Col width="80%">
          <Row
            width="100%"
            fontSize="12px"
            marginBottom="14px"
            justifyContent="flex-start"
            color="#AAA"
          >
            A distance based clustering algorithm that partitions the dataset
            into 'K' groups using the dist. between the points.
          </Row>
          <Row marginBottom="8px" alignItems="center">
            <Box marginRight="8px" fontWeight="600">
              Number of clusters:
            </Box>
            <input
              id="k_val"
              type="text"
              name="k"
              style={{ width: "40px", height: "24px" }}
            />
          </Row>
          <Col alignItems="flex-start" height="100px">
            <Box
              marginBottom="4px"
              fontWeight="600"
              borderBottom="1px solid grey"
            >
              Dimensionality Reduction
            </Box>
            <Row width="100%">
              <Col
                width="40%"
                justifyContent="space-evenly"
                alignItems="flex-start"
              >
                <Inline>
                  <input
                    type="radio"
                    onClick={this.showSubOptions_dr.bind(this, "pca")}
                    id="pca"
                    value="1"
                    name="dr"
                  />
                  PCA
                </Inline>
                <Inline>
                  <input
                    type="radio"
                    onClick={this.showSubOptions_dr.bind(this, "tsne")}
                    id="tsne"
                    value="2"
                    name="dr"
                  />
                  t-SNE
                </Inline>
                <Inline>
                  <input
                    type="radio"
                    onClick={this.showSubOptions_dr.bind(this, "no")}
                    id="no"
                    value="0"
                    name="dr"
                  />
                  None
                </Inline>
              </Col>
              <Col justifyContent="center" width="100%" height="70px">
                <div id="pca_subOptions" style={{ display: "none" }}>
                  <label>Variance %: </label>
                  <input
                    id="variance"
                    type="text"
                    name="variance"
                    style={{ width: "40px", height: "24px" }}
                  />
                  <Row
                    width="100%"
                    fontSize="12px"
                    marginBottom="14px"
                    justifyContent="flex-start"
                    color="grey"
                    fontStyle="italic"
                  >
                    PCA does deterministic, linear dimensionality reduction.
                  </Row>
                </div>
                <div id="tsne_subOptions" style={{ display: "none" }}>
                  <label>Perplexity %: </label>
                  <input
                    id="perplexity"
                    type="text"
                    name="perplexity"
                    style={{ width: "40px", height: "24px" }}
                  />
                  <Row
                    width="100%"
                    fontSize="12px"
                    marginBottom="14px"
                    justifyContent="flex-start"
                    color="grey"
                    fontStyle="italic"
                  >
                    t-SNE does probabalistic, non-linear dimensionality
                  </Row>
                </div>
              </Col>
            </Row>
          </Col>
        </Col>
      );
    } else if (this.state.selectedTab === "hc") {
      suboptionMenu = (
        <Box width="80%">
          <Row
            width="100%"
            fontSize="12px"
            marginBottom="14px"
            justifyContent="flex-start"
            color="#AAA"
          >
            Hierarchical clustering builds a hierarchy of clusters based on a
            distance metric.
          </Row>
          <Row marginBottom="4px" alignItems="center">
            <Box marginRight="8px" fontWeight="600">
              Number of clusters:
            </Box>
            <input
              id="hc_val"
              type="text"
              name="hc"
              style={{ width: "40px", height: "24px" }}
            />
          </Row>
          <Row width="100%" justifyContent="space-evenly" alignItems="center">
            <Col alignItems="center" fontSize="13px">
              <Box
                justifyContent="center"
                fontWeight="600"
                fontSize="16px"
                borderBottom="1px solid grey"
                marginBottom="4px"
              >
                Linkage
              </Box>
              <Col alignItems="flex-start">
                <div>
                  <input type="radio" id="ward" value="ward" name="linkage" />
                  Ward
                </div>
                <div>
                  <input
                    type="radio"
                    id="complete"
                    value="complete"
                    name="linkage"
                  />
                  Complete
                </div>
                <div>
                  <input
                    type="radio"
                    id="average"
                    value="average"
                    name="linkage"
                  />
                  Average
                </div>
                <div>
                  <input
                    type="radio"
                    id="single"
                    value="single"
                    name="linkage"
                  />
                  Single
                </div>
              </Col>
            </Col>
            <Col
              width="150px"
              color="grey"
              fontSize="13px"
              fontStyle="italic"
              textAlign="left"
            >
              Linkage determines which type of distance should be used in
              building the hierarchy.
            </Col>
          </Row>
        </Box>
      );
    } else {
      suboptionMenu = (
        <Col width="80%">
          <Row
            width="100%"
            fontSize="13px"
            marginBottom="14px"
            alignItems="center"
            color="#AAA"
          >
            Generate groups based on maximum abundance elements or minimum
            abundance elements.
          </Row>
          <Col alignItems="center">
            <Inline
              justifyContent="center"
              fontWeight="600"
              fontSize="16px"
              width="120px"
              borderBottom="1px solid grey"
            >
              Group by
            </Inline>
            <Col marginTop="8px" alignItems="flex-start">
              <Inline>
                <input type="radio" id="max" value="max" name="maxmin" />
                Maximum
              </Inline>
              <Inline>
                <input type="radio" id="min" value="min" name="maxmin" />
                Minimum
              </Inline>
            </Col>
          </Col>
        </Col>
      );
    }

    return (
      <Col
        width="100%"
        height="100%"
        alignItems="center"
        justifyContent="space-between"
      >
        <Row
          width="90%"
          justifyContent="space-evenly"
          paddingTop="20px"
          paddingBottom="12px"
          borderBottom="1px solid white"
        >
          {Object.keys(this.tabmappings).map((key) => (
            <Row
              key={key}
              props={{ id: key, onClick: () => this.setTab(key) }}
              color={this.state.selectedTab == key ? "#AAAAFF" : "#CCC"}
              fontWeight={this.state.selectedTab == key ? 800 : 500}
              cursor="pointer"
              width="100px"
              justifyContent="center"
            >
              {this.tabmappings[key]}
            </Row>
          ))}
        </Row>
        <Row
          color="white"
          width="100%"
          justifyContent="center"
          alignItems="center"
        >
          {suboptionMenu}
        </Row>
        <Box paddingBottom="16px">
          <Box
            props={{
              onClick: this.state.running
                ? () =>
                    alert(
                      "Please wait for last clustering algorithm to finish running."
                    )
                : this.sendToBackend,
            }}
            background={UIColors.header}
            padding="12px 20px 12px 20px"
            color={UIColors.text}
            fontWeight="bold"
            borderRadius="12px"
            cursor="pointer"
            margin="0px"
          >
            {this.state.running ? "Running..." : "Fetch Clusters"}
          </Box>
        </Box>
      </Col>
    );
  }
}

export default Cluster;
