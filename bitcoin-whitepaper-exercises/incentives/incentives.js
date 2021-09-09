"use strict";

var path = require("path");
var fs = require("fs");
var crypto = require("crypto");

const KEYS_DIR = path.join(__dirname,"keys");
const PUB_KEY_TEXT = fs.readFileSync(path.join(KEYS_DIR,"pub.pgp.key"),"utf8");

// The Power of a Smile
// by Tupac Shakur
var poem = [
	"The power of a gun can kill",
	"and the power of fire can burn",
	"the power of wind can chill",
	"and the power of a mind can learn",
	"the power of anger can rage",
	"inside until it tears u apart",
	"but the power of a smile",
	"especially yours can heal a frozen heart",
];

const maxBlockSize = 4;
const blockFee = 5;
var difficulty = 16;

var Blockchain = {
	blocks: [],
};

// Genesis block
Blockchain.blocks.push({
	index: 0,
	hash: "000000",
	data: "",
	timestamp: Date.now(),
});

var transactionPool = [];

addPoem();
processPool();
countMyEarnings();


// **********************************

/*
Define addPoem(..) to loop through the lines of the poem and create a new 
transaction for each, adding each transaction to the transactionPool array. 
Each transaction should include not only the data (the line of the poem) but 
also a randomly generated positive integer value between 1 and 10 to use for 
its transaction fee, as its fee field.

After the poem's lines have been created as transactions in the pool, we'll 
then process the entire pool by selecting several transactions at a time to 
add as a single block to the blockchain, and repeating until the pool is 
empty. Because our selection order will be dependent on the amounts of the 
transaction fees, the lines of the poem will likely not be added to the 
blockchain in their chronological order; that's perfectly OK for this exercise.
*/

function addPoem() {
	for(let line of poem){
	  let tx = {
	    data: line,
	    fee : Math.ceil(Math.random() * 10),
	  };
	  tx.hash = transactionHash(tx.data);
	  transactionPool.push(tx);
	}
}

function transactionHash(data) {
	return crypto.createHash("sha256").update(
		`${JSON.stringify(data)}`
	).digest("hex");
}

function printBlockchain() {
  for(let block of Blockchain.blocks){
    console.log(`${JSON.stringify(block, null, 2)}`);
  }
}

/*
Define processPool(..) to select transactions from the pool in descending 
order of their fee value, pulling them out of the transactionPool array 
for adding to a new block. Each block's list of transactions should start with
an object representing the block-fee to be paid for adding this transaction; 
this object should include a blockFee field equal to the amount in the blockFee 
constant, as well as an account field with the public key (PUB_KEY_TEXT).

The maximum number of transactions (including the block fee) for each block is 
specified by maxBlockSize, so make sure not to exceed that count.
*/

function processPool() {
  while(transactionPool.length > 0){
  	let blockData = [{blockFee: blockFee}];
  	while(blockData.length < maxBlockSize && transactionPool.length > 0){
  	  blockData.push(getBestTx());
  	}
  	Blockchain.blocks.push(createBlock(blockData));
  }
  printBlockchain();
}

function getBestTx(){
  let currMax = 0;
  let currObj, currIdx;
  for(let tx in transactionPool){
    if(transactionPool[tx].fee > currMax){
      currMax = transactionPool[tx].fee;
      currIdx = tx;
      currObj = transactionPool[tx];
    }
  }
  transactionPool.splice(currIdx, 1);
  return currObj;
}

function countMyEarnings() {
  let total = 0;
  let blocks = Blockchain.blocks;
  for(let block of blocks){
    if(block.index == 0){ continue; }
    for(let data of block.data){
      total += data.blockFee ? data.blockFee : data.fee;
    }
  }
  console.log(total);
}

function createBlock(data) {
	var bl = {
		index: Blockchain.blocks.length,
		prevHash: Blockchain.blocks[Blockchain.blocks.length-1].hash,
		data,
		timestamp: Date.now(),
	};

	bl.hash = blockHash(bl);

	return bl;
}

function blockHash(bl) {
	while (true) {
		bl.nonce = Math.trunc(Math.random() * 1E7);
		let hash = crypto.createHash("sha256").update(
			`${bl.index};${bl.prevHash};${JSON.stringify(bl.data)};${bl.timestamp};${bl.nonce}`
		).digest("hex");

		if (hashIsLowEnough(hash)) {
			return hash;
		}
	}
}

function hashIsLowEnough(hash) {
	var neededChars = Math.ceil(difficulty / 4);
	var threshold = Number(`0b${"".padStart(neededChars * 4,"1111".padStart(4 + difficulty,"0"))}`);
	var prefix = Number(`0x${hash.substr(0,neededChars)}`);
	return prefix <= threshold;
}
