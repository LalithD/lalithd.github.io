(function() {
    "use strict";
    window.onload = function() {
        let checkAgain = window.setInterval(findLocation, 1000);
        function findLocation() {
            navigator.geolocation.getCurrentPosition(addLocation);
        }
        function addLocation(pos) {
            let table = document.getElementById("main_table");
            let newRow = document.createElement("tr");
            table.appendChild(newRow);
            let timeCol = document.createElement("td");
            timeCol.innerHTML = ("" + new Date()).substring(16,21);
            newRow.appendChild(timeCol);
            let latCol = document.createElement("td");
            latCol.innerHTML = pos.coords.latitude;
            newRow.appendChild(latCol);
            let longCol = document.createElement("td");
            longCol.innerHTML = pos.coords.longitude;
            newRow.appendChild(longCol);
            let accCol = document.createElement("td");
            accCol.innerHTML = pos.coords.accuracy;
            newRow.appendChild(accCol);
        }
    };
})();
