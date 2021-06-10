# Simple Oracle Project

This is a Orcacle contract for etherum network. I did this to remind myself that how oracle node works.
There are two ways to update data on oracle contract:

Frontend(\web\oracle-app\src\App.js): Throgh the browser running ethers.js and react to send data to MetaMask.
Nodejs(\server\routes\serverside.js): This script use pure web3.js and private key to signe transaction and send to target blockchain network.

## Installation

Use the package manager [npm](https://www.npmjs.com/) to install packages.

```bash
npm install
cd server 
npm install
cd ../web/oracle-app
npm install
```

## Usage

config the truffle-config.js and run
```bash
truffle compile
truffle deploy
```
Run the react web or the node script



## License
[MIT](https://choosealicense.com/licenses/mit/)