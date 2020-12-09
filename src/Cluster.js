import React, { Component } from "react";
import "./App.css";
import { Box, Row, Col } from "jsxstyle";
import $ from "jquery";

var flaskAppURL = "http://ec2-54-198-69-44.compute-1.amazonaws.com/";
var yourGroups = { 0: [0, 1, 2, 3, 4, 5], 1: [6, 7, 8, 9] };

class Cluster extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: "km",
    };
    this.sendToApp = this.sendToApp.bind(this);
    this.sendToBackend = this.sendToBackend.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.setTab = this.setTab.bind(this);
  }

  setTab(key) {
    this.setState({ selectedTab: key });
  }

  sendToApp() {
    console.log("inside sendToApp");
    console.log(yourGroups);
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
      console.log("hello");
      var maxmin = params[0];
      var params_url = "none?type=" + maxmin;
      var url = flaskAppURL + params_url;
    }
    console.log(url);

    var x = 0;
    var result = await $.ajax({
      url: url,
      type: "GET",
      success: function (data) {
        var response = JSON.parse(data);
        yourGroups = response;
        console.log("inside success function");
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

  // selectedTechnique(id) {
  //   var km = document.getElementById("km");
  //   var hc = document.getElementById("hc");
  //   var nc = document.getElementById("nc");
  //   // km.style.background = 'black';
  //   // hc.style.background = 'black';
  //   // nc.style.background = 'black';

  //   var km_so = document.getElementById("km_so");
  //   var hc_so = document.getElementById("hc_so");
  //   var nc_so = document.getElementById("nc_so");
  //   // km_so.style.display = "none";
  //   // hc_so.style.display = "none";
  //   // nc_so.style.display = "none";

  //   var div_id = document.getElementById(id);
  //   // div_id.style.fontWeight = "800"
  //   // div_id.style.color = "teal"

  //   if (id == "km") {
  //     km_so.style.display = "block";
  //     this.state.selectedTab = 'km';
  //   }

  //   if (id == "hc") {
  //     hc_so.style.display = "block";
  //     this.state.selectedTab = 'hc';
  //   }

  //   if (id == "nc") {
  //     nc_so.style.display = "block";
  //     this.state.selectedTab = 'nc';
  //   }
  // }

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
        <div id="km_so">
          <div>
            <label>K: </label>
            <input id="k_val" type="text" name="k" />
          </div>
          <div>
            <label>Dimensionality Reduction? </label>
            <br></br>
            <input
              type="radio"
              onClick={this.showSubOptions_dr.bind(this, "pca")}
              id="pca"
              value="1"
              name="dr"
            />
            PCA
            <input
              type="radio"
              onClick={this.showSubOptions_dr.bind(this, "tsne")}
              id="tsne"
              value="2"
              name="dr"
            />
            t-SNE
            <input
              type="radio"
              onClick={this.showSubOptions_dr.bind(this, "no")}
              id="no"
              value="0"
              name="dr"
            />
            None
          </div>

          <div id="pca_subOptions" style={{ display: "none" }}>
            <label>Variance %: </label>
            <input id="variance" type="text" name="variance" />
          </div>

          <div id="tsne_subOptions" style={{ display: "none" }}>
            <label>Perplexity %: </label>
            <input id="perplexity" type="text" name="perplexity" />
          </div>
        </div>
      );
    } else if (this.state.selectedTab === "hc") {
      suboptionMenu = (
        <div id="hc_so">
          <div>
            <label># of clusters: </label>
            <input id="hc_val" type="text" name="hc" />
          </div>

          <div>
            <div>
              <label> Linkage:</label>
              <input type="radio" id="ward" value="ward" name="linkage" />
              ward
            </div>
            <div>
              <input
                type="radio"
                id="complete"
                value="complete"
                name="linkage"
              />
              complete
            </div>
            <div>
              <input type="radio" id="average" value="average" name="linkage" />
              average
            </div>
            <div>
              <input type="radio" id="single" value="single" name="linkage" />
              single
            </div>
          </div>
        </div>
      );
    } else {
      suboptionMenu = (
        <div id="nc_so">
          <div>
            <label>Group by: </label>
          </div>
          <div>
            <input type="radio" id="max" value="max" name="maxmin" />
            maximum
            <input type="radio" id="min" value="min" name="maxmin" />
            minimum
          </div>
        </div>
      );
    }

    return (
      <Col width="100%" height="100%" alignItems="center">
        <Row
          width="90%"
          justifyContent="space-evenly"
          paddingTop="20px"
          paddingBottom="12px"
          borderBottom="1px solid white"
        >
          {" "}
          {Object.keys(this.tabmappings).map((key) => (
            <Row
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
        <Row color="white">
          {suboptionMenu}
        </Row>
        <div id="buttons">
          <button onClick={this.sendToBackend}>Fetch Clusters</button>
        </div>
      </Col>
    );
  }
}

export default Cluster;
