/* jshint esnext: true */
(function() {
    "use strict";
    let points = 0;
    let timeTaken = 0;
    setInterval(function() {
        timeTaken++;
        document.getElementById("time").innerHTML = `Time: ${timeTaken}`;
    }, 1000);
    window.onload = newProblem;
    function newProblem() {
        let table = document.querySelector("table");
        let oldItems = document.querySelectorAll("tr");
        for (let i = 0; i < oldItems.length; i++) {
            table.removeChild(oldItems[i]);
        }
        let sack = knapsackGenerator();
        let totalCost = 0;
        let current = 0;
        for (let item of sack) {
            totalCost += item.cost * item.answer;
            let newRow = document.createElement("tr");
            table.appendChild(newRow);
            let cost = document.createElement("td");
            cost.innerHTML = `${item.cost}`;
            cost.style.boxShadow = `inset 0 0 5em hsl(${item.color.hue}, ${item.color.sat}%, ${item.color.light}%)`;
            let minus = document.createElement("td");
            minus.innerHTML = "-";
            let count = document.createElement("td");
            count.innerHTML = `${item.count}`;
            count.style.boxShadow = `inset 0 0 5em hsl(${item.color.hue}, ${item.color.sat}%, ${item.color.light}%)`;
            let plus = document.createElement("td");
            plus.innerHTML = "+";
            newRow.appendChild(cost);
            newRow.appendChild(minus);
            newRow.appendChild(count);
            newRow.appendChild(plus);
            count.onclick = function() {
                current -= item.count * item.cost;
                item.count = 0;
                count.innerHTML = `${item.count}`;
                updateValues(current, totalCost);
            };
            minus.onclick = function() {
                if (item.count > 0) {
                    item.count--;
                    current -= item.cost;
                    count.innerHTML = `${item.count}`;
                    updateValues(current, totalCost);
                }
            };
            plus.onclick = function() {
                item.count++;
                current += item.cost;
                count.innerHTML = `${item.count}`;
                updateValues(current, totalCost);
            };
        }
        updateValues(current, totalCost);
        document.getElementById("next").onclick = function(evt) {
            evt.preventDefault();
            if (current === totalCost) {
                points++;
            }
            newProblem();
        };
    }
    function updateValues(current, totalCost) {
        document.getElementById("points").innerHTML = `Points: ${points}`;
        document.getElementById("goal").innerHTML = `Current: ${current} Goal: ${totalCost}`;
        if (current === totalCost) {
            document.getElementById("next").style.backgroundColor = "rgb(120, 240, 80)";
            document.getElementById("next").style.color = "green";
            document.getElementById("next").innerHTML = "Next";
        } else {
            document.getElementById("next").style.backgroundColor = "rgb(240, 120, 80)";
            document.getElementById("next").style.color = "red";
            document.getElementById("next").innerHTML = "Give Up";
        }
    }
    function knapsackGenerator() {
        let distinctItems = Math.floor(Math.random() * 3) + 3; // 3 to 5
        let items = [];
        for (let i = 0; i < distinctItems; i++) {
            while (items.length === i) {
                let newValue = newItem();
                if (!contains(items, newValue)) {
                    items.push(newValue);
                }
            }
        }
        return items;
    }
    function newItem() {
        return {
            cost: Math.floor(Math.random() * 90) + 10,
            answer: Math.floor(Math.random() * 5),
            color: {
                hue: Math.floor(Math.random() * 360),
                sat: Math.floor(Math.random() * 50),
                light: 50
            },
            count: 0
        };
    }
    function contains(array, newValue) {
        for (let value of array) {
            if (newValue.cost % value.cost === 0 || value.cost % newValue.cost === 0) {
                return true;
            }
        }
        return false;
    }
})();
