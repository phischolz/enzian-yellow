// https://ethereum.stackexchange.com/questions/3720/how-do-i-get-the-raw-private-key-from-my-mist-keystore-file

// NOTE: The keyfile folder, produced with geth is expected to be inside the src/scripts/key folder!

const config = require("../../config/config")

let address = global.gConfig.node_account_address;
let password = global.gConfig.node_account_password;

const keyth = require('keythereum');
const path = require('path');

const keyPath = path.resolve(__dirname, 'key');
var keyobj = keyth.importFromFile(address, keyPath);

var privateKeyPlain = keyth.recover(password, keyobj);

let privateKeyHex = privateKeyPlain.toString('hex');
console.log('Your private key is: ', privateKeyHex);