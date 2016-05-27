console.log('local result');

//map data is in geodata/small-local-authorities.topojson

const queue = d3_queue.queue();

const width = 960,
  height = 1160;

const svg = d3.select(".local-results").append("svg")
  .attr("width", width)
  .attr("height", height)
  // .attr('viewBox', '0 0 '+width+' '+height);

queue
  .defer(d3.json, "geodata/referendum-result-areas.topojson")
  .defer(d3.json, "dummyresult/local.json")
  .await(ready);

function ready(error, uk, localResultsData) {
  if (error) return console.error(error);

  const ukMapScale = 5000

  const greatBritainBoundary = topojson.feature(uk, uk.objects.gb);
  const northernIrelandBoundary = topojson.feature(uk, uk.objects.ni);

  const ukFeaturesExcShetland = greatBritainBoundary.features
    .concat(northernIrelandBoundary.features)
    .filter(data => data.id !== 'S12000027');

  const shetlandFeatures = greatBritainBoundary.features.filter(data => data.id === 'S12000027')
  const londonFeatures = greatBritainBoundary.features.filter(data => data.properties.region === 'E12000007')

  const findResultRegion = (regionId) => localResultsData.filter((result) => result.local_id === regionId);

  const color_domain = [45, 50, 55, 100]
  const ext_color_domain = [0, 45, 50, 55]
  const color = d3.scale.threshold()
    .domain(color_domain)
    .range(["#fc9272",
      "#de2d26",
      "#3182bd",
      "#9ecae1"
    ]);

  const countryBorderColor = "#E9DECF";
  const noDataFillColor = "#F6E9D8";
  const insetBoxColor = "#E9DECF";

  // Create Projection and Path for UK
  const ukProjection = d3.geo.albers()
    .center([0, 55.4])
    .rotate([0, 0])
    .parallels([50, 60])
    .scale(ukMapScale)
    .translate([width / 2, height / 2]);


  const path = d3.geo.path()
    .projection(ukProjection);


  // Draw whole UK Map
  const ukMap = svg.append('g').selectAll(".local-results")
    .data(ukFeaturesExcShetland)

  ukMap.enter()
    .append("path")
    .attr('class', 'local-results')
    .attr("d", path);

  const fillCorrectColor = (data) => {
    // Fill transparent if London
    if (data.id.startsWith('E09')) {
      return "transparent"
    }
    // Fill with color if we have result data for the region
    if (findResultRegion(data.id)[0] && findResultRegion(data.id)[0].remain_pct) {
      return color(findResultRegion(data.id)[0].remain_pct)
    }
    // Fill transparent if not London and no results data
    return noDataFillColor
  }

  ukMap
    .style("fill", fillCorrectColor)


  // Draw borders excluding London
  svg.append("path")
    .datum(topojson.mesh(uk, uk.objects.gb, (a, b) => a.properties.region !== 'E12000007'))
    .attr("d", path)
    .attr("class", "country-boundary")
    .style("stroke", "black")
    .style("stroke-width", "0.1px")
    .style("fill", "none")

    // Draw borders between countries
    svg.append("path")
    .datum(topojson.mesh(uk, uk.objects.gb, (a, b) => a.id[0] !== b.id[0]))
    .attr("d", path)
    .attr("class", "country-boundary")
    .style("fill", "none")
    .style("stroke", countryBorderColor)


  // Create London projection and path
  const londonProjection = d3.geo.albers()
    .center([-0.1, 51.5])
    .rotate([0, 0])
    .parallels([50, 60])
    .scale(20000)
    .translate([100,83]);

  const londonPath = d3.geo.path()
    .projection(londonProjection);

  // Draw London Map
  const londonMap = svg
    .append('g')
    .attr('transform', 'translate(420, 410)')
    .attr('class', 'london-map');

  londonMap.call((parent) => {
    parent.append('text')
      .text('London')
      .attr('transform', 'translate(0, -5)');

    parent.append('rect')
      .attr("width", 200)
      .attr("height", 165)
      .style("stroke", insetBoxColor)
      .style("fill", "none")
      .style("stroke-width", 2);

    parent.selectAll('path')
      .data(londonFeatures)
      .enter()
      .append("path")
      .attr("d", londonPath)
      .style("fill", data => color(findResultRegion(data.id)[0].remain_pct))
      .style("stroke", "black")
      .style("stroke-width", "0.1px")
  });

  // Create Shetland projection and path
  const shetlandProjection = d3.geo.albers()
    .center([-1.2, 60.3])
    .rotate([0, 0])
    .parallels([50, 60])
    .scale(ukMapScale)
    .translate([40,68]);

  const shetlandPath = d3.geo.path()
    .projection(shetlandProjection);

  // Draw Shetland Map
  const shetlandMap = svg
    .append("g")
    .attr('transform', 'translate(380, 220)')
    .attr("class", 'shetland-map')

  shetlandMap.call((parent) => {
    parent.append('text')
      .text('Shetland')
      .attr('transform', 'translate(0, -5)');

    parent.append('rect')
      .attr("width", 75)
      .attr("height", 125)
      .style("stroke", insetBoxColor)
      .style("fill", "none")
      .style("stroke-width", 2);

    parent.selectAll('path')
      .data(shetlandFeatures)
      .enter()
      .append("path")
      .attr("d", shetlandPath)
      .style("fill", data => color(findResultRegion(data.id)[0].remain_pct))
      .style("stroke", "black")
      .style("stroke-width", "0.1px");
  });

  // Draw legend
  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr('transform', 'translate(0 , 0)')
    // .enter()
    // .selectAll("g.legend")

  legend.call((parent) => {
    const ls_w = 20;
    const ls_h = 20;
    const legendTitle = "% votes to remain"
    const legendLabels = ["< 45%", "45-50%", "50-55%", "> 55%"]

    parent.selectAll("rect")
      .data(ext_color_domain)
      .enter()
      .append("rect")
      .attr("x", 20)
      .attr("y", function(d, i) {
        return (height - (i * ls_h) - 2 * ls_h) - 250;
      })
      .attr("width", ls_w)
      .attr("height", ls_h)
      .style("fill", function(d, i) {
        return color(d);
      })
      .style("opacity", 0.8);

    parent.selectAll("text")
      .data(ext_color_domain)
      .enter()
      .append("text")
      .attr("x", 50)
      .attr("y", function(d, i) {
        return (height - (i * ls_h) - ls_h - 4) - 250;
      })
      .text(function(d, i) {
        return legendLabels[i];
      });

    parent.append("text")
      .attr("x", 20)
      .attr("y", 800)
      .text(legendTitle)
  })


};