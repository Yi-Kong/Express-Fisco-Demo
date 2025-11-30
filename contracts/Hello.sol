// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloWorld {
    string public message;

    // 构造函数，在部署合约时执行一次
    constructor() {
        message = "Hello, World!";
    }

    // 读取当前消息（因为 message 声明为 public，其实会自动生成同名 getter）
    function get() public view returns (string memory) {
        return message;
    }

    // 修改消息
    function set(string memory _newMessage) public {
        message = _newMessage;
    }
}
