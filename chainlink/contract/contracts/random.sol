// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract MyRandom is VRFConsumerBase, ConfirmedOwner(msg.sender) {
    // variables
    bytes32 private s_keyHash;
    uint256 private s_fee;
    mapping(bytes32 => address) private s_rollers;
    mapping(address => uint256) private s_results;
    uint256 private constant ROLL_IN_PROGRESS = 42;
    uint256 public myRandomNumber;


    // constructor
    // https://docs.chain.link/docs/vrf-contracts/
    constructor()
        VRFConsumerBase(0x8C7382F9D8f56b33781fE506E897a4F1e2d17255, 0x326C977E6efc84E512bB9C30f76E30c160eD06FB)
    {
        s_keyHash = 0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4;
        s_fee = 0.0001 * 10 ** 18;
    }

    // rollDice function
    function rollDice(address roller) public onlyOwner returns (bytes32 requestId) {
        // checking LINK balance
        require(LINK.balanceOf(address(this)) >= s_fee, "Not enough LINK to pay fee");

        // checking if roller has already rolled die
        require(s_results[roller] == 0, "Already rolled");

        // requesting randomness
        requestId = requestRandomness(s_keyHash, s_fee);

        // storing requestId and roller address
        s_rollers[requestId] = roller;

        // emitting event to signal rolling of die
        s_results[roller] = ROLL_IN_PROGRESS;
    }
    
    // fulfillRandomness function
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {

        // transform the result to a number between 1 and 20 inclusively
        uint256 d20Value = (randomness % 20) + 1;

        // assign the transformed value to the address in the s_results mapping variable
        s_results[s_rollers[requestId]] = d20Value;
        myRandomNumber = d20Value;
    }
}