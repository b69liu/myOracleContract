// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

contract ExchangeRateOracle {
    uint256 public usdToCad;
    address public oracleOwner;

    constructor(){
        oracleOwner = msg.sender;
    }

    function getUsdToCad() public view returns(uint256){
        return usdToCad;
    }

    function setUsdToCad(uint256 newRate) public{
        require(msg.sender == oracleOwner, "Only oracle owner can set rate.");
        usdToCad = newRate;
    }

}