// 本文件由 fiscoClient.js 自动生成，请勿手动修改
export const contractConfig = {
  "Demo": {
    "contractName": "Demo",
    "contractAddress": "0xc860ab27901b3c2b810165a6096c64d88763617f",
    "contractPath": "/",
    "contractAbi": [
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "oldValue",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "newValue",
            "type": "uint256"
          }
        ],
        "name": "ValueChanged",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "get",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "newValue",
            "type": "uint256"
          }
        ],
        "name": "set",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  },
  "HelloWorld": {
    "contractName": "HelloWorld",
    "contractAddress": "0x2b5dcbae97f9d9178e8b051b08c9fb4089bae71b",
    "contractPath": "/",
    "contractAbi": [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "get",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "message",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_newMessage",
            "type": "string"
          }
        ],
        "name": "set",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  }
};
