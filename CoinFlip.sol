// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CoinFlip {
    address public owner;  

    event BetPlaced(address indexed player, bool guess, uint256 amount);
    event BetResult(address indexed player, bool result, uint256 amount);
    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function flip(bool _heads) public payable {
        require(msg.value > 0, "You need to bet some tokens");
        require(address(this).balance >= msg.value * 2, "Insufficient contract balance to pay out");

        // Generate a pseudo-random number (still not secure for real applications)
        uint256 random = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % 2;
        bool result = (random == 0);

        // Emit event when bet is placed
        emit BetPlaced(msg.sender, _heads, msg.value);

        // Pay out if the guess is correct
        if (_heads == result) {
            payable(msg.sender).transfer(msg.value * 2);
            // Emit event for win
            emit BetResult(msg.sender, true, msg.value * 2);
        } else {
            // Emit event for loss
            emit BetResult(msg.sender, false, 0);
        }
    }

    // Function to allow the owner to deposit funds into the contract
    function deposit() external payable {
        require(msg.sender == owner, "Only the owner can deposit");
        // Emit event for deposit
        emit Deposited(msg.sender, msg.value);
    }

    // Function to withdraw funds from the contract (only by owner)
    function withdraw(uint256 _amount) external {
        require(msg.sender == owner, "Only the owner can withdraw");
        require(address(this).balance >= _amount, "Insufficient contract balance");
        payable(owner).transfer(_amount);
        // Emit event for withdrawal
        emit Withdrawn(owner, _amount);
    }

    // Fallback function to receive ETH
    receive() external payable {}
}
