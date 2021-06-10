const Web3 = require('web3');
const web3  = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
const abi = require('./ExchangeRateOracleAbi.json');

// const privateKey =  Buffer.from('40ff2e23b6e73276e1286b1dfcd6354f761a2260ddb7951eb1d6766a2ed18382', 'hex');
const privateKey =  '0x40ff2e23b6e73276e1286b1dfcd6354f761a2260ddb7951eb1d6766a2ed18382';
const contractAddress = "0x609Cc7a0b09542e135F643bA1dd38EFb1BBd183d";
const myContract = new web3.eth.Contract(abi, contractAddress);
const myAccount = web3.eth.accounts.privateKeyToAccount(privateKey);


// getTransactionCount will be called by default
// async function getCurrentNonce(address){
//     return web3.eth.getTransactionCount(address,"pending");
// }
    
async function main(){
    const data = myContract.methods.setUsdToCad("151211").encodeABI();
    await updateRate(data,0);
    const newState = await myContract.methods.usdToCad().call();
    console.log("result:",newState);
}
main();




async function updateRate(data,value){
    try{
        // sign the transaction data
        // reference: https://web3js.readthedocs.io/en/v1.2.0/web3-eth-accounts.html#eth-accounts-signtransaction
        let signedMessage = await myAccount.signTransaction({
            to: contractAddress,
            data,
            value,
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
