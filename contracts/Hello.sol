// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Hello {
    string private greeting;
    address public owner;

    event GreetingChanged(string indexed oldGreeting, string indexed newGreeting);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(string memory _greeting) {
        owner = msg.sender;
        greeting = _greeting;
    }

    function say() external view returns (string memory) {
        return greeting;
    }

    function setGreeting(string memory _greeting) external {
        require(msg.sender == owner, "Hello: caller is not the owner");
        string memory old = greeting;
        greeting = _greeting;
        emit GreetingChanged(old, _greeting);
    }

    function transferOwnership(address newOwner) external {
        require(msg.sender == owner, "Hello: caller is not the owner");
        require(newOwner != address(0), "Hello: new owner is the zero address");
        address previous = owner;
        owner = newOwner;
        emit OwnershipTransferred(previous, newOwner);
    }
}