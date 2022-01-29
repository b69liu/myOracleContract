// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import './ExchangeRateOraclePassive.sol';


contract PassiveOracleUser {
    ExchangeRateOraclePassive private oracle;
    uint public exchangeRate;
    address owner;
    
    constructor() {
        owner = msg.sender;
    }

    function setOracle(address newContract) public{
        require(owner == msg.sender, "only contract owner can set oracle contract address");
        oracle = ExchangeRateOraclePassive(newContract);
    }


    function requestExchangeRate() public payable{
        require(address(oracle)!=address(0x0), "please setup oracle contract");
        oracle.query{value: msg.value}("USD", this.oracleResponse);
    }

    function oracleResponse(uint response) public {
        require(
            msg.sender == address(oracle),
            "Only oracle can call this."
        );
        exchangeRate = response;
    }
}