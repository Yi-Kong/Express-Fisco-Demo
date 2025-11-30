export const contractConfig = {
  hello: {
    contractName: "HelloWorld",
    contractAddress: "0x37a44585bf1e9618fdb4c62c4c96189a07dd4b48", // 在 WeBASE 合约列表中复制
    contractPath: "/", // 合约目录，和 WeBASE 里的一致
    contractAbi: [
      {
        constant: false,
        inputs: [{ name: "m", type: "string" }],
        name: "set",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "get",
        outputs: [{ name: "", type: "string" }],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "message",
        outputs: [{ name: "", type: "string" }],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "constructor",
      },
    ],
  },
  Demo: {
    contractName: "Demo",
    contractAddress: "0x6849f21d1e455e9f0712b1e99fa4fcd23758e8f1", // 部署后填写实际地址
    contractPath: "/",
    contractAbi: [
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
  }

};
