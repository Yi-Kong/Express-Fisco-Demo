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
};
