/* jshint esnext: true */
(function() {
    "use strict";
    window.onload = function() {
        console.log("SVG load function running.");

        let initMap = document.getElementById("svgMap");

        let pathArr = document.getElementsByTagName("path");

        for (let i = 0; i < pathArr.length; ++i) {
            pathArr[i].onmouseover = showDiv;
            pathArr[i].onmousemove = moveDiv;
            pathArr[i].onmouseout = hideDiv;
            pathArr[i].onclick = clickAction; // optional: change to ondblclick
        }

        function showDiv() {
            document.getElementById("mouseoverDiv").style.display = "block";
        }

        function hideDiv() {
            document.getElementById("mouseoverDiv").style.display = "none";
        }

        function moveDiv(evt) {
            let mouseoverDiv = document.getElementById("mouseoverDiv");
            mouseoverDiv.style.left = (evt.clientX+10) + "px";
            mouseoverDiv.style.top = (evt.clientY+10) + "px";
            mouseoverDiv.innerText = evt.target.getAttribute("id") + " value";
        }

        function clickAction(evt) {
            let stateName = evt.target.getAttribute("id");
            // alert(stateName + " double clicked!");
            // document.getElementById("stateNameDiv").innerText = stateName;
            document.getElementById("darken").style.display = "block";
        }
        document.getElementById("darken").onclick = function() {
            this.style.display = "none";
            // document.getElementById("overlay").style.display = "none";
        };
        document.getElementById("overlay").onclick = function() {
            event.stopPropagation();
        };
    };
}());
