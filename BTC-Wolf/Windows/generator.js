'use strict';

const CoinKey = require('coinkey');
const fs = require('fs');
const { Worker, isMainThread } = require('worker_threads');
const { randomBytes } = require('crypto');
const BloomFilter = require('bloom-filter');

const ADDRESS_FILE_PATH = './sample-addresses.txt';
const SUCCESS_FILE_PATH = './Success.txt';
const BATCH_SIZE = 1000;

let privateKeyHex, ck, filter, addresses, successQueue;
let count = 0;

function generate() {
  // generate random private key hex
  const privateKeyBytes = randomBytes(32);
  const privateKeyHex = privateKeyBytes.toString('hex');

  // create new bitcoin key pairs
  const ck = new CoinKey(privateKeyBytes);

  ck.compressed = false;

  if (filter.contains(ck.publicKey)) {
    console.log('');
    process.stdout.write('\x07');
    console.log('\x1b[32m%s\x1b[0m', `>> Success: ${ck.publicAddress}`);

    // add the wallet and its private key (seed) to the success queue
    successQueue.push({ address: ck.publicAddress, privateKey: ck.privateWif });

    if (successQueue.length >= BATCH_SIZE) {
      writeSuccessFile();
    }

    // close program after success
    process.exit();
  }

  count++;
  process.title = `${count} checked`;
}

function writeSuccessFile() {
  const results = successQueue.map((result) => `Wallet: ${result.address}\n\nSeed: ${result.privateKey}\n`);
  fs.appendFileSync(SUCCESS_FILE_PATH, results.join('\n'), (err) => {
    if (err) {
      console.error(`Error writing to ${SUCCESS_FILE_PATH}: ${err.message}`);
    }
  });
  successQueue = [];
}

if (isMainThread) {
  console.log('\x1b[32m%s\x1b[0m', '--> Started the program in the background');
  const data = fs.readFileSync(ADDRESS_FILE_PATH);
  const addressList = data.toString().split('\n').filter((line) => !!line.trim());

  filter = BloomFilter.create(addressList.length, 0.001);
  addressList.forEach((address) => filter.insert(Buffer.from(address, 'base64')));

  successQueue = [];

  const worker = new Worker(__filename);
  worker.on('error', (err) => console.error(`Worker error: ${err.message}`));
  worker.on('exit', (code) => console.log(`Worker exited with code ${code}`));
} else {
  while (true) {
    generate();
  }
}
