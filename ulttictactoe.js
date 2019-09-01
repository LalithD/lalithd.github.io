"use strict";

const MAX_SIMULATIONS = 10000;

const MOVE_MAPPING = [
	[0, 1, 2, 9, 10, 11, 18, 19, 20],
	[3, 4, 5, 12, 13, 14, 21, 22, 23],
	[6, 7, 8, 15, 16, 17, 24, 25, 26],
	[27, 28, 29, 36, 37, 38, 45, 46, 47],
	[30, 31, 32, 39, 40, 41, 48, 49, 50],
	[33, 34, 35, 42, 43, 44, 51, 52, 53],
	[54, 55, 56, 63, 64, 65, 72, 73, 74],
	[57, 58, 59, 66, 67, 68, 75, 76, 77],
	[60, 61, 62, 69, 70, 71, 78, 79, 80]
];

function getNextSmallBoard(cellNum) {
	return parseInt(3 * (((cellNum - (cellNum % 9)) / 9) % 3) + cellNum % 3);
}

function getCurrSmallBoard(cellNum)
{
	return parseInt((cellNum - cellNum % 27) / 9 + Math.floor((cellNum % 9) / 3));
}

function isSmallBoardSolved(board, smallBoardNum) {
	let start = MOVE_MAPPING[smallBoardNum][0];
	for (let i = 0; i < 3; ++i) {
		// check horizontals for a victory
		if (board[start + 9*i] !== 0 && board[start + 9*i] === board[start+1 + 9*i] && board[start + 9*i] === board[start+2 + 9*i]) {
			return board[start + 9*i];
		}
		// check verticals for a victory
		if (board[start + i] !== 0 && board[start + i] === board[start+9 + i] && board[start + i] === board[start+18 + i]) {
			return board[start + i];
		}
	}
	if (board[start] !== 0 && board[start] === board[start+10] && board[start] === board[start+20]) {
		return board[start];
	}
	if (board[start+2] !== 0 && board[start+2] === board[start+10] && board[start+2] === board[start+18]) {
		return board[start+2];
	}
	for (let i = 0; i < 3; ++i) {
		for (let j = 0; j < 3; ++j) {
			if (board[start + i + 9*j] === 0) {
				return 0;
			}
		}
	}
	return 3;
}

function isGameOver(smallBoardsSolved) {
	for (let i = 0; i < 3; ++i) {
		// check horizontals for a victory
		if (0 !== smallBoardsSolved[3*i] && smallBoardsSolved[3*i] === smallBoardsSolved[3*i+1] && smallBoardsSolved[3*i] === smallBoardsSolved[3*i+2]) {
			return smallBoardsSolved[3*i];
		}
		// check verticals for a victory
		if (0 !== smallBoardsSolved[i] && smallBoardsSolved[i] === smallBoardsSolved[i+3] && smallBoardsSolved[i] === smallBoardsSolved[i+6]) {
			return smallBoardsSolved[i];
		}
	}
	// check slash diagonal for a victory
	if (0 !== smallBoardsSolved[2] && smallBoardsSolved[2] === smallBoardsSolved[4] && smallBoardsSolved[4] === smallBoardsSolved[6]) {
		return smallBoardsSolved[2];
	}
	// check backslash diagonal for a victory
	if (0 !== smallBoardsSolved[0] && smallBoardsSolved[0] === smallBoardsSolved[4] && smallBoardsSolved[4] === smallBoardsSolved[8]) {
		return smallBoardsSolved[0];
	}
	// if any board is not finished, that means the game is not over
	for (let i = 0; i < 9; ++i) {
		if (smallBoardsSolved[i] === 0) {
			return 0;
		}
	}
	// all boards are full and no one won, so game must be tied
	return 3;
}

