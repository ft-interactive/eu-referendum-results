function referendumMap(){
    var width = 600;
    var height = 600;
    
    var ukCenter = [300,300];
    var londonCenter = [400,150];
    var shetlandCenter = [400,50]; 
   
    var ukProjection = d3.geo.albers()
        .center([0, 55.4])
        .rotate([0, 0])
        .parallels([50, 60])
        .scale(6000)
        .translate(ukCenter);
    
    var londonProjection = d3.geo.albers()
        .center([0, 51.4])
        .rotate([0, 0])
        .parallels([50, 60])
        .scale(20000)
        .translate(londonCenter);
    
    var shetlandProjection = d3.geo.albers()
        .center([-1.3, 60.3])
        .rotate([0, 0])
        .parallels([50, 60])
        .scale(20000)
        .translate(shetlandCenter);
        
    var isLondon = function(d){
        return (d.properties.region === 'E12000007');
    }
        
    var isShetland = function(d){
        return (d.id === 'S12000027');
    }

    var path = d3.geo.path()
        .projection(ukProjection);
    
    var areas = []; 
    
    function map(parent){
        parent.append('g')
            .attr('class','main-map');
        
        parent.append('g')
            .attr('class','london-map');
            
        parent.append('g')
            .attr('class','shetland-map');    
    }
    
    return map;
}