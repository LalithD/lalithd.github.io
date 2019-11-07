"use strict";
function simulation_worker() {
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

  /*
  Returns the small board upon which next player must make their move
  @param {number} cellNum is the cell's position, 0 to 80
  @return {number} of the next small board (0 to 8)
  */
  function getNextSmallBoard(cellNum) {
  	return parseInt(3 * (((cellNum - (cellNum % 9)) / 9) % 3) + cellNum % 3);
  }

  /*
  Returns the small board which correspond's to cellNum
  @param {number} cellNum is the cell's position, 0 to 80
  @return {number} of the small board which contains cellNum (0 to 8)
  */
  function getCurrSmallBoard(cellNum) {
  	return parseInt((cellNum - cellNum % 27) / 9 + Math.floor((cellNum % 9) / 3));
  }

  /*
  Returns whether or not the small board has been solved
  (0 for unsolved/incomplete, 1 or 2 if solved by player 1 or 2, and 3 if tied)
  @param {array} board, is an 81-length array containing the board state
  @param {number} smallBoardNum, which 0 to 8, representing the small board to be checked
  @return {number}
  */
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

  /*
  Returns whether the game is over (0 for ongoing, 1 or 2 if player 1 or 2 won, and 3 for tie)
  @param {array} smallBoardsSolved, which is a 9-length array of the small boards which have been solved
  @return {number}
  */
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
  		this.totalSims = 0; // keeps track of total simulations for this node
  		this.newMove = move;
  		this.player = player;
  		this.successfulSims = 0; // these are the "good" outcomes
  		this.parent = parent; // set parent node
  		this.children = []; // child node list
  		if (TreeNode.totalSims === undefined || TreeNode.totalSims === null) {
  			TreeNode.totalSims = 0; // keeps track of total simulations for all TreeNode objects (i.e. root)
  		}
  	}

  	/*
  	Return the score of the node, used for determining best path to take (taking into account # of simulations)
  	@return {number} which loosely prioritizes rarely visited branches and high success rates
  	*/
  	getScore() {
  		if (this.totalSims === 0) {
  			return Infinity; // this means a new child will always be prioritized in a search
  		} else {
  			return this.successfulSims/this.totalSims + Math.sqrt(2) * Math.sqrt(Math.log(TreeNode.totalSims)/this.totalSims);
  		}
  	}

  	/*
  	Finds and returns the best child, based on the highest getScore() value
  	@return {TreeNode}
  	*/
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

  	/*
  	Finds and returns the child with the highest success rate.
  	@return {TreeNode}
  	*/
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

  	/*
  	After move is made, this updates simulation and success counts by going all the way to root.
  	@param {number} result is a number 1, 2, or 3 representing which player won (or a tie)
  	@return {void}
  	*/
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
  		this.board = new Array(81).fill(0); // represents the 81 valid board locations. Goes all the way across horizontally first
  		this.moveHistory = []; // contains history of moves
  		this.lastMove = null; // location (number from 0 to 80) of the latest move made
  		this.smallBoardsSolved = new Array(9).fill(0); // contains the status of each of the nine smaller boards
  		this.gameStatus = 0; // 0 if game is ongoing, 1 if player 1 has won, 2 if player 2 has won, and 3 if tied
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

  let mainGame = null;

  self.addEventListener("message", function(e) {
    response = e.data;
    if (response["message"] === "start") {
      mainGame = new GameState();
      mainGame.board = response["game"].board;
      mainGame.moveHistory = response["game"].moveHistory;
      mainGame.lastMove = response["game"].lastMove;
      mainGame.smallBoardsSolved = response["game"].smallBoardsSolved;
      mainGame.gameStatus = response["game"].gameStatus;
      self.postMessage({"message": "starting"});
      while (mainGame.tree.totalSims < response["maxIterations"]) {
        mainGame.buildTree();
      }
    } else if (response["message"] === "end") {
      // end running simulation and get the best move after player's move.
      mainGame.addMove(response["playerMove"], 1, true);
      let bestChoice = mainGame.tree.getBestChoice();
      let bestMove = bestChoice.newMove;
      let bestScore = bestChoice.successfulSims/bestChoice.totalSims;
      self.postMessage({
        "message": "ending",
        "move": bestMove,
        "score": bestScore
      });
    }
	}, false);
}
if (window != self) {
  simulation_worker();
}
