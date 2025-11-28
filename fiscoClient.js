// fiscoClient.js
const axios = require("axios");
const contractConfig = require("./contractConfig");

const WEB_BASE_URL = process.env.WEB_BASE_URL; // http://127.0.0.1:5002/WeBASE-Front
const GROUP_ID = process.env.GROUP_ID; // "1"
const USER_ADDRESS = process.env.USER_ADDRESS; // 0x开头

// 通用的合约调用封装，通过 /trans/handle 接口
// funcName: 合约函数名，如 "set" / "get"
// funcParam: 参数数组（都用字符串），如 ["333"] 或 []
async function callContract(contactName, funcName, funcParam = []) {
  const url = `${WEB_BASE_URL}/trans/handle`;
  const c = contractConfig[contactName];
  if (!c) {
    throw new Error(`未知的合约配置名称: ${contactName}`);
  }
  // 根据 WeBASE 接口文档构造请求体  [oai_citation:5‡WeBASE 文档](https://webasedoc.readthedocs.io/zh-cn/lab/docs/WeBASE-Front/interface.html)
  const payload = {
    groupId: String(GROUP_ID),
    user: USER_ADDRESS,
    contractName: c.contractName,
    contractPath: "/", // 你在 WeBASE 部署时的路径，一般是 "/" 或某个目录
    version: "",
    funcName,
    funcParam, // ["333"] 这种，字符串数组
    contractAddress: c.contractAddress,
    contractAbi: c.contractAbi,
    useAes: false,
    useCns: false,
    cnsName: "",
  };

  const resp = await axios.post(url, payload, {
    headers: { "Content-Type": "application/json" },
  });

  return resp.data;
}

module.exports = {
  callContract,
};
