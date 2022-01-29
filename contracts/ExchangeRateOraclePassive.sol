// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

contract ExchangeRateOraclePassive {
    address public oracleOwner;
    struct Request {
        bytes data;
        uint valueAttached;
        function(uint) external callback;
    }
    Request[] public requests;

    event NewRequest(uint, address); // requestId, account address

    constructor(){
        oracleOwner = msg.sender;
    }

    // user has to send query with the gas fee
    function query(bytes memory data, function(uint) external callback) public payable {
        address sender = msg.sender;
        uint256 valueAttached = msg.value;
        require(valueAttached >= 1000000 * tx.gasprice, "attached fee too low");

        // concate sender address and data
        uint bytesLength = data.length;
        bytes memory result;
        assembly{
            let p := mload(0x40)
            mstore(p, add(0x20, bytesLength))   // length of the result
            mstore(0x40, add(p, add(0x40, bytesLength)))  // move free pointer forward by 0x20 + 0x20 + bytesLength bytes
            mstore(add(p, 0x20), sender)

            mstore( add(p, 0x40), mload(add(data, 0x20)))
            mstore( add(p, 0x60), mload(add(data, 0x40)))
            mstore( add(p, 0x80), mload(add(data, 0x60)))
            
            result := p
        }

        // add request to task queue
        requests.push(Request(result, valueAttached, callback));
        emit NewRequest(requests.length - 1, sender);
    }

    function reply(uint requestID, uint response) public {
        // Here goes the check that the reply comes from a trusted source
        require(msg.sender == oracleOwner, "Only oracle owner response rate.");
        requests[requestID].callback(response);
        payable(msg.sender).transfer(requests[requestID].valueAttached);
    }

}