class TreeNode {
	constructor(move, player, parent) {
		this.totalSims = 0;
		this.newMove = move;
		this.player = player;
		this.successfulSims = 0;
		this.parent = parent;
		this.children = [];
		if (TreeNode.totalSims === undefined || TreeNode.totalSims === null) {
			TreeNode.totalSims = 0;
		}
	}

	getScore() {
		if (this.totalSims === 0) {
			return Infinity;
		} else {
			return this.successfulSims/this.totalSims + Math.sqrt(2) * Math.sqrt(Math.log(TreeNode.totalSims)/this.totalSims);
		}
	}

	getBestSearchChild() {
		let bestNode = null;
		let bestScore = -Infinity;
		for (let i = 0; i < this.children.length; ++i) {
			let childNodeScore = this.children[i].getScore();
			if (bestNode === null || childNodeScore > bestScore) {
				bestNode = this.children[i];
				bestScore = childNodeScore;
			}
		}
		return bestNode;
	}

	getBestChoice() {
		let bestNode = null;
		let bestScore = -Infinity;
		for (let i = 0; i < this.children.length; ++i) {
			if (bestNode === null) {
				bestNode = this.children[i];
				if (this.children[i].totalSims > 0) {
					let bestScore = this.children[i].successfulSims/this.children[i].totalSims;
				}
			}
			if (this.children[i].totalSims > 0 && this.children[i].successfulSims/this.children[i].totalSims > bestScore) {
				bestNode = this.children[i];
				bestScore = this.children[i].successfulSims/this.children[i].totalSims;
			}
		}
		return bestNode;
	}

	backpropagate(result) {
		this.totalSims += 1;
		if (this.player === result) {
			this.successfulSims++;
		} else if (result === 3) {
			this.successfulSims += 0.5;
		}
		if (this.parent === null) {
			TreeNode.totalSims++;
		} else {
			this.parent.backpropagate(result);
		}
	}
}

class GameState {
	/*
	Initializes GameState representing the beginning of an ultimate tic-tac-toe game
	@return void
	*/
	constructor() {
		this.board = new Array(81).fill(0); /* represents the 81 valid board locations. Goes all the way across horizontally first */
		this.moveHistory = []; /* contains history of moves */
		this.lastMove = null; /* location (number from 0 to 80) of the latest move made */
		this.smallBoardsSolved = new Array(9).fill(0); /* contains the status of each of the nine smaller boards */
		this.gameStatus = 0; /* 0 if game is ongoing, 1 if player 1 has won, 2 if player 2 has won, and 3 if tied */
		this.tree = new TreeNode(null, 2, null); // create a root node for the tree, used for MCMC algorithm
	}

	/*
	Copies over this GameState entirely, except for moveHistory, tree, and gameStatus attributes
	@return new GameState object
	*/
	simpleCopy() {
		let newGame = new GameState();
		newGame.board = this.board.slice();
		newGame.lastMove = this.lastMove;
		newGame.smallBoardsSolved = this.smallBoardsSolved.slice();
		newGame.tree = null;
		return newGame;
	}

	/*
	Adds the move of player to the GameState
	@param {number} move: the position of the new move, from 0 to 80
	@param {number} player: either 1 or 2, depending on first or second player
	@param {bool} enforceLegalMoves: determines if check should be made confirming that the intended move is valid
	@return void
	*/
	addMove(move, player, enforceLegalMoves) {
		if (!enforceLegalMoves || (player + (this.lastMove === null ? 2 : this.board[this.lastMove]) === 3 && this.getAvailableMoves().includes(move))) {
			this.board[move] = player;
			this.moveHistory.push(move);
			this.lastMove = move;
			let currSmallBoard = getCurrSmallBoard(move);
			this.smallBoardsSolved[currSmallBoard] = isSmallBoardSolved(this.board, currSmallBoard);
			this.gameStatus = isGameOver(this.smallBoardsSolved);
			if (this.tree !== null) {
				if (this.tree.children.length > 0) {
					for (let i = 0; i < this.tree.children.length; ++i) {
						if (move === this.tree.children[i].newMove) {
							this.tree = this.tree.children[i];
							this.tree.parent = null;
							TreeNode.totalSims = this.tree.totalSims;
						}
					}
				} else {
					this.tree = new TreeNode(move, player, null);
					TreeNode.totalSims = 0;
					console.log("Reset tree! This shouldn't usually happen...");
				}
			}
		} else {
			console.log("Move:", move, "by Player", player, "is invalid.");
		}
	}

