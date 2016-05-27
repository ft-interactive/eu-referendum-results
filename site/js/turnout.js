'use strict';

const ELECTION_TYPE_COLORS = {};

let map, mapframe, mapResults;

d3.xhr('http://localhost:8082/all', function (data) {
	if (data) {
		drawTurnout(Math.round(JSON.parse(data.response).national.turnout_pct));
	}
	else {
		drawTurnout(50);
	}
});

function drawTurnout(brexitTurnout) {

	d3.csv('../data/turnout_all.csv', function (result) {

		// Sort by date, ascending
		result.sort(function (a, b) {
			return Date.parse(a.date) - Date.parse(b.date);
		});

		d3.select('.turnout-results')
			.append('div')
			.attr('id', 'turnoutChart');

		let date = ['x'];
		let type = ['type'];
		let electionName = {};

		let generalElection = ['General Election'];
		let referendum = ['Referendum'];
		let londonMayoral = ['London Mayoral'];
		let europeanParliament = ['European Parliament'];
		let other = ['Other'];

		let categoryColors = d3.scale.category10();

		for (const row in result) {
			date.push(result[row].date);
			type.push(result[row].type);

			let rowDate = new Date(result[row].date);

			electionName[`${rowDate.getFullYear()}${rowDate.getMonth()}${rowDate.getDate()}`] = result[row].election;

			if (result[row].type === 'general election') {
				generalElection.push(result[row].turnout);
				referendum.push('');
				londonMayoral.push('');
				europeanParliament.push('');
				other.push('');
			}
			else if (result[row].type === 'referendum'){
				referendum.push(result[row].turnout);
				generalElection.push('');
				londonMayoral.push('');
				europeanParliament.push('');
				other.push('');
			}
			else if (result[row].type === 'london mayoral'){
				londonMayoral.push(result[row].turnout);
				generalElection.push('');
				referendum.push('');
				europeanParliament.push('');
				other.push('');
			}
			else if (result[row].type === 'european parliament'){
				europeanParliament.push(result[row].turnout);
				generalElection.push('');
				referendum.push('');
				londonMayoral.push('');
				other.push('');
			}
			else{
				other.push(result[row].turnout);
				generalElection.push('');
				referendum.push('');
				londonMayoral.push('');
				europeanParliament.push('');
			}
		}

		// Add brexit at the end
		referendum.push(brexitTurnout);
		date.push('2016-06-23');
		electionName['2016523'] = 'UK EU Referendum';

		let chart = c3.generate({
			size: {
			    height: 500,
			    width: 600
			},
			bindto: '#turnoutChart',
			point: {
				r: function(d) {
					return 5;
				},
				focus: {
					expand: {
						enabled: false
					}
				}
			},
			data: {
				type: 'scatter',
				x: 'x',
				columns: [date, generalElection, referendum, londonMayoral, europeanParliament],
				onclick: function (data) {

					console.log('new threshold', data.value);
					let threshold = +data.value;

					map.fillScale(function(d) {
						if(d.turnout_pct < threshold) return '#000';
						return '#FFF';
					});
					
					mapframe.selectAll('path.area').data(mapResults)
						.call(map);
				}
			},
			axis: {
				y: {
					label: { 
						text: 'Turnout %',
						position: 'inner-bottom'
					},
					padding: {
						top: 0
					},
					max: 100,
					min: 30,
					tick: {
						format: function (x) {
							return `${x}%`;
						}
					},
				},
				x: {
					label: { 
						text: 'Election year',
					},
					tick: {
						rotate: 45,
						multiline: false,
					},
					// type: 'category',
					type: 'timeseries'
				}
			},

			grid: {
				y: {
					lines: [{
						value: brexitTurnout,
						text: `UK EU Referendum 2016`,
						position: 'end'
					}]
				}
			},
			tooltip: {
				format: {
					title: function (d) {
						let date = new Date(d);
						return  electionName[`${date.getFullYear()}${date.getMonth()}${date.getDate()}`];
					},
					value: function (value, ratio, id) {
						return `${Math.round(value)}%`;
					}
				}
			}
		});
	});
}



function updateMap() {
		map = referendumMap()
			.id(function(d){
				return d.local_id;
			})
			.fillScale(function(d){
				if(d.turnout_pct < 50) return '#000';
				return '#FFF';
			});
		
		mapframe = d3.select('.turnout-map')
			.append('svg')
				.attr('width', 400)
				.attr('height', 550);
		
		d3_queue.queue()
			.defer(d3.json, "geodata/referendum-result-areas.topojson")
			.defer(d3.json, "dummyresult/local.json")
			.await(ready);
		
		function ready( error, topology, results ){

			mapResults = results;

// sort out the data
			let uk = topojson.feature( topology, topology.objects.gb );
			let ukLand = topojson.merge( topology, topology.objects.gb.geometries.concat(topology.objects.ni.geometries).filter(function(d){
				return d.id != 'S12000027';
			}) );
			
			let londonLand = topojson.merge( topology, topology.objects.gb.geometries.filter(function(d){
				return d.properties.region == 'E12000007'; 
			}) );
			
			let shetlandLand = topojson.merge( topology, topology.objects.gb.geometries.filter(function(d){
				return d.id == 'S12000027'; 
			}) );
			
			uk.features = uk.features.concat( topojson.feature(topology, topology.objects.ni).features );

// do the drawing
			
			mapframe.append('path')
				.attr('class','land')
				.attr('d', map.land(ukLand) );
			
			mapframe.append('path')
				.attr('class','land')
				.attr('d', map.land(londonLand, 'london') );
				
			mapframe.append('path')
				.attr('class','land')
				.attr('d', map.land(shetlandLand, 'shetland') );
			
			map.features( uk.features );
			mapframe.selectAll('path.area').data(results)
				.call(map);

//on an input event from the slider change the colour scale for the map                
			// d3.select('input').on('input',function(){
			// 	let threshold = +this.value;
			// 	map.fillScale(function(d){
			// 		if(d.turnout_pct < threshold) return '#000';
			// 		return '#FFF';
			// 	});
				
			// 	mapframe.selectAll('path.area').data(results)
			// 		.call(map);
			// });


		};
};

updateMap();
