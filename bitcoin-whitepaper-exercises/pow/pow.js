"use strict";

var crypto = require("crypto");

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

var difficulty = 10;

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

for (let line of poem) {
	let bl = createBlock(line);
	Blockchain.blocks.push(bl);
	console.log(`Hash (Difficulty: ${difficulty}): ${bl.hash}`);

	difficulty++;
}
// **********************************

function createBlock(data) {
	var bl = {
		index: Blockchain.blocks.length,
		prevHash: Blockchain.blocks[Blockchain.blocks.length-1].hash,
		data,
		timestamp: Date.now(),
	};
  // console.log(bl);
	bl.hash = blockHash(bl);

	return bl;
}

function blockHash(bl) {
  let hash;
  do{
    bl.nonce = getNonce();
    hash = makeHash(bl);
  } while (!hashIsLowEnough(hash));
	return hash;
}

function getNonce() {
  return crypto.randomBytes(4).toString('hex');
}

function makeHash(bl) {
  const blString = JSON.stringify(bl);
  return crypto.createHash("sha256").update(blString).digest("hex");
}

function hashIsLowEnough(hash) {
  
  let num_places = Math.ceil(difficulty / 4);
  
  let hashDiv = hash.substring(0, num_places);
  let hash2bin = (parseInt(hashDiv, 16).toString(2)).padStart(num_places * 4, '0');
  
  for(let i = 0; i < difficulty; i ++){
    if(hash2bin[i] != '0'){ return false};
  }
  return true;
}

function verifyBlock(bl) {
	if (bl.data == null) return false;
	if (bl.index === 0) {
		if (bl.hash !== "000000") return false;
	}
	else {
		if (!bl.prevHash) return false;
		if (!(
			typeof bl.index === "number" &&
			Number.isInteger(bl.index) &&
			bl.index > 0
		)) {
			return false;
		}
		if (bl.hash !== blockHash(bl)) return false;
	}

	return true;
}

function verifyChain(chain) {
	var prevHash;
	for (let bl of chain.blocks) {
		if (prevHash && bl.prevHash !== prevHash) return false;
		if (!verifyBlock(bl)) return false;
		prevHash = bl.hash;
	}

	return true;
}
