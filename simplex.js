/* jshint esnext: true */ // this line is needed for jshint to detect errors.
(function() {
    "use strict";
    window.onload = function() {
        document.getElementById("initOptionsButton").onclick = function() {
            document.getElementById("initOptions").style.visibility = "hidden";
            document.getElementById("instructions").style.visibility = "visible";
            document.getElementById("tableau").innerHTML = "";
            let numVarsTag = document.getElementById("numVarsSelection");
            let numVars = parseInt(numVarsTag.options[numVarsTag.selectedIndex].value);
            let numEquationsTag = document.getElementById("numEquationsSelection");
            let numEquations = parseInt(numEquationsTag.options[numEquationsTag.selectedIndex].value);
            let table = document.createElement("table");
            table.setAttribute("id", "setupTableau");
            document.getElementById("tableau").appendChild(table);
            for (let i = 0; i < numEquations+1; i++) {
                let newRow = document.createElement("tr");
                table.appendChild(newRow);
                if (i < numEquations) {
                    newRow.classList.add("pivotableRows");
                } else {
                    newRow.classList.add("objectiveRow");
                }
                for (let j = 0; j < numVars+numEquations+1; j++) {
                    let newCell = document.createElement("td");
                    newRow.appendChild(newCell);
                    if (i < numEquations) {
                        newCell.classList.add("eq" + i);
                        newCell.setAttribute("eq", "eq"+i);
                    } else {
                        newCell.classList.add("obj");
                    }
                    if (j < numVars+numEquations) {
                        newCell.classList.add("lhs");
                        newCell.classList.add("x" + (j+1));
                        newCell.setAttribute("xvar", "x"+(j+1));
                        if (j >= numVars) {
                            if (j === numVars + i) {
                                newCell.innerHTML = "1";
                            } else {
                                newCell.innerHTML = "0";
                            }
                        }
                    } else {
                        newCell.classList.add("rhs");
                    }
                    if (newCell.innerHTML === "") {
                        if (i === numEquations && j === numVars + numEquations) {
                            newCell.innerHTML = "0";
                        } else {
                            let inputBox = document.createElement("input");
                            newCell.appendChild(inputBox);
                            inputBox.setAttribute("type", "text");
                            inputBox.onblur = validateInput;
                            inputBox.onfocus = removeInputBoxColor;
                        }
                    }
                }
            }
        };
        document.getElementById("confirmTableauButton").onclick = function() {
            let inputElements = document.querySelectorAll("input");
            let validInputs = true;
            for (let i = 0; i < inputElements.length; i++) {
                if (!isValidInput(inputElements[i])) {
                    validInputs = false;
                }
            }
            let table = document.getElementById("setupTableau");
            if (validInputs && table) {
                for (let i = 0; i < table.rows.length; i++) {
                    let currentRow = table.rows[i];
                    for (let j = 0; j < currentRow.cells.length; j++) {
                        let currentCell = currentRow.cells[j];
                        if (currentCell.childElementCount > 0) {
                            currentCell.innerHTML = writeFrac(parseFrac(currentCell.children[0].value));
                        }
                        currentCell.onclick = columnOrRowSelect;
                    }
                }
                loadMessage("chooseColumn");
            } else {
                alert("Cannot identify the set up tableau");
            }
        };
        document.getElementById("solveRow").onclick = function() {
            let cell = document.querySelector(".highlightPivotCell");
            if (cell) {
                let cellRow = cell.getAttribute("eq");
                let cellCol = cell.getAttribute("xvar");
                let frac = parseFrac(cell.innerHTML);
                let cellsInRow = document.querySelectorAll(`.${cellRow}`);
                for (let i = 0; i < cellsInRow.length; i++) {
                    let oldFrac = parseFrac(cellsInRow[i].innerHTML);
                    let newFrac = divideFrac(oldFrac, frac);
                    cellsInRow[i].innerHTML = writeFrac(newFrac);
                }
                let allRowsPivot = document.querySelectorAll(`.${cellCol}:not(.${cellRow})`);
                for (let i = 0; i < allRowsPivot.length; i++) {
                    let pivotFrac = parseFrac(allRowsPivot[i].innerHTML);
                    let eqNum = allRowsPivot[i].getAttribute("eq");
                    let cellsInEachRow = null;
                    if (eqNum) {
                        cellsInEachRow = document.querySelectorAll(`.${eqNum}`);
                    } else {
                        cellsInEachRow = document.querySelectorAll(".obj");
                    }
                    for (let j = 0; j < cellsInEachRow.length; j++) {
                        let colNum = cellsInEachRow[j].getAttribute("xvar");
                        let correspondingCell = null;
                        if (colNum === null) {
                            correspondingCell = document.querySelector(`.${cellRow}.rhs`);
                        } else {
                            correspondingCell = document.querySelector(`.${cellRow}.${colNum}`);
                        }
                        let correspondingFrac = parseFrac(correspondingCell.innerHTML);
                        let currentFrac = parseFrac(cellsInEachRow[j].innerHTML);
                        let newFrac = subtractFrac(currentFrac, multiplyFrac(pivotFrac, correspondingFrac));
                        cellsInEachRow[j].innerHTML = writeFrac(newFrac);
                    }
                }
                removeClassFromAll("td", "highlightPivotCell");
                removeClassFromAll("td", "highlightColumn");
                let status = checkFeasibility();
            }
        };
        function parseFrac(string) {
            let stringPartition = string.split("/");
            if (stringPartition.length === 1) {
                return {
                    num: parseInt(stringPartition[0]),
                    den: 1
                };
            } else if (stringPartition[0] === "0" || stringPartition[0] === "-0") {
                return {
                    num: 0,
                    den: 1
                };
            } else {
                let fracObj = {
                    num: parseInt(stringPartition[0]),
                    den: parseInt(stringPartition[1])
                };
                return reduceFrac(fracObj);
            }
        }
        function writeFrac(fracObj) {
            if (fracObj.den === 1 || fracObj.num === 0) {
                return ""+fracObj.num;
            } else {
                return `${fracObj.num}/${fracObj.den}`;
            }
        }
        function compareFrac(frac1, frac2) {
            if (frac1 === null || frac2 === null) {
                return 0;
            }
            let diff = frac1.num * frac2.den - frac2.num * frac1.den;
            if (diff > 0) {
                return 1;
            } else if (diff < 0) {
                return -1;
            } else {
                return 0;
            }
        }
        function addFrac(frac1, frac2) {
            let sumFrac = {
                num: frac1.num * frac2.den + frac1.den * frac2.num,
                den: frac1.den * frac2.den
            };
            return reduceFrac(sumFrac);
        }
        function subtractFrac(frac1, frac2) {
            let subFrac = {
                num: frac1.num * frac2.den - frac1.den * frac2.num,
                den: frac1.den * frac2.den
            };
            return reduceFrac(subFrac);
        }
        function divideFrac(frac1, frac2) {
            let divFrac = {
                num: frac1.num * frac2.den,
                den: frac1.den * frac2.num
            };
            return reduceFrac(divFrac);
        }
        function multiplyFrac(frac1, frac2) {
            let multFrac = {
                num: frac1.num * frac2.num,
                den: frac1.den * frac2.den
            };
            return reduceFrac(multFrac);
        }
        function reduceFrac(fracObj) {
            let gcdValue = gcd(fracObj.num, fracObj.den);
            if (fracObj.den/gcdValue < 0) {
                gcdValue *= -1;
            }
            return {
                num: fracObj.num/gcdValue,
                den: fracObj.den/gcdValue
            };
        }
        function asNumber(fracObj) {
            return fracObj.num/fracObj.den;
        }
        function gcd(a, b) {
            if (a === 0 || b === 0) {
                return 1;
            }
            if (a < 0) {
                return -gcd(-a, b);
            }
            if (b < 0) {
                return -gcd(a, -b);
            }
            if (a === 1 || b === 1) {
                return 1;
            } else if (a < b) {
                return gcd(b, a);
            } else if (a%b === 0) {
                return b;
            } else {
                return gcd(a%b, b);
            }
        }
        function removeClassFromAll(querySelectorString, classString) {
            let tags = document.querySelectorAll(querySelectorString);
            for (let i = 0; i < tags.length; i++) {
                tags[i].classList.remove(classString);
            }
        }
        function columnOrRowSelect(evt) {
            let cellClicked = evt.target;
            if (cellClicked.classList.contains("highlightColumn")) {
                if (!cellClicked.classList.contains("obj")) {
                    rowSelect(cellClicked);
                }
            } else {
                columnSelect(cellClicked);
            }
        }
        function rowSelect(tag) {
            let leftColumnId = tag.getAttribute("xvar");
            let leftColumn = document.querySelectorAll(`[xvar=${leftColumnId}]:not(.obj)`);
            let rightColumn = document.querySelectorAll(".rhs:not(.obj)");
            let minCol = {
                min: null,
                col: null
            };
            for (let i = 0; i < leftColumn.length; i++) {
                let num = parseFrac(document.querySelector(`[eq=${leftColumn[i].getAttribute("eq")}].rhs`).innerHTML);
                let den = parseFrac(leftColumn[i].innerHTML);
                if (den.num > 0) {
                    let result = divideFrac(num, den);
                    let diff = compareFrac(result, minCol.min);
                    if (minCol.min === null || diff < 0) {
                        minCol = {
                            min: result,
                            col: [leftColumn[i].getAttribute("eq")]
                        };
                    } else if (diff === 0) {
                        minCol.col.push(leftColumn[i].getAttribute("eq"));
                    }
                }
            }
            if (minCol.col === null) {
                removeClassFromAll("td", "highlightPivotCell");
                removeClassFromAll("td", "highlightColumn");
                loadMessage("terminateMsg:terminateUnbounded");
            } else if (minCol.col.includes(tag.getAttribute("eq"))) {
                removeClassFromAll("td", "highlightPivotCell");
                tag.classList.add("highlightPivotCell");
                loadMessage("solveInstruction");
            }
        }
        function columnSelect(tag) {
            if (tag.hasAttribute("xvar")) {
                let xvar = tag.getAttribute("xvar");
                let objRowCell = document.querySelector(`[xvar="${xvar}"].obj`);
                if (asNumber(parseFrac(objRowCell.innerText)) > 0) {
                    removeClassFromAll("td", "highlightColumn");
                    removeClassFromAll("td", "highlightPivotCell");
                    let columnCells = document.querySelectorAll(`[xvar="${xvar}"]`);
                    for (let cellIndex = 0; cellIndex < columnCells.length; cellIndex++) {
                        columnCells[cellIndex].classList.add("highlightColumn");
                    }
                    loadMessage("chooseRow");
                }
            }
        }
        function checkFeasibility() {
            let status = {
                feasibility: true,
                terminate: true,
                unbounded: false
            };
            let rhsCells = document.querySelectorAll(".rhs:not(.obj)");
            for (let i = 0; i < rhsCells.length; i++) {
                if (parseFrac(rhsCells[i].innerHTML).num < 0) {
                    status.feasibility = false;
                }
            }
            let objCells = document.querySelectorAll(".obj.lhs");
            for (let i = 0; i < objCells.length; i++) {
                if (parseFrac(objCells[i].innerHTML).num > 0) {
                    status.terminate = false;
                    let xCol = objCells[i].getAttribute("xvar");
                    let cellsInCol = document.querySelectorAll(`.${xCol}:not(.obj)`);
                    let allNegative = true;
                    for (let j = 0; j < cellsInCol.length; j++) {
                        if (parseFrac(cellsInCol[j].innerHTML).num > 0) {
                            allNegative = false;
                        }
                    }
                    if (allNegative) {
                        status.unbounded = true;
                    }
                }
            }
            status.unbounded = status.unbounded && status.terminate;
            console.log(status);
            if (status.unbounded) {
                loadMessage("terminateMsg:terminateUnbounded");
            } else if (status.terminate) {
                loadMessage("terminateMsg:terminateComplete");
            } else {
                loadMessage("chooseColumn");
                removeClassFromAll("td", "highlightColumn");
                removeClassFromAll("td", "highlightPivotCell");
            }
            return status;
        }
        function loadMessage(string) {
            let listOfMsgIds = ["confirmTableau", "chooseColumn", "chooseRow", "solveInstruction", "terminateMsg"];
            for (let i = 0; i < listOfMsgIds.length; i++) {
                document.getElementById(listOfMsgIds[i]).style.visibility = "hidden";
            }
            let stringSplit = string.split(":");
            if (stringSplit.length === 1) {
                document.getElementById(string).style.visibility = "visible";
            } else {
                console.log(stringSplit[1]);
                document.getElementById(stringSplit[0]).style.visibility = "visible";
                document.getElementById("terminateComplete").style.visibility = "hidden";
                document.getElementById("terminateUnbounded").style.visibility = "hidden";
                document.getElementById(stringSplit[1]).style.visibility = "visible";
            }
            if (stringSplit[1] === "terminateComplete") {
                let xVector = "(";
                let numRows = document.querySelectorAll("tr").length;
                let numVars = document.querySelectorAll("td.obj").length - numRows;
                for (let i = 1; i <= numVars; i++) {
                    let isZero = false;
                    let oneIndex = [];
                    let columnElements = document.querySelectorAll(`.x${i}:not(.obj)`);
                    console.log("columnElements", columnElements);
                    for (let j = 0; j < columnElements.length; j++) {
                        let asFrac = parseFrac(columnElements[j].innerHTML);
                        if (asFrac.num === asFrac.den) {
                            let eqNum = columnElements[j].getAttribute("eq");
                            oneIndex.push(parseFrac(document.querySelector(`.${eqNum}.rhs`).innerHTML));
                        } else if (asFrac.num !== 0) {
                            isZero = true;
                        }
                    }
                    if (isZero || oneIndex.length !== 1) {
                        xVector += "0";
                    } else {
                        xVector += writeFrac(oneIndex[0]);
                    }
                    if (i < numVars) {
                        xVector += ", ";
                    }
                }
                document.getElementById("solutionX").innerHTML = xVector + ")";
                let optimalSolution = parseFrac(document.querySelector(".obj.rhs").innerHTML);
                optimalSolution.num *= -1;
                document.getElementById("solutionOptimal").innerHTML = writeFrac(optimalSolution);
            }
        }
        function validateInput(evt) {
            let inputBox = evt.target;
            if (!isValidInput(inputBox)) {
                inputBox.style.backgroundColor = "#f19595";
            }
        }
        function isValidInput(inputBox) {
            return /^\-?\d+(\/?\d+)?$/g.test(inputBox.value);
        }
        function removeInputBoxColor(evt) {
            let inputBox = evt.target;
            inputBox.style.backgroundColor = "";
        }
    };
})();

// TODO: Verify algorithm correct.
// TODO: Acknowledge illegal conditions?
