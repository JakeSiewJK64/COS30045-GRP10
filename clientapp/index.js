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
            .attr("transform", `translate(8,250)`);

        ylabel
            .append("text")
            .attr("font-size", 12)
            .text("Percentage Energy Generation")
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
        var w = 800;
        var h = 400;
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
                        .attr("x", xPosition + 500)
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

    d3.csv("../data/singapore/custom-SES_Public_2021.csv", (d) => {
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

    d3.csv("../data/custom-energy-usage-by-world.csv", (d) => {
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
}