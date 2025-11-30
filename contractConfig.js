// 本文件由 fiscoClient.js 自动生成，请勿手动修改
export const contractConfig = {
  "Demo": [
    {
      "contractName": "Demo",
      "contractAddress": "0xace9eb31c30d607e91214b8c540d73f276d63656",
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
      ],
      "deployedAt": 1764506062172
    },
    {
      "contractName": "Demo",
      "contractAddress": "0x1d38f5d0c8c1ae7ed63a2d0ec905b9e9a17e70cf",
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
      ],
      "deployedAt": 1764506092621
    },
    {
      "contractName": "Demo",
      "contractAddress": "0xbf158a2ae101139d73a0eab88127905eefd3d2b7",
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
      ],
      "deployedAt": 1764507464814
    }
  ],
  "HelloWorld": [
    {
      "contractName": "HelloWorld",
      "contractAddress": "0xe46925ca51074d3b83ba993a4e88d0156eca6a06",
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
      ],
      "deployedAt": 1764506065323
    }
  ]
};
