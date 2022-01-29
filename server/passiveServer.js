const Web3 = require('web3');
const web3  = new Web3("ws://127.0.0.1:7545");
const BN = web3.utils.BN;
const abi = require('./ExchangeRateOraclePassiveAbi.json');
const { getUsdToCad } = require('./services/exchangeRate');


const privateKey =  'c1eb954b4da2aa307198880ec0439f307ae4f5ef7340c13f96bb09f853f3d72c';  // test account from Ganache desktop
const contractAddress = "0x626164d3A2A85F30B8253c246E0232Ce05283293";                    // test address on Ganache
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
        // const requestorAddress = "0x" + myRequest.data.substring(26, 26+40); // 20 bytes = 40 Hex Char
        const currency = new Buffer.from(myRequest.data.substring(26+40),"hex").toString();
        const valueAttached = myRequest.valueAttached;
        let rate = null;
        if(currency === "USD"){
            rate = await getUsdToCad();
        }else{
            return;
        }
        const rateInteger =  Math.round(rate * DECIMALS);
        await replyRate(requestId, rateInteger, valueAttached);
    });
}

listenForRequests();

async function replyRate(requestId,rate, valueAttached){
    try{
        // sign the transaction data
        const data = myContract.methods.reply(requestId, rate).encodeABI();

        // calculate how much gas to use
        const currentGasPriceString = await web3.eth.getGasPrice();
        const currentGasPrice = new BN(currentGasPriceString);
        valueAttached = new BN(valueAttached);
        const gas = valueAttached.div(currentGasPrice);

        // reference: https://web3js.readthedocs.io/en/v1.2.0/web3-eth-accounts.html#eth-accounts-signtransaction
        let signedMessage = await myAccount.signTransaction({
            to: contractAddress,
            data,
            value: 0,
            gas: gas.toString(),
            gasPrice: currentGasPriceString,
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
