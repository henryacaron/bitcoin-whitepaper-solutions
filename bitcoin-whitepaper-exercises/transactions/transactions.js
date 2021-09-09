"use strict";

var path = require("path");
var fs = require("fs");
var crypto = require("crypto");
var openpgp = require("openpgp");

const KEYS_DIR = path.join(__dirname,"keys");
const PRIV_KEY_TEXT = fs.readFileSync(path.join(KEYS_DIR,"priv.pgp.key"),"utf8");
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

addPoem()
.then(checkPoem)
.catch(console.log);


/*
In addPoem(), for each line of the poem, create and authorize a transaction 
object and store it in the transactions array. Then add set those transactions 
as the data for a new block, and insert the block into the blockchain.
*/

async function addPoem() {
	var transactions = [];

	// TODO: add poem lines as authorized transactions
	for (let line of poem) {
	  let tr = createTransaction(line);
	  await authorizeTransaction(tr);
	  transactions.push(tr);
	}
	var bl = createBlock(transactions);

	Blockchain.blocks.push(bl);
  console.log(bl);
	return Blockchain;
}

async function checkPoem(chain) {
	console.log(await verifyChain(chain));
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
/*
Define a createTransaction(..) function that takes the text (line of a poem) 
and creates a transaction object. The transaction object should have a data. 
The transaction then needs a hash field with the value returned from 
transactionHash(..).
*/

function createTransaction(data){
  console.log(data)
  let tr = {
    data,
  }
  tr.hash = transactionHash(tr);
  return tr;
}


function transactionHash(tr) {
	return crypto.createHash("sha256").update(
		`${JSON.stringify(tr.data)}`
	).digest("hex");
}

/*
Define an asynchronous authorizeTransaction(..) function which then adds to 
the transaction object, a pubKey field with the public key text (PUB_KEY_TEXT), 
and a signature field with the signature created by awaiting a call to 
createSignature(..).
*/

async function authorizeTransaction(tr){
  tr.pubKey = PUB_KEY_TEXT;
  tr.signature = await createSignature(tr.data, PRIV_KEY_TEXT);
}

async function createSignature(text,privKey) {
	var privKeyObj = openpgp.key.readArmored(privKey).keys[0];

	var options = {
		data: text,
		privateKeys: [privKeyObj],
	};

	return (await openpgp.sign(options)).data;
}

async function verifySignature(signature,pubKey) {
	try {
		let pubKeyObj = openpgp.key.readArmored(pubKey).keys[0];

		let options = {
			message: openpgp.cleartext.readArmored(signature),
			publicKeys: pubKeyObj,
		};

		return (await openpgp.verify(options)).signatures[0].valid;
	}
	catch (err) {}

	return false;
}

function blockHash(bl) {
	return crypto.createHash("sha256").update(
		`${bl.index};${bl.prevHash};${JSON.stringify(bl.data)};${bl.timestamp}`
	).digest("hex");
}

/*
Modify verifyBlock(..) to validate all the transactions in the data of a block.
It may be useful to define a verifyTransaction(..) function.

Each transaction should be verified according to:

hash should match what's computed with transactionHash(..)

should include pubKey string and signature string fields

the signature should verify correctly with verifySignature(..)

Print out verification that the blockchain is valid after having added all 
the poem text as transactions.
*/

async function verifyBlock(bl) {
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
		if (!Array.isArray(bl.data)) return false;

		for(tr of bl.data){
      verifyTransaction(tr);
    }
	}

	return true;
}

function verifyTransaction(tr){
  tr.hash = transactionHash({data: tr.data});
  if(!tr.pubKey){
    return false;
  }
  if(!tr.signature){
    return false;
  }
  if(!verifySignature(tr.signature, tr.pubKey)){
    return false;
  }
  console.log(`Line valid: ${tr.data}`);
}

async function verifyChain(chain) {
	var prevHash;
	for (let bl of chain.blocks) {
		if (prevHash && bl.prevHash !== prevHash) return false;
		if (!(await verifyBlock(bl))) return false;
		prevHash = bl.hash;
	}

	return true;
}