	/*
	Returns list of valid moves
	@return {array}
	*/
	getAvailableMoves() {
		if (this.gameStatus !== 0) {
			return [];
		} else if (this.lastMove === null) {
			return new Array(81).fill().map((e, i) => i);
		} else {
			let availableMoves = [];
			let nextSmallBoard = getNextSmallBoard(this.lastMove);
			if (isSmallBoardSolved(this.board, nextSmallBoard) === 0) {
				for (let i = 0; i < 9; ++i) {
					if (this.board[MOVE_MAPPING[nextSmallBoard][i]] === 0) {
						availableMoves.push(MOVE_MAPPING[nextSmallBoard][i]);
					}
				}
			} else {
				for (let i = 0; i < 9; ++i) {
					if (this.smallBoardsSolved[i] === 0) {
						for (let j = 0; j < 9; ++j) {
							if (this.board[MOVE_MAPPING[i][j]] === 0) {
								availableMoves.push(MOVE_MAPPING[i][j]);
							}
						}
					}
				}
			}
			return availableMoves;
		}
	}

	/*
	Runs one simulation, starting from the state of GameState
	@return void
	*/
	buildTree() {
		let newGame = this.simpleCopy();
		let currNode = this.tree;
		while (currNode.children.length > 0) {
			currNode = currNode.getBestSearchChild();
			newGame.addMove(currNode.newMove, currNode.player, true);
		}
		if (newGame.gameStatus === 0) {
			let availableMoves = newGame.getAvailableMoves();
			for (let i = 0; i < availableMoves.length; ++i) {
				let newNode = new TreeNode(availableMoves[i], currNode.player === null ? 1 : 3 - currNode.player, currNode);
				currNode.children.push(newNode);
			}
			let randomNode = currNode.children[Math.floor(Math.random() * currNode.children.length)];
			newGame.addMove(randomNode.newMove, randomNode.player, true);
			while (newGame.gameStatus === 0) {
				availableMoves = newGame.getAvailableMoves();
				let randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
				newGame.addMove(randomMove, 3 - newGame.board[newGame.lastMove], true);
			}
			randomNode.backpropagate(newGame.gameStatus);
		} else {
			currNode.backpropagate(newGame.gameStatus);
		}
	}
}

var maxSimulations = 50000; /* sets maximum number of simulations */
var newGameOpponent = "computer";
var mainGame = new GameState(); // main game logic goes here.
for (let i = 0; i < MAX_SIMULATIONS; ++i) {
	mainGame.buildTree();
}
var isPlayerTurn = true;

