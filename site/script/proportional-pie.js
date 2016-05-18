function proportionalPie(){
	var pie = d3.layout.pie().sort(null);

	var radiusScale = d3.scale.sqrt()
      .domain([0, 3000000])
      .range([0, 50]);

    var tickInterval = 1000000;
	var ticks = null;

	var classer = function(d,i){
		return 'segment-' + i;
	}

	var extentMarker = false; // how big could this pie have been?
	var extentAccessor = function(d){ return d.extent; }
	function chart(parent){
		parent.each(function(d){
			var arc = d3.svg.arc()
				.innerRadius(0)
				.outerRadius(radiusScale(d.total))	//based on d.total

			var anchor = d3.select(this);
			var pieData = pie(d.values);
			var labelData = pieData.map(function(p){
				return {
					angle: ((p.endAngle + p.startAngle)/2) - Math.PI/2,
					value: Math.round( (p.data/d.total)*100 )
				}
			});

			anchor.selectAll('path')
				.data(pieData)
				.enter()
					.append('path')
					.attr('d', arc)
					.attr('class', classer)

			if( tickInterval === null || ticks === null){
				var tickMarks = [];
			}else{
				tickMarks = d3.range(tickInterval, d.total + tickInterval ,tickInterval );
			}

			if(extentMarker){
				anchor.append('circle')
					.attr('class','extent')
					.attr('r',function(d){
						return radiusScale( extentAccessor(d) );
					})
					
			}

			anchor.selectAll('circle.tick') //the axes circle
				.data(tickMarks)
				.enter()
					.append('circle')
					.attr('class','tick')
					.attr('r',radiusScale);
		})
	}
	
	chart.extentAccessor = function(f){
		extentAccessor = f;
		return chart;
	}

	chart.extentMarker = function(x){
		extentMarker = x;
		return chart;
	}

	chart.totalAccessor = function(f){
		if(f==undefined){
			totalAccessor = function(d){ return d.total }
		}else{
			totalAccessor = f;
		}
		return chart;
	}
	
	chart.valuesAccessor = function(f){
		if(f==undefined){
			valuesAccessor = function(d){ return d.values }
		}else{
			valuesAccessor = f;
		}
		return chart;
	}

	chart.ticks = function(a){ //expects an array
		if(a==undefined) return ticks;
        ticks = a;
        tickInterval = null;
        return chart;
	};

	chart.tickInterval = function(x){
		if(x==undefined) return tickInterval;
		tickInterval = x;
        ticks = null;
		return chart;
	};

	chart.maxValue = function(x){
		if(x==undefined) return radiusScale.domain()[1];
		var dom = radiusScale.domain();
		dom[1] = x;
		radiusScale.domain(dom);
		return chart;
	};

	chart.maxRadius = function(x){
		if(x==undefined) return radiusScale.range()[1];
		var range = radiusScale.range();
		range[1] = x;
		radiusScale.range(range);
		return chart;
	};

	chart.radiusScale = function(x){
		return radiusScale(x);
	};

	chart.classer = function(f){ //takes a function
		if(!f) return classer;
		classer = f;
		return chart;
	};

	return chart;
}