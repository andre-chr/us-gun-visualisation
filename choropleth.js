// set the dimensions and margins of the graph
var margin = {top: 30, right: 50, bottom: 70, left: 80},
    width = 900 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

// define choropleth map colour range limits
var low_colour = "#fff",
    high_colour = "#000080";

// define dropdown variables
var year_options = ["2017", "2016", "2015", "2014"];
var changeYear, 
    selectedYear = "2017";

// create dropdown button
var dropdownButton = d3.select("#choroplethMap")
    .append('select');

// define options for dropdown button
dropdownButton 
    .selectAll('myOptions') // Next 4 lines add 6 options = 6 colors
    .data(year_options)
    .enter()
    .append('option')
    .text(function (d) { 
        return d; }) // text showed in the menu
    .attr("value", function (d) { return d; });

var svg = d3.select("#choroplethMap")
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

var path = d3.geoPath();

d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
    if (error) throw error;

    d3.csv("state_gun_rate.csv", function(error, data) {
        if (error) throw error;

        var years = ["2014", "2015", "2016", "2017"]
        var min_val = Infinity, 
            max_val = 0;
        data.forEach(function(item) {
            years.forEach(function(year) {
                if (Number(item[year]) < Number(min_val)) min_val = item[year];
                if (Number(item[year]) > Number(max_val)) max_val = item[year];  
            });
        });

        // define colour range
        var colour = d3.scaleLinear()
            .domain([min_val, max_val])
            .range([low_colour, high_colour]);

        // draw states
        svg.append("g")
            .attr("class", "states")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", function(d) {
                var state_element = data.find(function(element) {
                    return element.id == d.id;
                });
                var col = state_element ? colour(state_element[selectedYear]) : "#fff"; 
                return col;
            })
            .attr("stroke", "#000")
            .on("mouseover", function(d, i) {
                var state_element = data.find(function(element) {
                    return element.id == d.id;
                });
                if (state_element) {
                    tooltip
                        .style("opacity", 1)
                        .html(`State: ${state_element.state} <br/>
                            Gun incidents/day: ${Number(state_element[selectedYear]).toFixed(2)}<br/>`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 25) + "px");
                }
            })
            .on("mouseout", function(d, i) {
                tooltip.style("opacity", 0);
            });

        // define legend constants
        var legend_data = [],
            divisions = 50,
            legend_width = 200,
            section_width = Math.floor(legend_width / divisions);

        for (var i=0; i < legend_width; i+= section_width ) {
            legend_data.push(i);
        }

        var color_scaleLin = d3.scaleLinear()
                .domain([0, legend_data.length-1])
                .interpolate(d3.interpolateLab)
                .range([low_colour, high_colour]);

        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(550, 600)");
        
        // create legend colours
        legend.selectAll('rect')
            .data(legend_data)
            .enter()
            .append("rect")
                .attr("x", function(d) { return d; })
                .attr("y", 10)
                .attr("height", 10)
                .attr("width", section_width)
                .attr("stroke", "#000")
                .attr('fill', function(d, i) { return color_scaleLin(i)});

        // add min label for legend
        legend.append("text")
            .text(function() {
                return Math.floor(min_val);
            })
            .attr("transform", "translate(0,0)")
            .style("font-size", "14px");
        
        // add max label for legend
        legend.append("text")
            .text("Average number of gun incidents/day")
            .attr("transform", "translate(" + 17 + ", 0)")
            .attr("font-size", "10px");

        // add legend title
        legend.append("text")
            .text(function() {
                return Math.ceil(max_val);
            })
            .attr("transform", "translate(" + (legend_width - 10) + ", 0)")
            .style("font-size", "14px");

        // function to handle dropdown changes
        changeYear = function(year) {
            selectedYear = year;
            svg.selectAll("path")
                .attr("fill", function(d) {
                    var state_element = data.find(function(element) {
                        return element.id == d.id;
                    });

                    var col = state_element ? colour(state_element[year]) : "#fff"; 
                    return col;
                })
        }
    });
});

// When the button is changed, run the updateChart function
dropdownButton.on("change", function(d) {

    // recover the option that has been chosen
    var selectedOption = d3.select(this).property("value");

    changeYear(selectedOption);
})