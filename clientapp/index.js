window.onload = () => {

    const initializeLinegraph = (myDataset) => {

        var w = 1200;
        var h = 600;

        var xScale = d3.scaleTime()
            .domain([
                d3.min(myDataset, (d) => { return d.year; }),
                d3.max(myDataset, (d) => { return d.year; })
            ])
            .range([0, w]);

        var yScale = d3.scaleLinear()
            .domain([0, 50])
            .range([h, 0]);

        var singapore_line = d3.line()
            .x((d) => { return xScale(d.year); })
            .y((d) => { return yScale(d.singapore_value); })

        var japan_line = d3.line()
            .x((d) => { return xScale(d.year); })
            .y((d) => { return yScale(d.japan_value); })

        var china_line = d3.line()
            .x((d) => { return xScale(d.year); })
            .y((d) => { return yScale(d.china_value); })

        var xAxis = d3.axisBottom()
            .tickFormat((d) => { return d3.format(".0f")(d) })
            .scale(xScale);

        var yAxis = d3.axisRight()
            .scale(yScale);

        var svg = d3.select("#country_energy_by_year")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        svg.append("path")
            .datum(myDataset)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("d", singapore_line);

        svg.append("path")
            .datum(myDataset)
            .attr("fill", "none")
            .attr("stroke", "orange")
            .attr("d", china_line);

        svg.append("path")
            .datum(myDataset)
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("d", japan_line);

        svg.append("g")
            .attr("transform", `translate(10, ${h - 20})`)
            .call(xAxis);

        svg.append("g")
            .attr("transform", `translate(0, 10)`)
            .call(yAxis);
    }

    d3.csv("../data/custom-energy-usage-by-world.csv", (d) => {
        return {
            year: parseInt(d.Year),
            singapore_value: parseFloat(d.Singapore),
            japan_value: parseFloat(d.Japan),
            china_value: parseFloat(d.China)
        }
    }).then((data) => {
        initializeLinegraph(data)
    })
}