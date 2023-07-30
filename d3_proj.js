// define these variables here so that they are accessible in console for debugging:
let data = undefined;
let yaxisvalue = "Units";
let currSlide = 1;
window.onload = function() {
    document.getElementById("tooltip").addEventListener("mouseover", function(e) {
        e.preventDefault();
    });
    async function init() {
        data = await d3.csv("https://gist.githubusercontent.com/LalithD/e47a05cafa221b40c1a5aa3846406c70/raw/f230b07bb04b35faeb64eb83c5c01e295abce8d6/weekly_food_prices_clean.csv");
        for (let i = 0; i < data.length; ++i) {
            data[i]["Date"] = new Date(data[i]["Date"]);
            data[i]["Dollars"] = parseFloat(data[i]["Dollars"]);
            data[i]["Units"] = parseFloat(data[i]["Units"]);
            data[i]["cost_per_unit"] = data[i]["Dollars"]/data[i]["Units"];
        }
        drawTimeSeries(filteredData());
        console.log("Loaded!");
    }

    function displayDate(date) {
        let mo = date.getUTCMonth()+1;
        let day = date.getUTCDate();
        return `${date.getUTCFullYear()}-${mo < 10 ? "0" + mo : mo}-${day < 10 ? "0" + day : day}`;
    }

    function calcMovingAvg(arr, halfWidth) {
        return arr.map((d,i) => i < halfWidth || i >= arr.length-halfWidth ? null : arr.slice(i-halfWidth,i+halfWidth+1).reduce((acc,d) => acc+d/(2*halfWidth+1), 0));
    }

    function drawTimeSeries(useData) {
        let colorToUse = {
            "cost_per_unit": "hsl(0, 60%, 70%)",
            "Units": "hsl(145, 50%, 70%)",
            "Dollars": "hsl(200, 50%, 70%)"
        };
        let colorToUseMA = {
            "cost_per_unit": "hsl(0, 60%, 20%)",
            "Units": "hsl(145, 50%, 20%)",
            "Dollars": "hsl(210, 50%, 20%)"
        };
        d3.selectAll("svg > *:not(#mainline, #maline, #xaxis, #yaxis, #cursorline)").remove();
        let x = d3.scaleTime().domain(d3.extent(useData, (d) => d["Date"])).range([100, 1550]);
        let yRange = d3.extent(useData, (d) => d[yaxisvalue]);
        yRange[0] = Math.max(yRange[0] - (yRange[1] - yRange[0]) * 0.05, 0);
        yRange[1] = yRange[1] + (yRange[1] - yRange[0]) * 0.05;
        let y = d3.scaleLinear(yRange, [700, 100]);

        let line = d3.line().x((d) => x(d["Date"])).y((d) => y(d[yaxisvalue]));
        let lineMA = d3.line().x((d) => x(d["Date"])).y((d) => y(d["MA"]));

        // d is an array of objects
        let groupedData = [...d3.group(useData, d => d["State"] + d["Category"]).values()]
        let newRes = calcMovingAvg(useData.map(d => d[yaxisvalue]), 6); // use 6*2+1 = 13 weeks for the moving average
        useData.map((d,i) => d["MA"] = newRes[i]);
        //console.log(useData);
        d3.select("#mainline").selectAll("path").data(groupedData).join("path")
        .attr("fill", "none")
        .attr("stroke", colorToUse[yaxisvalue])
        .attr("stroke-width", 3)
        .attr("d", d => line(d));
        /* this can highlight outliers
        d3.select("svg").append("g").selectAll("circle").data(groupedData[0]).enter().append("circle")
        .attr("cx", d => x(d["Date"]))
        .attr("cy", d => y(d[yaxisvalue]))
        .attr("fill", colorToUse[yaxisvalue])
        .attr("r", (d) => d["MA"] !== null && Math.abs(d[yaxisvalue]/d["MA"]-1) > 0.2 ? 6 : 0); /**/

        // drawing moving average
        d3.select("#maline").selectAll("path").data([useData.filter(d => d["MA"] !== null)]).join("path")
        .attr("fill", "none")
        .attr("stroke", colorToUseMA[yaxisvalue])
        .attr("stroke-width", 4)
        .attr("stroke-dasharray", 10)
        .attr("d", d => lineMA(d));
        d3.select("svg").append("line").attr("transform", "translate(0, 50)"); // follows cursor
        let tooltipDiv = document.getElementById("tooltip");
        d3.select("svg").on("mousemove", function(e) {
            // need to figure out the screen coordinates of the mouse
            tooltipDiv.style.display = "block";
            let refPoint = document.getElementsByTagName("svg")[0].createSVGPoint();
            refPoint.x = e.clientX;
            refPoint.y = e.clientY;
            refPoint = refPoint.matrixTransform(document.getElementsByTagName("svg")[0].getScreenCTM().inverse());
            // now figure out where to draw the line and tooltip on the actual graph
            let hoverDate = x.invert(refPoint.x);
            if (hoverDate > d3.min(data, (d) => d["Date"]) && hoverDate < d3.max(data, (d) => d["Date"])) {
                tooltipDiv.style.bottom = document.documentElement.clientHeight - e.clientY + 5 + "px";
                tooltipDiv.style.left = e.clientX + 5 + "px";
                let closestSunday = new Date(hoverDate - hoverDate.getUTCDay()*1000*86400);
                let yValueAtTooltip = useData.filter((d) => (closestSunday - 1000*86400 <= d["Date"]) && (d["Date"] <= closestSunday))[0][yaxisvalue];
                tooltipDiv.innerHTML = `Date: ${displayDate(closestSunday)}<br>Value: ${new Intl.NumberFormat().format(Math.round(yValueAtTooltip*1000)/1000)}`;
                d3.select("#cursorline").attr("x1", x(closestSunday)).attr("x2", x(closestSunday)).attr("y1", 100).attr("y2", 700).attr("stroke", colorToUseMA[yaxisvalue]).attr("stroke-dasharray", 10);
            }
        });

        // draw the axes
        d3.select("#xaxis").attr("transform", "translate(0, 700)").transition().call(d3.axisBottom(x));
        d3.select("#yaxis").attr("transform", "translate(100, 0)").transition().call(d3.axisLeft(y).tickFormat(function (d) {
            if (yRange[0] > 1e6) {
                return d/1e6 + " M";
            } else if (yRange[0] > 1e5) {
                return d/1e3 + " K";
            } else if (yaxisvalue === "cost_per_unit") {
                return "$" + d;
            } else {
                return d;
            }
        }));
        d3.select("svg").append("text").attr("id", "graphtitle").attr("x", 850).attr("y", 50).text(`${useData[0]["State"]} ${useData[0]["Category"]} ${yaxisvalue} by week`).attr("font-size", "16pt");
        d3.select("svg").append("text").attr("id", "graphyaxis").attr("x", 850).attr("y", 750).text("Date");
        d3.select("svg").append("text").attr("id", "graphxaxis").attr("transform", "translate(50, 400) rotate(-90)").text(yaxisvalue);
        addAnnotations();
    }

    function addAnnotations() {
        if (currSlide === 1) {
            console.log("adding annotations for slide 1");
            document.getElementById("description").textContent = document.getElementById("slide1-text").textContent;
            document.getElementById("options").style.display = "none";
            // add text highlighting outlier:
            d3.select("svg").append("text").attr("x", 625).attr("y", 125).attr("stroke", "none").transition().delay(500).text("COVID panic buying the week of lockdowns");
            d3.select("svg").append("line").attr("x1", 565).attr("y1", 125).attr("x2", 620).attr("y2", 120).attr("stroke", "none").transition().delay(500).attr("stroke", "black");
            // add text highlighting seasonality:
            d3.select("svg").append("text").attr("x", 1010).attr("y", 150).attr("stroke", "none").transition().delay(500).text("Summer months have the highest sales");
            d3.select("svg").append("line").attr("x1", 700).attr("y1", 180).attr("x2", 1000).attr("y2", 150).attr("stroke", "none").transition().delay(500).attr("stroke", "black");
            d3.select("svg").append("line").attr("x1", 985).attr("y1", 280).attr("x2", 1000).attr("y2", 150).attr("stroke", "none").transition().delay(500).attr("stroke", "black");
            d3.select("svg").append("line").attr("x1", 1300).attr("y1", 320).attr("x2", 1000).attr("y2", 150).attr("stroke", "none").transition().delay(500).attr("stroke", "black");
        } else if (currSlide === 2) {
            console.log("adding annotations for slide 2");
            document.getElementById("description").textContent = document.getElementById("slide2-text").textContent;
            document.getElementById("options").style.display = "none";
            // low inflation period
            d3.select("svg").append("text").attr("stroke", "none").attr("transform", "translate(300, 490), rotate(-13)").transition().delay(500).text("Shallow slope indicates mild inflation from late 2019 to mid 2021");
            d3.select("svg").append("line").attr("x1", 125).attr("y1", 550).attr("x2", 900).attr("y2", 370).attr("stroke", "none").transition().delay(500).attr("stroke", "black");
            d3.select("svg").append("line").attr("x1", 125).attr("y1", 550).attr("x2", 130).attr("y2", 570).attr("stroke", "none").transition().delay(500).attr("stroke", "black");
            d3.select("svg").append("line").attr("x1", 900).attr("y1", 370).attr("x2", 905).attr("y2", 390).attr("stroke", "none").transition().delay(500).attr("stroke", "black");
            // high inflation period
            d3.select("svg").append("text").attr("stroke", "none").attr("transform", "translate(1160, 220) rotate(-30)").transition().delay(500).text("Steeper slope indicates high inflation from mid 2021 to mid 2023").attr("text-anchor", "middle");
            d3.select("svg").append("line").attr("x1", 910).attr("y1", 390).attr("x2", 1450).attr("y2", 80).attr("stroke", "none").transition().delay(500).attr("stroke", "black");
            d3.select("svg").append("line").attr("x1", 910).attr("y1", 390).attr("x2", 920).attr("y2", 410).attr("stroke", "none").transition().delay(500).attr("stroke", "black");
            d3.select("svg").append("line").attr("x1", 1450).attr("y1", 80).attr("x2", 1460).attr("y2", 100).attr("stroke", "none").transition().delay(500).attr("stroke", "black");
        } else {
            console.log(`not adding annotations for slide ${currSlide}`);
            document.getElementById("description").textContent = document.getElementById("slide3-text").textContent;
            document.getElementById("options").style.display = "block";
        }
    }

    function addInteractions() {
        document.getElementById("category").addEventListener("change", function() {
            drawTimeSeries(filteredData());
        });
        document.getElementById("state").addEventListener("change", function() {
            drawTimeSeries(filteredData());
        });
        document.getElementById("yaxisvalue").addEventListener("change", function() {
            yaxisvalue = document.getElementById("yaxisvalue").value;
            let selectTags = [...document.getElementsByTagName("select")];
            selectTags.push(document.getElementById("tooltip"));
            for (let i = 0; i < selectTags.length; ++i) {
                selectTags[i].className = "";
                if (yaxisvalue === "cost_per_unit") {
                    selectTags[i].classList.add("cost");
                } else if (yaxisvalue === "Units") {
                    selectTags[i].classList.add("units");
                } else if (yaxisvalue === "Dollars") {
                    selectTags[i].classList.add("dollars");
                }
            }
            drawTimeSeries(filteredData());
        });
        document.getElementById("slideback").onclick = function() {
            if (currSlide > 1) {
                currSlide -= 1;
                document.getElementById("slidedesc").textContent = `Slide ${currSlide}/3`;
                document.getElementById("category").value = "Beverages";
                document.getElementById("state").value = "CA";
                yaxisvalue = currSlide === 1 ? "Units" : "cost_per_unit";
                document.getElementById("yaxisvalue").value = yaxisvalue;
                document.getElementById("tooltip").className = "";
                if (yaxisvalue === "cost_per_unit") {
                    document.getElementById("tooltip").classList.add("cost");
                } else if (yaxisvalue === "Units") {
                    document.getElementById("tooltip").classList.add("units");
                } else if (yaxisvalue === "Dollars") {
                    document.getElementById("tooltip").classList.add("dollars");
                }
            }
            document.getElementById("slideback").className = "";
            document.getElementById("slideforward").className = "";
            if (currSlide === 1) {
                document.getElementById("slideback").classList.add("hide");
            }
            drawTimeSeries(filteredData());
        };
        document.getElementById("slideforward").onclick = function() {
            if (currSlide < 3) {
                currSlide += 1;
                document.getElementById("slidedesc").textContent = `Slide ${currSlide}/3`;
                document.getElementById("category").value = "Beverages";
                document.getElementById("state").value = "CA";
                yaxisvalue = currSlide === 2 ? "cost_per_unit" : "Dollars";
                document.getElementById("yaxisvalue").value = yaxisvalue;
            }
            document.getElementById("slideback").className = "";
            document.getElementById("slideforward").className = "";
            if (currSlide === 3) {
                document.getElementById("slideforward").classList.add("hide");
                let selectTags = [...document.getElementsByTagName("select")];
                selectTags.push(document.getElementById("tooltip"));
                for (let i = 0; i < selectTags.length; ++i) {
                    selectTags[i].className = "";
                    if (yaxisvalue === "cost_per_unit") {
                        selectTags[i].classList.add("cost");
                    } else if (yaxisvalue === "Units") {
                        selectTags[i].classList.add("units");
                    } else if (yaxisvalue === "Dollars") {
                        selectTags[i].classList.add("dollars");
                    }
                }
            }
            drawTimeSeries(filteredData());
        };
    }

    function filteredData() {
        let newData = [];
        let catValue = document.getElementById("category").value; 
        let stValue = document.getElementById("state").value;
        for (let i = 0; i < data.length; ++i) {
            if ((stValue === "All" || data[i]["State"] === stValue) && (catValue === "All" || data[i]["Category"] === catValue)) {
                newData.push(data[i]);
            }
        }
        return newData;
    }

    init();
    addInteractions();
};