window.onload = function() {
	"use strict";
	console.log("Index.js loaded");

	// test out web worker
	let worker = new Worker("worker.js");
	worker.postMessage("Send a message to worker.");
	worker.addEventListener("message", function(e) {
		console.log("Worker replied: " + e.data);
	}, false);

	/*
	var maxSimulations = 50000;
	var newGameOpponent = "computer";
	var mainGame = new GameState(); // main game logic goes here.
	for (let i = 0; i < MAX_SIMULATIONS; ++i) {
		mainGame.buildTree();
	}
	var isPlayerTurn = true;*/

	document.getElementById("show-settings").onclick = function () {
		document.getElementById("settings-dialog").showModal();
	};

	document.getElementById("save-settings").onclick = function() {
		console.log("Settings saved!");
		// TODO: actually save the settings
		let newMaxSimVal = parseInt(document.getElementById("max-simulations").value);
		maxSimulations = Math.max(1000, Math.min(100000, newMaxSimVal));
		let optionsArr = document.getElementsByName("against-choice");
		for (let i = 0; i < optionsArr.length; ++i) {
			if (optionsArr[i].checked) {
				newGameOpponent = optionsArr[i].value;
				console.log("Next game is against", optionsArr[i].value);
			}
		}
		// TODO: do all the code to start a new game (clear current game, clear temporary variables, etc)
		mainGame = new GameState();
		let clearElements = document.querySelectorAll(".small-tile, .big-tile");
		for (let i = 0; i < clearElements.length; ++i) {
			clearElements[i].classList.remove("cross");
			clearElements[i].classList.remove("circle");
			clearElements[i].classList.remove("available");
		}
		for (let i = 0; i < MAX_SIMULATIONS; ++i) {
			mainGame.buildTree();
		}
		document.getElementById("settings-dialog").close();
		console.log("Settings dialog box closed!");
	};

	document.getElementById("close-settings").onclick = function() {
		// Undo any changed settings if dialog closed with cancel
		document.getElementById("max-simulations").value = maxSimulations;
		document.getElementById(newGameOpponent === "computer" ? "pvp" : "pvm").checked = true;
		document.getElementById("settings-dialog").close();
		console.log("Settings dialog box closed!");
	};

	let smallTilesArr = document.getElementsByClassName("small-tile");
	for (let i = 0; i < smallTilesArr.length; ++i) {
		smallTilesArr[i].onclick = cellClicked;
	}

	/*
	Processes event where a player clicks on a square on SVG game board
	@param {Event} e: event that triggers a click
	@return number that represents status
	*/
	function cellClicked(e) {
		/*if (mainGame === null || mainGame.gameStatus !== 0) {
			console.log("Game is over!");
			return 1;
		}
		if (!isPlayerTurn && newGameOpponent === "computer") {
			console.log("It is not your turn!");
			return 2;
		}*/
		if (mainGame !== null && mainGame.gameStatus === 0 && isPlayerTurn) {
			isPlayerTurn = false;
			let cellNum = parseInt(e.srcElement.getAttribute("id").substring("cell".length));
			if (mainGame.getAvailableMoves().includes(cellNum)) {
				addMoveAndUpdate(mainGame, cellNum, 1);
				if (mainGame.gameStatus !== 0) {
					// TODO: handle game-over logic here.
				} else if (newGameOpponent === "computer") {
					addMoveAndUpdate(mainGame, mainGame.tree.getBestChoice().newMove, 2);
					if (mainGame.gameStatus === 0) {
						// TODO: consider letting player know that it is their turn.
						isPlayerTurn = true;
						runSimulationLoop(mainGame);
						/*runSimulationLoop2(mainGame, maxSimulations).then(() => {
							console.log("Finally done!!!!!!!!!!!!!!");
						});*/
						// create web worker here?
					} else {
						// TODO: handle game over logic here.
					}
				}
			} else {
				console.log("Invalid move.");
				isPlayerTurn = true;
				return 3;
			}
		}
	}

	/*
	Adds a move by player to the game state and updates the SVG game board
	@param {GameState} game: the game object
	@param {number} move: an integer representing a move
	@param {number} player: either 1 or 2 representing the first or second player
	@return void
	*/
	function addMoveAndUpdate(game, move, player) {
		console.log("Adding move from Player", player);
		if (game.getAvailableMoves().includes(move)) {
			game.addMove(move, player, true);
			document.getElementById("cell" + move).classList.add(player === 1 ? "cross" : "circle");
			// add circle or cross?
			document.getElementById("svg-element").appendChild(createShape(player === 1 ? "cross" : "circle", move));
			for (let i = 0; i < 9; ++i) {
				if (game.smallBoardsSolved[i] !== 0) {
					document.getElementById("sb" + i).classList.add(game.smallBoardsSolved[i] === 1 ? "cross" : "circle");
				}
			}
			let availableMoves = game.getAvailableMoves();
			for (let i = 0; i < 81; ++i) {
				document.getElementById("cell" + i).classList.remove("available");
			}
			for (let i = 0; i < availableMoves.length; ++i) {
				document.getElementById("cell" + availableMoves[i]).classList.add("available");
			}
		}
		console.log("Finished adding move from Player", player);
	}

	/*
	Creates the SVG elements for a cross or circle move
	@param {string} shapeType: either "cross" or "circle" to determine type of shapes to create
	@param {number} move: number from 0 to 80 indicating placement of move
	@return a collection of SVG elements to add to SVG
	*/
	function createShape(shapeType, move) {
		if (shapeType === "cross") {
			let groupEl = document.createElementNS("http://www.w3.org/2000/svg", "g");
			groupEl.style.stroke = "black";
			let crossLine1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
			groupEl.appendChild(crossLine1);
			crossLine1.setAttribute("x1", ((move % 9) + Math.floor((move % 9)/3)) * 100 + 50 + 25);
			crossLine1.setAttribute("y1", (Math.floor(move/9) + Math.floor(move/27)) * 100 + 50 + 25);
			crossLine1.setAttribute("x2", ((move % 9) + Math.floor((move % 9)/3)) * 100 + 50 + 75);
			crossLine1.setAttribute("y2", (Math.floor(move/9) + Math.floor(move/27)) * 100 + 50 + 75);
			let crossLine2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
			groupEl.appendChild(crossLine2);
			crossLine2.setAttribute("x1", ((move % 9) + Math.floor((move % 9)/3)) * 100 + 50 + 25);
			crossLine2.setAttribute("y1", (Math.floor(move/9) + Math.floor(move/27)) * 100 + 50 + 75);
			crossLine2.setAttribute("x2", ((move % 9) + Math.floor((move % 9)/3)) * 100 + 50 + 75);
			crossLine2.setAttribute("y2", (Math.floor(move/9) + Math.floor(move/27)) * 100 + 50 + 25);
			return groupEl;
		} else if (shapeType === "circle") {
			let groupEl = document.createElementNS("http://www.w3.org/2000/svg", "g");
			groupEl.style.stroke = "black";
			groupEl.style.fill = "none";
			let circleEl = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			groupEl.appendChild(circleEl);
			circleEl.setAttribute("cx", ((move % 9) + Math.floor((move % 9)/3)) * 100 + 100);
			circleEl.setAttribute("cy", (Math.floor(move/9) + Math.floor(move/27)) * 100 + 100);
			circleEl.setAttribute("r", 25);
			return groupEl;
		} else {
			console.error("<shapeType> parameter is invalid. Must be 'cross' or 'circle'.")
		}
	}

	/*
	Runs simulation for maxSimulation number of trials
	@param {GameState} game: the game object
	@return 0 or 1 depending on whether the loop ends because it is now player's turn or because maxTrials has been reached
	*/
	function runSimulationLoop(game) {
		console.log("Entered simulation loop.");
		let countTrials = 0;
		while (isPlayerTurn && TreeNode.totalSims <= maxSimulations) {
			// the idea here is to run only while it is player's turn; on computer's turn, stop and make best move found so far
			game.buildTree();
			countTrials++;
			if (!isPlayerTurn) {
				console.log("Player turn... exiting with", countTrials, "trials.");
				return 0;
			}
		}
		console.log("Ran", countTrials, "trials.");
		return 1;
	}

	/*function runSimulationLoop2(game, remainingTrials) {
		// console.log(game);
		if (remainingTrials === 0) {
			return Promise.resolve();
		}
		return promiseFactory(game).then(() => {
			return runSimulationLoop2(game, remainingTrials-1);
		});
	}

	function promiseFactory(game) {
		return new Promise((resolve, reject) => {
			game.buildTree();
			resolve();
		})
	}*/
};
