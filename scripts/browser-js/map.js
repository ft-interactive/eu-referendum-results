var topojson = require('topojson');
var d3 = require('d3');

module.exports = function (){
    console.log('hello map');
    var width = 600;
    var height = 600;
    
    var ukCenter = [300, 250];
    var londonCenter = [340, 100];
    var shetlandCenter = [40, 70]; 

    var ukProjection = d3.geo.albers()
        .center([0, 55.4])
        .rotate([0, 0])
        .parallels([50, 60])
        .scale(3000)
        .translate(ukCenter);
    
    var londonProjection = d3.geo.albers()
        .center([0, 51.4])
        .rotate([0, 0])
        .parallels([50, 60])
        .scale(13000)
        .translate(londonCenter);
    
    var shetlandProjection = d3.geo.albers()
        .center([-1.3, 60.3])
        .rotate([0, 0])
        .parallels([50, 60])
        .scale(3000)
        .translate(shetlandCenter);
    
    var fillScale = function(d){
        return '#00F';
    }

    var strokeScale = function(d){
        return '#00F';
    }
    
    var isLondon = function(d){
        return (d.region_id === 'E12000007');
    }
        
    var isShetland = function(d){
        return (d.local_id === 'S12000027');
    }
    
    var idAccessor = function(d){
        return d.id;
    }

    var ukPath = d3.geo.path()
        .projection(ukProjection);
        
    var londonPath = d3.geo.path()
        .projection(londonProjection);
        
    var shetlandPath = d3.geo.path()
        .projection(shetlandProjection);
    
    var features = {};
    var land = [];
    
    function map(parent){
        parent.enter()
            .append('path')
            .attr('class','area')
            .attr('d',function(d){
                var feature = features[ idAccessor(d) ];
                if( isLondon(d) ) {
                    return londonPath(feature)
                };
                if( isShetland(d) ){
                    return shetlandPath(feature);
                }
                return ukPath(feature);
            });
            
        parent.attr('fill',fillScale);
        parent.attr('stroke',strokeScale);
    }
    
    map.id = function(f){
        if(!f) return idAccessor;
        idAccessor = f;
        return map;
    };
    
    map.fillScale = function(f){
        if(!f) return fillScale;
        fillScale = f;
        return map;
    };

    map.strokeScale = function(f){
        if(!f) return strokeScale;
        strokeScale = f;
        return map;
    };
    
    map.features = function(a){
        if(a === undefined || a.length === undefined || a.length == 0) return features;
        a.forEach(function(d){
            features[d.id] = d;
        });
        return map;
    };
    
    map.land = function(x, projection){
        if(projection == 'london'){
            return londonPath(x);
        }
        if(projection == 'shetland'){
            return shetlandPath(x);
        }
        return ukPath(x);
    };
    
    map.londonCenter = function(a){
        if(!a) return londonCenter;
        londonCenter = a;
        return map;
    };
    
    map.shetlandCenter = function(a){
        if(!a) return shetlandCenter;
        shetlandCenter = a;
        return map;
    };
    
    return map;
};