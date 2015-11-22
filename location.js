/* jshint esnext: true */
(function() {
    "use strict";
    window.onload = function() {
        let options = {
            enableHighAccuracy: true, // as accurate as possible
            timeout: 10000, // must take only 10 sec to respond
            maximumAge: 0 // must not return cached location
        };
        findLocation();
        //let checkAgain = window.setInterval(findLocation, 10000);
        let checkAgain = navigator.geolocation.watchPosition(findLocation, error, options);
        function findLocation() {
            navigator.geolocation.getCurrentPosition(addLocation, error, options);
        }
        function addLocation(pos) {
            let newRow = document.createElement("tr");
            document.getElementById("table_body").appendChild(newRow);
            let timeCol = document.createElement("td");
            timeCol.innerHTML = ("" + new Date()).substring(16,24);
            newRow.appendChild(timeCol);
            let latCol = document.createElement("td");
            latCol.innerHTML = pos.coords.latitude;
            newRow.appendChild(latCol);
            let longCol = document.createElement("td");
            longCol.innerHTML = pos.coords.longitude;
            newRow.appendChild(longCol);
            let accCol = document.createElement("td");
            accCol.innerHTML = pos.coords.accuracy + " m";
            newRow.appendChild(accCol);
        }
        function error() {
            console.log("An error occurred!");
        }
    };
})();
