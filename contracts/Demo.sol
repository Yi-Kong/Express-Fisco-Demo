// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract Demo {
    uint256 private value;

    event ValueChanged(address indexed operator, uint256 oldValue, uint256 newValue);

    function set(uint256 newValue) public {
        uint256 old = value;
        value = newValue;
        emit ValueChanged(msg.sender, old, newValue);
    }

    function get() public view returns (uint256) {
        return value;
    }
}