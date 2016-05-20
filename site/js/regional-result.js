console.log('regional results');

d3.json('dummyresult/regional.json', drawRegionalResultTable);

function drawRegionalResultTable(results){
    var dataJoin = d3.select('.regional-result')
        .append('table')
            .selectAll('tr')
        .data(results)
        .call(function(join){
            var rows = join.enter()
                .append('tr')
            // etc...
        });
        
}