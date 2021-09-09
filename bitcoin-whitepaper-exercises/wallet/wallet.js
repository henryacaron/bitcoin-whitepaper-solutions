"use strict";

var path = require("path");
var fs = require("fs");

var Blockchain = require(path.join(__dirname,"blockchain.js"));

const KEYS_DIR = path.join(__dirname,"keys");
const PRIV_KEY_TEXT_1 = fs.readFileSync(path.join(KEYS_DIR,"1.priv.pgp.key"),"utf8");
const PUB_KEY_TEXT_1 = fs.readFileSync(path.join(KEYS_DIR,"1.pub.pgp.key"),"utf8");
const PRIV_KEY_TEXT_2 = fs.readFileSync(path.join(KEYS_DIR,"2.priv.pgp.key"),"utf8");
const PUB_KEY_TEXT_2 = fs.readFileSync(path.join(KEYS_DIR,"2.pub.pgp.key"),"utf8");

var wallet = {
	accounts: {},
};

addAccount(PRIV_KEY_TEXT_1,PUB_KEY_TEXT_1);

addAccount(PRIV_KEY_TEXT_2,PUB_KEY_TEXT_2);

console.log(`public key 1: ${PUB_KEY_TEXT_1}`)
console.log(`public key 2: ${PUB_KEY_TEXT_2}`)

// fake an initial balance in account #1
wallet.accounts[PUB_KEY_TEXT_1].outputs.push(
	{
		account: PUB_KEY_TEXT_1,
		amount: 42,
	}
);

main().catch(console.log);


// **********************************

async function main() {
	await spend(
		/*from=*/wallet.accounts[PUB_KEY_TEXT_1],
		/*to=*/wallet.accounts[PUB_KEY_TEXT_2],
		/*amount=*/13
	);

	await spend(
		/*from=*/wallet.accounts[PUB_KEY_TEXT_1],
		/*to=*/wallet.accounts[PUB_KEY_TEXT_2],
		/*amount=*/5
	);

	await spend(
		/*from=*/wallet.accounts[PUB_KEY_TEXT_1],
		/*to=*/wallet.accounts[PUB_KEY_TEXT_2],
		/*amount=*/31
	);

	// try {
	// 	await spend(
	// 		/*from=*/wallet.accounts[PUB_KEY_TEXT_2],
	// 		/*to=*/wallet.accounts[PUB_KEY_TEXT_1],
	// 		/*amount=*/40
	// 	);
	// }
	// catch (err) {
	// 	console.log(err);
	// }

	// console.log(accountBalance(PUB_KEY_TEXT_1));
	// console.log(accountBalance(PUB_KEY_TEXT_2));
	// console.log(await Blockchain.verifyChain(Blockchain.chain));
}

function addAccount(privKey,pubKey) {
	wallet.accounts[pubKey] = {
		privKey,
		pubKey,
		outputs: []
	};
}

/*
Modify spend(..) to create the transaction data as an object,
including verifying each input, then create that transaction, then insert it 
into a block.

Tthe data for a transaction will be an object that holds two arrays, inputs and
outputs. Each element in these arrays will be an object that represents either
the source (inputs) or target (outputs) of funds, as well as a signature to
verify each input.
*/

async function spend(fromAccount,toAccount,amountToSpend) {
	var trData = {
	inputs: [],
	outputs: [],
  };
	
	// pick inputs to use from fromAccount's outputs (i.e. previous txns, see line 22), sorted descending
	var sortedInputs = fromAccount.outputs.sort((a,b) => {return a.amount - b.amount});
	// console.log(sortedInputs);
	const inputAmounts = sortedInputs.reduce(function (total, item) {
    return total + item.amount;
  }, 0);
  // console.log(`input amounts: ${inputAmounts}`);
  if (inputAmounts < amountToSpend) {
		throw `Don't have enough to spend ${amountToSpend}!`;
	}	
	for (let input of sortedInputs) {
	  // console.log(`input: ${JSON.stringify(input)}`);
		// remove input from output-list
    sortedInputs.splice(input);
    // console.log(sortedInputs.length);
		// do we have enough inputs to cover the spent amount?
		/* If our total selected outputs (aka inputs) amounts exceeds the intended
		amount to spend, we'll need another output for this transaction that
		represents the change/refund back to the originating account for the
		difference. If we don't have enough outputs in an account for the amount
		we're spending, that should be noted as an error and the expenditure
		transaction should be aborted. */
    if(amountToSpend == 0){
      break;
    }
    const fromPrivKey = fromAccount.privKey;
    
    trData.inputs.push(await Blockchain.authorizeInput(input, fromPrivKey));
    // console.log(trData.inputs);
		if(input.amount > amountToSpend){
      trData.outputs.push({account : fromAccount.pubKey, amount: input.amount - amountToSpend});
      break;
		}
		// trData.inputs.push(authTx);
		amountToSpend = amountToSpend - input.amount;
	}
	

	// sign and record inputs

	
	// record output

	
	// is "change" output needed?
	
	
	// create transaction and add it to blockchain
	var tr = Blockchain.createTransaction(trData);
	Blockchain.insertBlock(
	// TODO .createBlock method
    Blockchain.createBlock([tr])
	);	
	
	// record outputs in our wallet (if needed)
	for (let output of trData.outputs) {
		if (output.account in wallet.accounts) {
		  console.log('here')
			wallet.accounts[output.account].outputs.push(output);
			console.log(wallet.accounts[output.account].outputs);
		}
	}

  trData.inputs.map(input => console.log(input.amount));
  trData.outputs.map(output =>console.log(output.amount));

	
}

function accountBalance(account) {
	var balance = 0;

// 	if (account in wallet.accounts) {

// 	}	
	
	
// 	return balance;
	
}
