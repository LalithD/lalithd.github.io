/* jshint esnext: true */
(function() {
    "use strict";
    window.onload = function() {
        var canvas = document.getElementById("panel");
        var ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let DIST = 20;
        let mouse = {
            x: null,
            y: null
        };
        let initPoint = null;
        let pointsArray = [];
        let lines = [];
        update();
        canvas.addEventListener("mousemove", function(evt) {
            mouse.x = evt.layerX;
            mouse.y = evt.layerY;
        }, false);
        canvas.addEventListener("click", checkLine, false);
        function checkLine() {
            let currentMouse = {x: mouse.x, y: mouse.y};
            let existing = isNearby(currentMouse);
            if (initPoint) {
                if (existing >= 0) {
                    addLine(initPoint, pointsArray[existing]);
                } else {
                    addLine(initPoint, currentMouse);
                    let randId = Math.random();
                    pointsArray.push({x: currentMouse.x, y: currentMouse.y});
                }
                initPoint = null;
            } else {
                if (existing >= 0) {
                    initPoint = {
                        x: pointsArray[existing].x,
                        y: pointsArray[existing].y
                    };
                } else {
                    initPoint = {
                        x: currentMouse.x,
                        y: currentMouse.y
                    };
                    pointsArray.push({x: currentMouse.x, y: currentMouse.y});
                }
            }
        }
        function addLine(a, b) {
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].x1 === a.x && lines[i].y1 === a.y && lines[i].x2 === b.x && lines[i].y2 === b.y) {
                    return;
                }
            }
            lines.push({
                x1: a.x,
                y1: a.y,
                x2: b.x,
                y2: b.y
            });
        }
        document.getElementById("reset").onclick = function() {
            pointsArray = [];
            lines = [];
        };
        function update() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawAllPoints();
            drawAllLines();
            window.requestAnimationFrame(update);
        }
        function drawAllPoints() {
            for (let i = 0; i < pointsArray.length; i++) {
                ctx.beginPath();
                ctx.arc(pointsArray[i].x, pointsArray[i].y, 5, 0, 2*Math.PI, false);
                if (initPoint && pointsArray[i].x === initPoint.x && pointsArray[i].y === initPoint.y) {
                    ctx.fillStyle = "blue";
                } else {
                    ctx.fillStyle = "black";
                }
                ctx.fill();
            }
        }
        function drawAllLines() {
            for (let i = 0; i < lines.length; i++) {
                ctx.beginPath();
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;
                ctx.moveTo(lines[i].x1, lines[i].y1);
                ctx.lineTo(lines[i].x2, lines[i].y2);
                ctx.stroke();
            }
        }
        function isNearby(mouse) {
            for (let i = 0; i < pointsArray.length; i++) {
                if (distance(mouse, pointsArray[i]) < DIST) {
                    return i;
                }
            }
            return -1;
        }
        function distance(a, b) {
            return Math.pow(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2), 0.5);
        }
    };
}());
