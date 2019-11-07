// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 50, left: 50},
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#densityplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

// get the data
d3.csv("shooter_age.csv", function(data) {
    var x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // add the y Axis
    var y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, 0.05]);

    svg.append("g")
        .call(d3.axisLeft(y));

    // Compute kernel density estimation
    var kde = kernelDensityEstimator(kernelEpanechnikov(1), x.ticks(50));
    var density =  kde( data.map(function(d){ return d.participant_age; }) );

    // Plot the area
    curve = svg.append("path")
        .attr("class", "mypath")
        .datum(density)
        .attr("fill", "#85d3af")
        .attr("opacity", ".8")
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("d",  d3.line()
        .curve(d3.curveBasis)
            .x(function(d) { return x(d[0]); })
            .y(function(d) { return y(d[1]); })
        );
        
    // calculate mean
    var avg = data.reduce( function(p, c) { 
        return p + Number(c.participant_age);
    }, 0 ) / data.length;

    // add mean dashed line + label
    svg.append("line")
        .attr("x1", x(avg))
        .attr("y1", 10)
        .attr("x2", x(avg))
        .attr("y2", margin.bottom + height)
        .attr("opacity", 0.7)
        .attr("stroke", "black")
        .attr("stroke-dasharray", [10, 10]);
    console.log(avg);
    svg.append("text")             
        .attr("transform", "translate(" + (x(avg)) + " ," + (5) + ")")
        .style("text-anchor", "middle")
        .style("font-size", 11)
        .style("font-family", "arial")
        .text("Mean");

    // A function that update the chart when slider is moved?
    function updateChart(binNumber) {
        // recompute density estimation
        kde = kernelDensityEstimator(kernelEpanechnikov(1), x.ticks(binNumber));
        density =  kde( data.map(function(d){  return d.participant_age; }) );

        // update the chart
        curve
            .datum(density)
            .transition()
            .duration(1000)
            .attr("d",  d3.line()
            .curve(d3.curveBasis)
                .x(function(d) { return x(d[0]); })
                .y(function(d) { return y(d[1]); })
            );
    }

    // Listen to the slider?
    d3.select("#slider").on("change", function(d){
        selectedValue = this.value
        updateChart(selectedValue)
    });
});

// text label for the x axis
svg.append("text")             
    .attr("transform",
            "translate(" + (width/2) + " ," + 
                        (height + 35) + ")")
    .style("text-anchor", "middle")
    .style("font-size", 13)
    .style("font-family", "arial helvetica")
    .text("Age");

// Function to compute density
function kernelDensityEstimator(kernel, X) {
    return function(V) {
        return X.map(function(x) {
            return [x, d3.mean(V, function(v) { return kernel(x - v); })];
        });
    };
}

function kernelEpanechnikov(k) {
    return function(v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
}