// console.log('local result');

// //map data is in geodata/small-local-authorities.topojson

// const queue = d3_queue.queue();

// const width = 960,
//   height = 1160;

// const svg = d3.select(".local-results").append("svg")
//   .attr("width", width)
//   .attr("height", height);

// queue
//   .defer(d3.json, "geodata/small-local-authorities.topojson")
//   .defer(d3.json, "dummyresult/local.json")
//   .await(ready);

// function ready(error, uk, localResultsData) {
//   if (error) return console.error(error);

//   const allUkLocalBoundaries = uk.objects
//   const localBoundaries = topojson.feature(uk, allUkLocalBoundaries.gb);
//   const northernIrelandBoundary = topojson.feature(uk, allUkLocalBoundaries.ni);
//   const londonRegions = localBoundaries.features.filter(data => data.properties.region === 'E12000007')

//   const findResultRegion = (regionId) => localResultsData.filter((result) => result.local_id === regionId);

//   const color_domain = [45, 50, 55, 100]
//   const ext_color_domain = [0, 45, 50, 55]
//   const legend_labels = ["< 45%", "45-50%", "50-55%", "> 55%"]
//   const color = d3.scale.threshold()
//     .domain(color_domain)
//     .range(["#6C3A2B",
//             "#915635",
//             "#B3763F",
//             "#D19948"]);

//   // Create Projection and Path for UK
//   const ukProjection = d3.geo.albers()
//     .center([0, 55.4])
//     .rotate([0, 0])
//     .parallels([50, 60])
//     .scale(6000)
//     .translate([width / 2, height / 2]);


//   const path = d3.geo.path()
//     .projection(ukProjection);


//   // Draw whole UK Map
//   const ukMap = svg.selectAll(".local-results")
//     .data(localBoundaries.features)

//   ukMap.enter()
//       .append("path")
//       .attr('class','local-results')
//       .attr("d", path);

//   ukMap.style("fill", data => {
//     return color(findResultRegion(data.id)[0].remain_pct)
//   });

//   // Draw borders between countries
//   svg.append("path")
//   .datum(topojson.mesh(uk, allUkLocalBoundaries, (a, b) => a.id[0] !== b.id[0]))
//   .attr("d", path)
//   .attr("class", "country-boundary");

//   // Create Projection and Path for London
//   const londonProjection = d3.geo.albers()
//   .center([0, 51.4])
//   .rotate([0, 0])
//   .parallels([50, 60])
//   .scale(20000)
//   .translate([width / 2, height / 2]);

//   const londonPath = d3.geo.path()
//   .projection(londonProjection);

//   // Draw London Map
//   const londonMap = svg.selectAll("g.london")
//     .data(londonRegions)

//   londonMap.enter()
//       .append("path")
//       // .append("g")
//       .attr('transform', 'translate(50, -10)')
//       .attr('class','london')
//       .attr("d", londonPath);

//   londonMap.style("fill", data => {
//     return color(findResultRegion(data.id)[0].remain_pct)
//   });

//   // Draw legend
//   var legend = svg.selectAll("g.legend")
//     .data(ext_color_domain)
//     .enter().append("g")
//     .attr('transform', 'translate(0 , -50)')
//     .attr("class", "legend");

//   var ls_w = 20, ls_h = 20;

//   legend.append("rect")
//     .attr("x", 20)
//     .attr("y", function(d, i){ return height - (i*ls_h) - 2*ls_h;})
//     .attr("width", ls_w)
//     .attr("height", ls_h)
//     .style("fill", function(d, i) { return color(d); })
//     .style("opacity", 0.8);

//   legend.append("text")
//     .attr("x", 50)
//     .attr("y", function(d, i){ return height - (i*ls_h) - ls_h - 4;})
//       .text(function(d, i){ return legend_labels[i]; });
// };
