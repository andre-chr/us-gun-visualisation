// set the dimensions and margins of the graph
var margin = {top: 30, right: 50, bottom: 70, left: 80},
    width = 900 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// define constants
var label_height = 1/4;
var mid = height/2;
var killedColour = "#d13838";
var injuredColour = "#e29c2b";

// append the svg object to the body of the page
var svgCanvas = d3.select("#barplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

// create a tooltip
var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Add y upwards axis
var up = d3.scaleLinear()
    .domain([0, 3000])
    .range([mid, 0]);
svgCanvas.append("g")
    .call(d3.axisLeft(up));

// Add y downwards axis
var down = d3.scaleLinear()
    .domain([0, 3000])
    .range([mid, height]);
svgCanvas.append("g")
    .call(d3.axisLeft(down));

// Parse the Data
d3.csv("stage3.csv", function(data) {
    var parse_date = d3.timeParse("%Y-%m-%d");
    var format_date = d3.timeFormat("%m-%Y");

    data.forEach(function(d, i) {
        d.date = format_date(parse_date(d.date));
    });

    date_sum_data = d3.nest().key(function(d){
        return d.date; 
    }).rollup(function(d){
        return {
            n_killed: d3.sum(d, function(g){ return g.n_killed; }),
            n_injured: d3.sum(d, function(g) { return g.n_injured; })
        };
    }).entries(data)
    .map(function(d){
        return { date: d.key, n_killed: d.value.n_killed, n_injured: d.value.n_injured };
    });

    var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(date_sum_data.map(function(d) { return d.date; }))
        .padding(0.01);

    var upBarChart = svgCanvas.selectAll(".upbar")
        .data(date_sum_data)
        .enter()
        .append("rect")
        .attr("class", "upbar")
        .attr("x", function(d) { return x(d.date); })
        .attr("y", function(d) { return up(0); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return 0; })
        .on("mouseover", function(thisElement, index) {
            var total = thisElement.n_killed + thisElement.n_injured;
            tooltip
                .style("opacity", 0.9)
                .html(`Month-Year: ${thisElement.date} <br/>
                    Dead: ${thisElement.n_killed}<br/>
                    Injured: ${thisElement.n_injured}<br/>
                    Total casualties: ${total}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 50) + "px");
            
            svgCanvas.selectAll(".upbar")
                .attr("opacity", 0.3);
            svgCanvas.selectAll(".downbar") 
                .filter(function(bar, i) {
                    return bar.date != thisElement.date;
                })
                .attr("opacity", 0.3)
            d3.select(this)
                .attr("opacity", 1); 
        })
        .on("mouseout", function(thisElement, index){
            tooltip.style("opacity", 0);

            // restore all bars to normal
            svgCanvas.selectAll(".upbar")
                .attr("opacity", 1);
            svgCanvas.selectAll(".downbar")
                .attr("opacity", 1);
        });

    var downBarChart = svgCanvas.selectAll(".downbar")
        .data(date_sum_data)
        .enter()
        .append("rect")
        .attr("class", "downbar")
        .attr("x", function(d) { return x(d.date); })
        .attr("y", function(d) { return mid + 1; })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return 0; })
        .on("mouseover", function(thisElement, index) {
            var total = thisElement.n_killed + thisElement.n_injured;
            tooltip
                .style("opacity", 0.9)
                .html(`Month-Year: ${thisElement.date} <br/>
                    Dead: ${thisElement.n_killed}<br/>
                    Injured: ${thisElement.n_injured}<br/>
                    Total casualties: ${total}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 50) + "px");

            svgCanvas.selectAll(".downbar")
                .attr("opacity", 0.3);
            svgCanvas.selectAll(".upbar") 
                .filter(function(bar, i) {
                    return bar.date != thisElement.date;
                })
                .attr("opacity", 0.3)
            d3.select(this)
                .attr("opacity", 1); 
        })
        .on("mouseout", function(thisElement, index){
            tooltip.style("opacity", 0);

            // restore all bars to normal
            svgCanvas.selectAll(".upbar")
                .attr("opacity", 1);
            svgCanvas.selectAll(".downbar")
                .attr("opacity", 1);
        });

    upBarChart
        .transition()
        .duration(1800)
        .attr("fill", killedColour)
        .attr("y", function(d) { return up(d.n_killed); })
        .attr("height", function(d) { return mid - up(d.n_killed) - 0.5; })
        .delay(function(d,i){ return(i * 50) });

    downBarChart
        .transition()
        .duration(1800)
        .attr("fill", injuredColour)
        .attr("y", function(d) { return mid + 1.5; })
        .attr("height", function(d) { return down(d.n_injured) - mid; })
        .delay(function(d,i){ return(i * 50) });
    
    svgCanvas.append("g")
        .attr("transform", "translate(0," + mid + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // text label for the x axis
    svgCanvas.append("text")             
        .attr("transform",
                "translate(" + (width + 25) + " ," + 
                            (height/2 + 10) + ")")
        .style("text-anchor", "middle")
        .text("Time");

    // text label 1 for the y axis
    svgCanvas.append("text")
        .attr("id", "upLabel")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 10)
        .attr("x", 0 - (height * label_height))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Killed"); 

    // text label 2 for the y axis
    svgCanvas.append("text")
        .attr("id", "downLabel")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 10)
        .attr("x", 0 - (height * (1-label_height)))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Injured");
})

var killedUpBar = true;
var switchAxes = function() {
    // negate boolean control var
    killedUpBar = !killedUpBar;

    // switch negative axis to positive axis
    svgCanvas.selectAll(".upbar")
        .transition()
        .duration(1800)
        .attr("fill", (killedUpBar ? killedColour : injuredColour ))
        .attr("y", function(d) { return up(killedUpBar ? d.n_killed : d.n_injured); })
        .attr("height", function(d) { 
            return mid - up(killedUpBar ? d.n_killed : d.n_injured) - 0.5; 
        })
        .delay(function(d,i){ return(i * 50) });

    // switch positive axis to negative axis
    svgCanvas.selectAll(".downbar")
        .transition()
        .duration(1800)
        .attr("fill", (killedUpBar ? injuredColour : killedColour ))
        .attr("y", function(d) { return mid + 1.5; })
        .attr("height", function(d) {  
            return down(killedUpBar ? d.n_injured : d.n_killed) - mid; 
        })
        .delay(function(d,i){ return(i * 50) });

    // switch axis label
    svgCanvas.select("#upLabel")
        .text(killedUpBar ? "Killed" : "Injured");

    svgCanvas.select("#downLabel")
        .text(killedUpBar ? "Injured" : "Killed");
}

d3.select("#switchButton").on("onclick", switchAxes)
