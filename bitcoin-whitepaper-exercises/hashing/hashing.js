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

var Blockchain = {
	blocks: [],
};

// Genesis block
Blockchain.blocks.push({
	index: 0,
	hash: "000000",
	data: "",
	// timestamp: Date.now(),
});

// TODO: insert each line into blockchain
for (let line of poem) {
  const index = Blockchain.blocks[Blockchain.blocks.length - 1].index + 1;
  const prevHash = Blockchain.blocks[Blockchain.blocks.length - 1].hash;
  const data = line;
  // const timestamp = Date.now();
  const hash =  blockHash([index,  prevHash, data]);
  
  Blockchain.blocks.push({
    index: index,
    prevHash: prevHash,
    data: data,
    // timestamp: timestamp,
    hash: hash,
  })
}

// console.log(Blockchain.blocks);
// console.log(`Blockchain is valid: ${verifyChain(Blockchain)}`);

console.log(verifyChain(Blockchain.blocks));

// **********************************

function blockHash(bl) {
	let hash = crypto.createHash("sha256").update(bl.toString()).digest("hex");
	console.log(hash);
	 return hash;
}

function verifyChain(chain) {
  if(chain[0].hash != "000000"){
    return false;
  }
  let prevHash = chain[0].hash;
  for(let i = 1; i < chain.length; i++){
    let verified = verifyBlock(chain[i],prevHash);
    if (verified == false) return false;
    prevHash = chain[i].hash;
  }
  return true;
}
 
/*
Each block should be checked for the following:

* `data` must be non-empty
* for the genesis block only, the hash must be `"000000"`
* `prevHash` must be non-empty
* `index` must be an integer >= `0`
* the `hash` must match what recomputing the hash with `blockHash(..)` produces

In addition to verifying a block, the linkage between one block and its 
previous block must be checked, throughout the whole chain. 
That is, the block at position 4 needs to have a `prevHash` 
equal to the `hash` of the block at position `3`, and so on.
*/

function verifyBlock(bl, prevHash) {
  if(bl.data == ''){ return false; }
  
  if(bl.prevHash == ''){ return false; }
  
  if(bl.index < 0){ return false; }
  
  if(bl.hash !=  blockHash([bl.index,  prevHash, bl.data])){ return false; }
  
  if(bl.prevHash != prevHash){ return false; }
  
  return true;
}