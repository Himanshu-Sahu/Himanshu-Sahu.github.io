d3.queue()
.defer(d3.csv, "CBR_Main.csv")
.defer(d3.csv, "DD_Main.csv")
.defer(d3.csv, "RAPE_Main.csv")
.await(ready);

function ready(error, data, data1, data2) {
    var margin = { top: 20,
        right: 150,
        bottom: 30,
        left: 50},
    width = document.documentElement.clientWidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    var svg = d3.select("#line_chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "CrimeGroup").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var div = d3.select("body").append("div")	
.attr("class", "tooltip")				
.style("opacity", 0);

var parseTime = d3.timeParse("%Y");

var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory20);

var line = d3.line()
    .x(function (d) {
        return x(d.Year);
    })
    .y(function (d) {
        return y(d.Crime);
    })
    .curve(d3.curveNatural);

if (error) throw error;


var Rape = [{
    type: "Rape",
    content: data2.map(function (id) {
        return {
            id: id.STATE,
            values: data2.columns.slice(1).map(function (d) {
                return {
                    Year: parseTime(d),
                    Crime: +id[d]
                }
            })
        }
    })
}];

var Dowry = [{
    type: "Dowry",
    content: data1.map(function (id) {
        return {
            id: id.STATE,
            values: data1.columns.slice(1).map(function (d) {
                return {
                    Year: parseTime(d),
                    Crime: +id[d]
                }
            })
        }
    })
}];
var Cruelty = [{
    type: "Cruelty",
    content: data.map(function (id) {
        return {
            id: id.STATE,
            values: data.columns.slice(1).map(function (d) {
                return {
                    Year: parseTime(d),
                    Crime: +id[d]
                }
            })
        }
    })
}];

CrimeTypeData = d3.merge([Rape, Dowry, Cruelty]);

var CrimeMenu = d3.select("#crimeDropdown")
    .append("select")
    .selectAll("option")
    .data(CrimeTypeData)
    .enter()
    .append("option")
    .attr("value", function (d) {
        return d.type;
    })
    .text(function (d) {
        return d.type;
    });

var initialGraph = function (crime) {

    var selectCrime = CrimeTypeData.filter(function (d) {
        return d.type == crime;
    });

    var crime = selectCrime[0].content.map(function (d) {
        return {
            id: d.id,
            values: d.values
        }
    });

    x.domain([
        d3.min(CrimeTypeData, function (c) {
            return d3.min(c.content, function (d) {
                return d3.min(d.values, function (e) {
                    return e.Year;
                })
            });
        }),
        d3.max(CrimeTypeData, function (c) {
            return d3.max(c.content, function (d) {
                return d3.max(d.values, function (e) {
                    return e.Year;
                })
            });
        }),
    ]);
    y.domain([
        d3.min(crime, function (c) {
            return d3.min(c.values, function (e) {
                return e.Crime;
            });
        }),
        d3.max(crime, function (c) {
            return d3.max(c.values, function (e) {
                return e.Crime;
            });
        }),
    ]);
    z.domain(CrimeTypeData.map(function (c) {
        return c.type;
    }));
    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
            .ticks(16));


    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("fill", "#000")
        .text("Crime");

    var state = g.selectAll(".state")
        .data(crime)
        .enter().append("g")
        .attr("class", "state");


    state.append("path")
        .attr("class", "line")
        .attr("d", function (d) {
            return line(d.values);
        })
        .style("stroke", function (d) {
            return z(d.id);
        });

    state.append("text")
        .data(crime)
        .attr("class", "name")
        .attr("transform", function (d) {
            return "translate(" + x(d.values[15].Year) + "," + y(d.values[15].Crime) + ")";
        })
        .attr("x", 2)
        .attr("dy", "0.5em")
        .style("font", "15px sans-serif")
        .text(function (d) {
            return d.id;
        })
        .style("fill", function (d) {
            return z(d.id);
        });

    let a = [];
    crime.map(function (d, i) {
        d.values.forEach(function (point) {
            a.push({
                'index': point.Year,
                'point': point.Crime,
                'State': d.id
            });
        })
        return a;
    });
  var dots =  svg.selectAll('.dot')
        .data(a)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 2.5)
        .attr("transform", function (d) {
            return "translate(" + +(x(d.index) + 50) + "," + +(y(d.point) + 20) + ")";
        })
        .style("stroke",function(d){return z(d.State)})                    
        .on("mouseover", function(d) {		
div.transition()		
    .duration(100)		
    .style("opacity",0.8);		
div	.html("Case Reported in " +"<br/>"+d.State + " : " + d.point)	
    .style("left", (d3.event.pageX) + "px")		
    .style("top", (d3.event.pageY - 28) + "px");	
})					
.on("mouseout", function(d) {		
div.transition()		
    .duration(200)		
    .style("opacity", 0);	
});  
};

initialGraph("Rape");

var menu = document.getElementById("CrimeDropDown");
menu.addEventListener('change', function () {
    var selectCrime = CrimeTypeData.filter(function (d) {
        return d.type == document.getElementById("CrimeDropDown").value;
    });
    var crime = selectCrime[0].content.map(function (d) {
        return {
            id: d.id,
            values: d.values,
        }
    });
    y.domain([
        d3.min(crime, function (c) {
            return d3.min(c.values, function (e) {
                return e.Crime;
            });
        }),
        d3.max(crime, function (c) {
            return d3.max(c.values, function (e) {
                return e.Crime;
            });
        }),
    ]);

    var state = d3.selectAll(".CrimeGroup")
        .data(crime);
    state.selectAll("path.line")
        .data(crime)
        .transition()
        .duration(1000)
        .attr("d", function (d) {
            return line(d.values);
        });

    state.selectAll(".axis--y")
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y));
    state.selectAll("text.name")
        .data(crime)
        .transition()
        .duration(1000)
        .attr("transform", function (d) {
            return "translate(" + x(d.values[15].Year) + "," + y(d.values[15].Crime) + ")";
        })
        .attr("x", 1)
        .attr("dy", "0.5em");

    let a = [];
    crime.map(function (d) {
        d.values.forEach(function (point, index) {
            a.push({
                'index': point.Year,
                'point': point.Crime,
                 'State': d.id

            });
        })
        return a;
    });
    svg.selectAll('.dot')
        .data(a)
        .transition()
        .duration(1000)
        .attr("transform", function (d) {
            return "translate(" + +(x(d.index) + 50) + "," + +(y(d.point) + 20) + ")";
        });

}, {
    passive: true
});
};