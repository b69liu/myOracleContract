const Web3 = require('web3');
const web3  = new Web3("ws://127.0.0.1:7545");
const abi = require('./ExchangeRateOraclePassiveAbi.json');
const { getUsdToCad } = require('./services/exchangeRate');


const privateKey =  '76d2e76997a6517c24e694bc7f40abd58123762bc934225ef5df7844233c0c61';  // test account from Ganache desktop
const contractAddress = "0xa81e95274f707EFDF6f03794591EE5c32531CDEF";
const myContract = new web3.eth.Contract(abi, contractAddress);
const myAccount = web3.eth.accounts.privateKeyToAccount(privateKey);


const DECIMALS = 10000;  // we want to use smallest integer unit to store rate, instead of float
async function listenForRequests(){
    console.log("Listening for events from orcle contract")
    myContract.events.NewRequest(async (error, event) => {
        if(error) return;
        let requestId = event?.returnValues[0];
        console.log("event:",requestId);
        const myRequest =  await myContract.methods.requests(`${requestId}`).call();
        console.log("request:",myRequest)
        const requestorAddress = "0x" + myRequest.data.substring(26, 26+40); // 20 bytes = 40 Hex Char
        const currency = new Buffer.from(myRequest.data.substring(26+40),"hex").toString();
        let rate = null;
        if(currency === "USD"){
            rate = await getUsdToCad();
        }else{
            return;
        }
        const rateInteger =  rate * DECIMALS;
        await replyRate(requestId, rateInteger, requestorAddress);
    });
}

listenForRequests();

async function replyRate(requestId,rate,account){
    try{
        // sign the transaction data
        const data = myContract.methods.reply(requestId, rate, account).encodeABI();
        // reference: https://web3js.readthedocs.io/en/v1.2.0/web3-eth-accounts.html#eth-accounts-signtransaction
        let signedMessage = await myAccount.signTransaction({
            to: contractAddress,
            data,
            value: 0,
            gas: 2000000,
            gasPrice: '0x20000000000',
            gasLimit: '0x27511'
        });
        const receipt = await web3.eth.sendSignedTransaction(signedMessage.rawTransaction)
        .once('transactionHash', function(hash){ console.log("transactionHash") })
        .once('receipt', function(receipt){ console.log("on receipt") })
        .on('confirmation', function(confNumber, receipt){ console.log("confirmation",confNumber) })
        .on('error', function(error){ console.log("error", error) })
        console.log("trasaction mined", receipt);
        return receipt;
    }catch(e){
        console.log(e);
    }
}
