window.onload = () => {

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
            else {
                entry.target.classList.remove("show");
            }
        })
    })

    const hiddenElements = document.querySelectorAll(".hidden");
    hiddenElements.forEach((el) => observer.observe(el));

    const initializeLinegraph = (myDataset) => {

        // set the dimensions and margins of the graph
        const margin = { top: 10, right: 100, bottom: 30, left: 30 },
            width = 1000 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        const svg = d3.select("#country_energy_by_year")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left + 10},${margin.top + 10})`);

        const allGroup = ["Singapore", "China", "Japan", "Philippines", "Indonesia", "Thailand", "Korea", "Vietnam", "Malaysia"]
        const dataReady = myDataset;
        const myColor = d3.scaleOrdinal()
            .domain(allGroup)
            .range(d3.schemeCategory10);

        // Add X axis --> it is a date format
        const x = d3.scaleTime()
            .domain([new Date(2012), new Date(2019)])
            .range([0, width])

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).tickFormat(function (d) {
                return d3.format(".0f")(d / 1);
            }));

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, 45])
            .range([height, 0]);

        svg.append("g")
            .call(d3.axisLeft(y));

        var ylabel = svg.append("g")
            .attr("transform", `translate(-30,250)`);

        ylabel
            .append("text")
            .attr("font-size", 12)
            .text("% of total final energy consumption")
            .style("transform", `rotate(270deg)`);

        // Add the lines
        const line = d3.line()
            .x(d => x(+d.year))
            .y(d => y(+d.value))
        svg.selectAll("myLines")
            .data(dataReady)
            .join("path")
            .attr("class", d => d.name)
            .attr("d", d => {
                return line(d.values)
            })
            .attr("stroke", d => {
                return myColor(d.name)
            })
            .style("stroke-width", 4)
            .style("fill", "none")

        // Add the points
        svg
            // First we need to enter in a group
            .selectAll("myDots")
            .data(dataReady)
            .join('g')
            .style("fill", d => myColor(d.name))
            .attr("class", d => d.name)
            // Second we need to enter in the 'values' part of this group
            .selectAll("myPoints")
            .data(d => d.values)
            .join("circle")
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d.value))
            .attr("r", 5)
            .attr("stroke", "white")

        // Add a label at the end of each line
        svg
            .selectAll("myLabels")
            .data(dataReady)
            .join('g')
            .append("text")
            .attr("class", d => d.name)
            .datum(d => { return { name: d.name, value: d.values[d.values.length - 1] }; }) // keep only the last value of each time series
            .attr("transform", d => `translate(${x(d.value.year)},${y(d.value.value)})`) // Put the text at the position of the last point
            .attr("x", 12) // shift the text a bit more right
            .text(d => d.name)
            .style("fill", d => myColor(d.name))
            .style("font-size", 15)

        d3.select("#button_placeholder")
            .selectAll("input")
            .data(allGroup)
            .enter()
            .append("input")
            .attr("type", "button")
            .attr("class", "btn mx-1")
            .attr("value", (d) => { return d; })
            .style("font-weight", 500)
            .style("color", "white")
            .style("background-color", (d) => {
                return myColor(d)
            })
            .on("click", (event, d) => {
                currentOpacity = d3.selectAll("." + d).style("opacity")
                d3.selectAll("." + d).transition().style("opacity", currentOpacity == 1 ? 0 : 1)
            })
    }

    const initializeSingaporeEnergyProduction = (myDataset) => {

        var tags = Object.keys(myDataset[0].values);

        const margin = { top: 10, right: 100, bottom: 30, left: 30 },
            w = 650 - margin.left - margin.right,
            h = 400 - margin.top - margin.bottom;
        var stacked = d3.stack()
            .value((obj, key) => {
                return obj.values[key]
            })
            .keys(["CCGT", "Biofuel", "SolarPV", "SteamTurbine", "GasTurbine"])
        var series = stacked(myDataset);
        var svg = d3.select("#stacked-singapore-production")
            .append("svg")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom)
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
        var color = d3.scaleOrdinal(d3.schemeCategory10)
        var groups = svg.selectAll("g")
            .data(series)
            .enter()
            .append("g")
            .style("fill", (d, i) => {
                return color(i);
            })

        // x-axis for time
        var xScale = d3.scaleTime()
            .domain([new Date(2011), new Date(2022)])
            .range([0, w])

        svg.append("g")
            .attr("transform", `translate(50, ${h})`)
            .call(d3.axisBottom(xScale).tickFormat((d) => {
                return d3.format(".0f")(d / 1);
            }));

        // y axis for production joules
        var yScale = d3.scaleLinear()
            .domain([0, 20000])
            .range([h, 0])

        svg.append("g")
            .call(d3.axisLeft(yScale))
            .attr("transform", `translate(50,0)`);

        var ylabel = svg.append("g")
            .attr("transform", `translate(8,380)`);

        ylabel
            .append("text")
            .attr("font-size", 12)
            .text("Electricity Generation Capacity by Technology Type in MW (Megawatts)")
            .style("transform", `rotate(270deg)`);

        // stacked bars
        groups.selectAll("rect")
            .data((d) => d)
            .enter()
            .append("rect")
            .attr("transform", `translate(50, 0)`)
            .attr('width', 40)
            .attr('y', (d) => yScale(d[1]))
            .attr('x', (d) => {
                return xScale(d.data.year) - 20
            })
            .attr('height', (d) => yScale(d[0]) - yScale(d[1]))

        groups.selectAll("rect")
            .on("mouseover", function (_, d) {
                var xPos = parseFloat(d3.select(this).attr("x"));
                var yPos = parseFloat(d3.select(this).attr("y"));

                d3.select(this)
                    .attr("stroke", "blue")
                    .attr("stroke-width", 0.8)

                svg.append("text")
                    .attr("id", "tooltip")
                    .attr("text-anchor", "middle")
                    .attr("font-size", 12)
                    .attr("x", xPos + 70)
                    .attr("y", yPos - 50)
                    .text(parseFloat(d[1]).toFixed(".2f"))
            })
            .on("mouseout", function () {
                svg.select("#tooltip").remove();
                d3.select(this).attr("stroke", "pink").attr("stroke-width", 0.2);

            })


        var legend = svg.append('g')
            .attr('transform', `translate(50, 50)`)

        legend.selectAll('rect')
            .data(color.domain().slice().reverse())
            .enter()
            .append('rect')
            .attr('x', (_, i) => i * 90 + 20)
            .attr('y', () => 0)
            .attr('width', 12)
            .attr('height', 12)
            .attr('fill', (_, i) => {
                return color(i);
            });

        legend.selectAll("text")
            .data(tags)
            .enter()
            .append("text")
            .text((d) => d)
            .attr("font-size", 12)
            .attr('x', (_, i) => i * 90 + 20)
            .attr('y', -10)
    }

    const singaporeMapSolarPVInstallation = (json, data) => {
        var w = 700;
        var h = 300;
        let regions = [
            {
                region: "north",
                states: [
                    "SEMBAWANG",
                    "YISHUN",
                    "SUNGEI KADUT",
                    "CENTRAL WATER CATCHMENT",
                    "MANDAI",
                    "SUNGEI KADUTd",
                    "LIM CHU KANG",
                    "WOODLANDS",
                    "SIMPANG",
                ]
            },
            {
                region: "east",
                states: [
                    "BEDOK",
                    "CHANGI",
                    "CHANGI BAY",
                    "TAMPINES",
                    "PAYA LEBAR",
                    "TEMPINES",
                    "PASIR RIS"
                ]
            },
            {
                region: "north-east",
                states: [
                    "SELETAR",
                    "PUNGGOL",
                    "HOUGANG",
                    "ANG MO KIO",
                    "SERANGOON",
                    "SENGKANG",
                    "NORTH-EASTERN ISLANDS"
                ]
            },
            {
                region: "west",
                states: [
                    "BOON LAY",
                    "BUKIT BATOK",
                    "CLEMENTI",
                    "BUKIT PANJANG",
                    "JURONG EAST",
                    "TUAS",
                    "WESTERN ISLANDS",
                    "WESTERN WATER CATCHMENT",
                    "PIONEER",
                    "TUAS",
                    "CHOA CHU KANG",
                    "TENGAH",
                    "JURONG WEST",
                    "RIVER VALLEY"
                ]
            },
            {
                region: "central",
                states: [
                    "BISHAN",
                    "ROCHOR",
                    "OUTRAM",
                    "MUSEUM",
                    "MARINA EAST",
                    "MARINA SOUTH",
                    "BUKIT MERAH",
                    "BUKIT TIMAH",
                    "GEYLANG",
                    "KALLANG",
                    "MARINE PARADE",
                    "NOVENA",
                    "QUEENSTOWN",
                    "SOUTHERN ISLANDS",
                    "TANGLIN",
                    "TOA PAYOH",
                    "ORCHARD",
                    "NEWTON",
                    "SINGAPORE RIVER",
                    "DOWNTOWN CORE"
                ]
            },
        ]

        data.forEach((res) => {
            json.features.forEach((state) => {
                let statename = state.properties.name;
                regions.forEach((item) => {
                    if (item.region.toUpperCase() == res.region.toUpperCase() && item.states.includes(statename)) {
                        state.properties.installations = res.installed;
                        state.properties.capacity = res.capacity;
                        state.properties.region = item.region.toUpperCase();
                    }
                })
            })
        })

        var svg = d3.select("#myMap")
            .append("svg")
            .attr("fill", "grey")
            .attr("width", w)
            .attr("height", h);

        var projection = d3.geoMercator()
            .fitSize([w, h], json)

        var geoPath = d3.geoPath(projection);

        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", geoPath)
            .on("mouseover", function (event, d) {

                var xPosition = d3.select(this).attr("posX");
                var yPosition = d3.select(this).attr("posY");

                let tooltip = svg.append("g")
                    .attr("id", "tooltip-singapore-map")

                let items = ["name", "capacity", "region", "installations"]
                let count = 0;
                items.forEach((element) => {
                    tooltip
                        .append("text")
                        .text(`${element.toUpperCase()}: ${d.properties[element]}`)
                        .style("color", "black")
                        .style("font-size", 18)
                        .attr("x", xPosition + 400)
                        .attr("y", (yPosition + h) - count)
                    count += 20
                })

                var hover = d3.select(this)
                    .attr("class", "state")
                    .attr("fill", "orange")
                    .attr("cursor", "pointer")
                    .transition()
            })
            .on("mouseout", function (event, d) {
                svg.select("#tooltip-singapore-map").remove();
                d3.select(this)
                    .attr("class", "state")
                    .attr("fill", "grey")
            })
    }

    const LineChart = (data, {
        x = ([x]) => x, // given d in data, returns the (temporal) x-value
        y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
        z = () => 1, // given d in data, returns the (categorical) z-value
        title, // given d in data, returns the title text
        defined, // for gaps in data
        curve = d3.curveLinear, // method of interpolation between points
        marginTop = 20, // top margin, in pixels
        marginRight = 30, // right margin, in pixels
        marginBottom = 30, // bottom margin, in pixels
        marginLeft = 40, // left margin, in pixels
        width = 640, // outer width, in pixels
        height = 400, // outer height, in pixels
        xType = d3.scaleUtc, // type of x-scale
        xDomain, // [xmin, xmax]
        xRange = [marginLeft, width - marginRight], // [left, right]
        yType = d3.scaleLinear, // type of y-scale
        yDomain, // [ymin, ymax]
        yRange = [height - marginBottom, marginTop], // [bottom, top]
        yFormat, // a format specifier string for the y-axis
        yLabel, // a label for the y-axis
        zDomain, // array of z-values
        color = "currentColor", // stroke color of line, as a constant or a function of *z*
        strokeLinecap, // stroke line cap of line
        strokeLinejoin, // stroke line join of line
        strokeWidth = 1.5, // stroke width of line
        strokeOpacity, // stroke opacity of line
        mixBlendMode = "multiply", // blend mode of lines
        voronoi // show a Voronoi overlay? (for debugging)
    } = {}) => {
        // Compute values.
        const X = d3.map(data, x);
        const Y = d3.map(data, y);
        const Z = d3.map(data, z);
        const O = d3.map(data, d => d);
        if (defined === undefined) defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i]);
        const D = d3.map(data, defined);

        // Compute default domains, and unique the z-domain.
        if (xDomain === undefined) xDomain = d3.extent(X);
        if (yDomain === undefined) yDomain = [0, d3.max(Y, d => typeof d === "string" ? +d : d)];
        if (zDomain === undefined) zDomain = Z;
        zDomain = new d3.InternSet(zDomain);

        // Omit any data not present in the z-domain.
        const I = d3.range(X.length).filter(i => zDomain.has(Z[i]));

        // Construct scales and axes.
        const xScale = xType(xDomain, xRange);
        const yScale = yType(yDomain, yRange);
        const xAxis = d3.axisBottom(xScale)
            .tickFormat(function (d) {
                return d3.format(".0f")(d);
            });
        const yAxis = d3.axisLeft(yScale).ticks(height / 60, yFormat);

        // Compute titles.
        const T = title === undefined ? Z : title === null ? null : d3.map(data, title);

        // Construct a line generator.
        const line = d3.line()
            .defined(i => D[i])
            .curve(curve)
            .x(i => xScale(X[i]))
            .y(i => yScale(Y[i]));

        const svg = d3.select("#solar_power_capacity_by_countries")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .on("pointerenter", pointerentered)
            .on("pointermove", pointermoved)
            .on("pointerleave", pointerleft)
            .on("touchstart", event => event.preventDefault())

        if (voronoi) svg.append("path")
            .attr("fill", "none")
            .attr("stroke", "#ccc")
            .attr("d", d3.Delaunay
                .from(I, i => xScale(X[i]), i => yScale(Y[i]))
                .voronoi([0, 0, width, height])
                .render());

        // x-axis
        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(xAxis);

        // y-axis
        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(yAxis)
            .call(g => g.select(".domain").remove())
            .call(voronoi ? () => { } : g => g.selectAll(".tick line").clone()
                .attr("x2", width - marginLeft - marginRight)
                .attr("stroke-opacity", 0.1))
            .call(g => g.append("text")
                .attr("x", (marginRight - marginLeft) - 30)
                .attr("y", 10)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start")
                .text(yLabel));

        const path = svg.append("g")
            .attr("fill", "none")
            .attr("stroke", typeof color === "string" ? color : null)
            .attr("stroke-linecap", strokeLinecap)
            .attr("stroke-linejoin", strokeLinejoin)
            .attr("stroke-width", strokeWidth)
            .attr("stroke-opacity", strokeOpacity)
            .selectAll("path")
            .data(d3.group(I, i => Z[i]))
            .join("path")
            .style("mix-blend-mode", mixBlendMode)
            .attr("stroke", typeof color === "function" ? ([z]) => color(z) : null)
            .attr("d", ([, I]) => line(I));

        const dot = svg.append("g")
            .attr("display", "none");

        dot.append("circle")
            .attr("r", 5.0);

        // hover tooltip
        dot.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 12)
            .attr("text-anchor", "middle")
            .attr("y", -8)
            .attr("x", -15);

        function pointermoved(event) {
            const [xm, ym] = d3.pointer(event);
            const i = d3.least(I, i => Math.hypot(xScale(X[i]) - xm, yScale(Y[i]) - ym)); // closest point
            path.style("stroke", ([z]) => Z[i] === z ? null : "#ddd").filter(([z]) => Z[i] === z).raise();
            dot.attr("transform", `translate(${xScale(X[i])},${yScale(Y[i])})`);
            if (T) {
                dot
                    .select("text")
                    .text(`Country: ${T[i]}, Value: ${Y[i]}, Year: ${X[i]}`);
            }
            svg.property("value", O[i]).dispatch("input", { bubbles: true });
        }

        function pointerentered() {
            path.style("mix-blend-mode", null).style("stroke", "#ddd");
            dot.attr("display", null);
        }

        function pointerleft() {
            path.style("mix-blend-mode", mixBlendMode).style("stroke", null);
            dot.attr("display", "none");
            svg.node().value = null;
            svg.dispatch("input", { bubbles: true });
        }
        return Object.assign(svg.node(), { value: null });
    }

    const generateDoughnut = (disp_data) => {

        var year = 2021
        var width = 550;
        var height = 550;
        var radius = 200;

        var myData = disp_data.filter((d) => {
            return d.year == 2021
        })

        // define color for each catogory
        var color = d3.scaleOrdinal(d3.schemeCategory10);

        // defines the arc of the pie cart
        var arc = d3.arc()
            .innerRadius(radius + 50)
            .outerRadius(radius)

        // define d3 pie chart object
        var pie = d3.pie()
            .value(d => d.value)
            .sort(d => d.name)

        // selects myPieChart area from html.
        var svg = d3.select("#doughnut_chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height)

        // appends pie chart to svg
        var arcs = svg.selectAll("g.arc")
            .data(pie(myData))
            .enter()
            .append("g")
            .attr("class", "arc")
            .attr("transform", `translate(${width / 2},${height / 2})`)
            .append("path")
            .attr("fill", function (d, i) {
                return color(i);
            })
            .attr("d", function (d, i) {
                return arc(d, i)
            })
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .attr("opacity", 0.7)
            })
            .on("mouseout", function (event, d) {
                d3.select(this)
                    .attr("opacity", 1)
            })
            .append("title")
            .text((d) => {
                return `${d.data.name} ${d.data.value} MW`
            })

        svg.selectAll("rect")
            .data(myData)
            .enter()
            .append("rect")
            .attr("fill", (_, i) => {
                return color(i)
            })
            .attr('width', 20)
            .attr('height', 20)
            .attr('x', 200)
            .attr('y', (_, i) => {
                return (i + 4) * 48;
            })

        svg.selectAll("text.second")
            .data(myData)
            .enter()
            .append("text")
            .text((d) => {
                return d.name
            })
            .attr("font-size", 12)
            .attr('x', 250)
            .attr('y', (_, i) => {
                return (i + 4) * 50;
            })

        d3.select("#piechart_button_placeholder")
            .selectAll("input")
            .data(["2021", "2020", "2019"])
            .enter()
            .append("input")
            .attr("type", "button")
            .attr("class", "btn btn-success mx-1")
            .attr("value", (d) => {
                return d;
            })
            .style("font-weight", 500)
            .on("click", (_, d) => {

                year = parseInt(d);

                if (year == 2021) {
                    myData = disp_data.filter((d) => {
                        return d.year == 2021
                    })
                } else if (year == 2020) {
                    myData = disp_data.filter((d) => {
                        return d.year == 2020
                    })
                } else {
                    myData = disp_data.filter((d) => {
                        return d.year == 2019
                    })
                }

                // appends pie chart to svg
                var arcs = svg.selectAll("g.arc")
                    .data(pie([]))
                    .join("g");

                arcs = svg.selectAll("g.arc")
                    .data(pie(myData))
                    .join("g");

                arcs.merge(arcs)
                    .attr("class", "arc")
                    .attr("transform", `translate(${width / 2},${height / 2})`)
                    .append("path")
                    .attr("fill", function (d, i) {
                        return color(i);
                    })
                    .attr("d", function (d, i) {
                        return arc(d, i)
                    })
                    .on("mouseover", function (event, d) {
                        d3.select(this)
                            .attr("opacity", 0.7)
                    })
                    .on("mouseout", function (event, d) {
                        d3.select(this)
                            .attr("opacity", 1)
                    })
                    .append("title")
                    .text((d) => {
                        return `${d.data.name} ${d.data.value} MW`
                    })
            })
    }

    d3.csv("../data/singapore/ses_singapore/ses_areas.csv", (d) => {
        return {
            name: d.areas,
            value: parseFloat(d.unit),
            year: parseInt(d.year)
        }
    }).then((data) => {
        generateDoughnut(data);
    })

    const generateDoughnutSingaporeTotalCapacity = (disp_data) => {
        var year = 2021
        var width = 550;
        var height = 550;
        var radius = 200;

        var myData = disp_data.filter((d) => {
            return d.year == 2021
        })

        // define color for each catogory
        var color = d3.scaleOrdinal(d3.schemeCategory10);

        // defines the arc of the pie cart
        var arc = d3.arc()
            .innerRadius(radius + 50)
            .outerRadius(radius)

        // define d3 pie chart object
        var pie = d3.pie()
            .value(d => d.value)
            .sort(d => d.name)

        // selects myPieChart area from html.
        var svg = d3.select("#doughnut-singapore-production")
            .append("svg")
            .attr("width", width)
            .attr("height", height)

        // appends pie chart to svg
        var arcs = svg.selectAll("g.arc")
            .data(pie(myData))
            .enter()
            .append("g")
            .attr("class", "arc")
            .attr("transform", `translate(${width / 2},${height / 2})`)
            .append("path")
            .attr("fill", function (d, i) {
                return color(i);
            })
            .attr("d", function (d, i) {
                return arc(d, i)
            })
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .attr("opacity", 0.7)
            })
            .on("mouseout", function (event, d) {
                d3.select(this)
                    .attr("opacity", 1)
            })
            .append("title")
            .text((d) => {
                return `${d.data.name} ${d.data.value} MW covers only ${d3.format(".1%")(d.value / d3.sum(pie(myData), d => d.value))}`
            })

        svg.selectAll("rect")
            .data(myData)
            .enter()
            .append("rect")
            .attr("fill", (_, i) => {
                return color(i)
            })
            .attr('width', 20)
            .attr('height', 20)
            .attr('x', 200)
            .attr('y', (_, i) => {
                return (i + 4) * 48;
            })

        svg.selectAll("text.second")
            .data(myData)
            .enter()
            .append("text")
            .text((d) => {
                return d.name
            })
            .attr("font-size", 12)
            .attr('x', 250)
            .attr('y', (_, i) => {
                return (i + 4) * 50;
            })

        d3.select("#doughnut-singapore-production-input")
            .selectAll("input")
            .data(["2021", "2020", "2019"])
            .enter()
            .append("input")
            .attr("type", "button")
            .attr("class", "btn btn-success mx-1")
            .attr("value", (d) => {
                return d;
            })
            .style("font-weight", 500)
            .on("click", (_, d) => {

                year = parseInt(d);

                if (year == 2021) {
                    myData = disp_data.filter((d) => {
                        return d.year == 2021
                    })
                } else if (year == 2020) {
                    myData = disp_data.filter((d) => {
                        return d.year == 2020
                    })
                } else {
                    myData = disp_data.filter((d) => {
                        return d.year == 2019
                    })
                }

                // appends pie chart to svg
                var arcs = svg.selectAll("g.arc")
                    .data(pie([]))
                    .join("g");

                arcs = svg.selectAll("g.arc")
                    .data(pie(myData))
                    .join("g");

                arcs.merge(arcs)
                    .attr("class", "arc")
                    .attr("transform", `translate(${width / 2},${height / 2})`)
                    .append("path")
                    .attr("fill", function (d, i) {
                        return color(i);
                    })
                    .attr("d", function (d, i) {
                        return arc(d, i)
                    })
                    .on("mouseover", function (event, d) {
                        d3.select(this)
                            .attr("opacity", 0.7)
                    })
                    .on("mouseout", function (event, d) {
                        d3.select(this)
                            .attr("opacity", 1)
                    })
                    .append("title")
                    .text((d) => {
                        return `${d.data.name} ${d.data.value} MW covers only ${d3.format(".1%")(d.value / d3.sum(pie(myData), d => d.value))}`
                    })
            })
    }

    d3.csv("../data/singapore/ses_singapore/custom-doughnut-ses-singapore.csv", (d) => {
        return {
            name: d.source,
            value: parseFloat(d.energy),
            year: parseInt(d.year)
        }
    }).then((data) => {
        generateDoughnutSingaporeTotalCapacity(data);
    })

    d3.json("../data/map/singapore_map.json").then((json) => {
        d3.csv("../data/singapore/singapore_solar_panel_installations_by_region.csv", (d) => {
            return {
                region: d.region,
                installed: parseFloat(d.total_solar_installations),
                capacity: parseFloat(d.installed_capacity)
            }
        }).then((data) => {
            singaporeMapSolarPVInstallation(json, data)
        })
    })

    d3.csv("../data/singapore/ses_singapore/custom-SES_Public_2021.csv", (d) => {
        return {
            year: parseInt(d.year),
            values: {
                SolarPV: parseFloat(d["Solar PV"]),
                CCGT: parseFloat(d["CCGT/Co-Gen/Tri-Gen"]),
                GasTurbine: parseFloat(d["Open Cycle Gas Turbine"]),
                Biofuel: parseFloat(d["Waste-To-Energy"]),
                SteamTurbine: parseFloat(d["Steam Turbine"]),
            }
        }
    }).then((data) => {
        initializeSingaporeEnergyProduction(data);
    })

    d3.csv("../data/worldwide/custom-energy-usage-by-world.csv", (d) => {
        return {
            name: d.country,
            values: [
                { year: "2012", value: parseFloat(d["2012"]) },
                { year: "2013", value: parseFloat(d["2013"]) },
                { year: "2014", value: parseFloat(d["2014"]) },
                { year: "2015", value: parseFloat(d["2015"]) },
                { year: "2016", value: parseFloat(d["2016"]) },
                { year: "2017", value: parseFloat(d["2017"]) },
                { year: "2018", value: parseFloat(d["2018"]) },
                { year: "2019", value: parseFloat(d["2019"]) },
            ]
        }
    }).then((data) => {
        initializeLinegraph(data)
    })

    d3.csv("../data/worldwide/power_capacity_solar_SEA.csv").then((value) => {
        chart = LineChart(value, {
            x: d => new Date(d.year).getFullYear(),
            y: d => parseFloat(d.value),
            z: d => d.country,
            yLabel: "↑ Capacity (MW)",
            width: 1500,
            height: 500,
            color: "brown",
            voronoi: false,
            marginLeft: 250,
            marginRight: 250
        })
        LineChart(chart);
        generateDoughnut()
    })
}