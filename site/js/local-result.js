console.log('local result');

//map data is in geodata/small-local-authorities.topojson

const queue = d3_queue.queue();

const width = 960,
  height = 1160;

const svg = d3.select(".local-results").append("svg")
  .attr("width", width)
  .attr("height", height);

queue
  .defer(d3.json, "geodata/referendum-result-areas.topojson")
  .defer(d3.json, "dummyresult/local.json")
  .await(ready);

function ready(error, uk, localResultsData) {
  if (error) return console.error(error);

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
  const legend_labels = ["< 45%", "45-50%", "50-55%", "> 55%"]
  const color = d3.scale.threshold()
    .domain(color_domain)
    .range(["#fc9272",
      "#de2d26",
      "#3182bd",
      "#9ecae1"
    ]);

  // Create Projection and Path for UK
  const ukProjection = d3.geo.albers()
    .center([0, 55.4])
    .rotate([0, 0])
    .parallels([50, 60])
    .scale(6000)
    .translate([width / 2, height / 2]);


  const path = d3.geo.path()
    .projection(ukProjection);


  // Draw whole UK Map
  const ukMap = svg.selectAll(".local-results")
    .data(ukFeaturesExcShetland)

  ukMap.enter()
    .append("path")
    .attr('class', 'local-results')
    .attr("d", path);

  ukMap.style("fill", data => {
    // color(findResultRegion(data.id)[0].remain_pct)
    return data.id.startsWith('E09') ? "black" : color(findResultRegion(data.id)[0].remain_pct)
  });

  // Draw borders between countries
  svg.append("path")
    .datum(topojson.mesh(uk, uk.objects, (a, b) => a.id[0] !== b.id[0]))
    .attr("d", path)
    .attr("class", "country-boundary");

  // Create Projection and Path for London
  const londonProjection = d3.geo.albers()
    .center([0, 51.4])
    .rotate([0, 0])
    .parallels([50, 60])
    .scale(20000)
    .translate([width / 2, height / 2]);

  const londonPath = d3.geo.path()
    .projection(londonProjection);

  // Draw London Map
  const londonMap = svg.selectAll("g.london")
    .data(londonFeatures)

  londonMap.enter()
    .append("path")
    .attr('transform', 'translate(50, -60)')
    .attr('class', 'london')
    .attr("d", londonPath);

  londonMap.style("fill", data => color(findResultRegion(data.id)[0].remain_pct))

  // Draw Shetland Map
  const shetlandMap = svg.selectAll("g.shetland")
    .data(shetlandFeatures)

  shetlandMap.enter()
    .append("path")
    .attr('transform', 'translate(0, 180)')
    .attr('class', 'shetland')
    .attr("d", path);

  shetlandMap.style("fill", data => color(findResultRegion(data.id)[0].remain_pct))


  // Draw box around London
  svg.append("rect")
    .attr("x", 410)
    .attr("y", 405)
    .attr("height", 165)
    .attr("width", 200)
    .style("stroke", "black")
    .style("fill", "none")
    .style("stroke-width", 2);

  // Draw box around Shetland
  svg.append("rect")
    .attr("x", 375)
    .attr("y", 175)
    .attr("height", 135)
    .attr("width", 80)
    .style("stroke", "black")
    .style("fill", "none")
    .style("stroke-width", 2);

  // Draw legend
  var legend = svg.selectAll("g.legend")
    .data(ext_color_domain)
    .enter().append("g")
    .attr('transform', 'translate(0 , -50)')
    .attr("class", "legend");

  var ls_w = 20,
    ls_h = 20;

  legend.append("rect")
    .attr("x", 20)
    .attr("y", function(d, i) {
      return height - (i * ls_h) - 2 * ls_h;
    })
    .attr("width", ls_w)
    .attr("height", ls_h)
    .style("fill", function(d, i) {
      return color(d);
    })
    .style("opacity", 0.8);

  legend.append("text")
    .attr("x", 50)
    .attr("y", function(d, i) {
      return height - (i * ls_h) - ls_h - 4;
    })
    .text(function(d, i) {
      return legend_labels[i];
    });
};