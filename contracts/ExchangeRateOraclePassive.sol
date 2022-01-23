// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

contract ExchangeRateOraclePassive {
    address public oracleOwner;
    uint public constant MINIMAL_GAS = 80000000;
    uint public constant BASE_GAS = 3000000; // the amount of gas to excute reply other than the callback
    struct Request {
        bytes data;
        function(uint) external callback;
    }
    Request[] public requests;
    mapping(address=>uint) public balances;

    event NewRequest(uint, address); // requestId, account address

    constructor(){
        oracleOwner = msg.sender;
    }

    // deposite gas fee for an account
    // it will be used to call the callback
    function topUp(address account) external payable {
        balances[account] += msg.value;
    }
    function getPrice() public view returns(uint){
        return MINIMAL_GAS * tx.gasprice;
    }

    function query(bytes memory data, function(uint) external callback) public {
        address sender = msg.sender;
        require(balances[sender] >= MINIMAL_GAS * tx.gasprice, "balance too low");

        // concat the sender address to data
        uint bytesLength = data.length;
        require(bytesLength == 3, "invalid currency");
        bytes memory result;
        assembly{
            let p := mload(0x40)  // get free pointer, and it should point to 0x80, I think
            mstore(p, add(0x20, bytesLength))   // put the length of the result to the first slot
            mstore(0x40, add(p, add(0x40, bytesLength)))  // move free pointer forward by 0x20 + 0x20 + bytesLength bytes
            mstore(add(p, 0x20), sender)      // put the sender address to the second slot
            // place the 3 chars of the currency after address
            mstore( add(p, 0x40), mload(add(data, 0x20)))
            mstore( add(p, 0x60), mload(add(data, 0x40)))
            mstore( add(p, 0x80), mload(add(data, 0x60)))
            
            result := p
        }

        requests.push(Request(data, callback));
        emit NewRequest(requests.length - 1, sender);
    }

    function reply(uint requestID, uint response, address account) public {
        // Here goes the check that the reply comes from a trusted source
        require(msg.sender == oracleOwner, "Only oracle owner response rate.");
        uint gasBefore = gasleft();
        requests[requestID].callback{gas:MINIMAL_GAS - BASE_GAS}(response);
        uint gasAfter = gasleft();
        uint balanceSpent = (gasBefore - gasAfter + BASE_GAS) * tx.gasprice;
        require(balances[account] >= balanceSpent, "no enough gas");
        balances[account] -= balanceSpent;
        // transfer the money spent back to oracle owner
        payable(msg.sender).transfer(balanceSpent);
    }

}