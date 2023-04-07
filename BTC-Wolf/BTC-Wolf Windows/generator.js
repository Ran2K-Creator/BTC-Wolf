"use strict";

const CoinKey = require('coinkey');
const fs = require('fs');

let privateKeyHex, ck, addresses;
addresses = new Map();

const data = fs.readFileSync('./btc-database.txt');
data.toString().split("\n").forEach(address => addresses.set(address, true));

let count = 0;
const startTime = Date.now();

function generate() {
    // generate random private key hex
    let privateKeyHex = r(64);
    
    // create new bitcoin key pairs
    let ck = new CoinKey(Buffer.from(privateKeyHex, 'hex'));
    
    ck.compressed = false;
    //console.log(ck.publicAddress)
    // remove the 
        
    if(addresses.has(ck.publicAddress)){
        console.log("");
        process.stdout.write('\x07');
        console.log("\x1b[32m%s\x1b[0m", ">> Success: " + ck.publicAddress);
        var successString = "Wallet: " + ck.publicAddress + "\n\nSeed: " + ck.privateWif;
            
        // save the wallet and its private key (seed) to a Results.txt file in the same folder 
        fs.writeFileSync('./Results.txt', successString, (err) => {
            if (err) throw err; 
        })
            
        // close program after success
        process.exit();
    }
    // destroy the objects
    ck = null;
    privateKeyHex = null;
    
    count++;
    process.title = `${count}  checked`;
}

// the function to generate random hex string
function r(l) {
    let randomChars = 'ABCDEF0123456789';
    let result = '';
    for ( var i = 0; i < l; i++ ) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}

console.log("\x1b[32m%s\x1b[0m", "--> Started the program in the background, to see the proccess go to line 23"); // don't trip, it works

// run forever
while(true){
    generate();
    if (process.memoryUsage().heapUsed / 1000000 > 500) {
        global.gc();
    }
}