console.log('local result');

//map data is in geodata/small-local-authorities.topojson

const width = 960,
    height = 1160;

const svg = d3.select(".local-results").append("svg")
    .attr("width", width)
    .attr("height", height);

const returnCountryClass = (data) => {
  const country = data.id[0];
  switch (country) {
    case 'E':
      return 'ENG';
      break;
    case 'S':
      return 'SCO';
      break;
    case 'W':
      return 'WAL';
      break;
    default:
      console.log(country);
  }
}

d3.json("geodata/small-local-authorities.topojson", (error, uk) => {
  if (error) return console.error(error);

  const localBoundaries = topojson.feature(uk, uk.objects['clipped-local-authority-boundaries']);

  const projection = d3.geo.albers()
      .center([0, 55.4])
      .rotate([0, 0])
      .parallels([50, 60])
      .scale(6000)
      .translate([width / 2, height / 2]);

  const path = d3.geo.path()
    .projection(projection);

  svg.append("path")
      .datum(localBoundaries)
      .attr("d", path);

  // Draw borders of local regions
  svg.selectAll(".local-results")
    .data(topojson.feature(uk, uk.objects['clipped-local-authority-boundaries']).features)
    .enter().append("path")
    .attr("class", returnCountryClass)
    .attr("d", path);

  // Draw borders between countries
  svg.append("path")
    .datum(topojson.mesh(uk, uk.objects['clipped-local-authority-boundaries'], (a, b) => a.id[0] !== b.id[0]))
    .attr("d", path)
    .attr("class", "country-boundary");

});