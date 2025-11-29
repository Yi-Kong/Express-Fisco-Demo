// fiscoClient.js
import fs from "fs";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import { contractConfig } from "./contractConfig.js";
dotenv.config();

const WEB_BASE_URL = process.env.WEB_BASE_URL; // http://127.0.0.1:5002/WeBASE-Front
const GROUP_ID = process.env.GROUP_ID; // "1"
const USER_ADDRESS = process.env.USER_ADDRESS; // 0x开头


function loadCompiledDemo() {
  const buildDir = path.join(process.cwd(), 'build_contracts');
  const abiPath = path.join(buildDir, 'Demo.abi.json');
  const bytecodePath = path.join(buildDir, 'Demo.bytecode.txt');
  const runtimePath = path.join(buildDir, 'Demo.runtimeBytecode.txt');

  const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
  const bytecode = fs.readFileSync(bytecodePath, 'utf8').trim();
  const runtimeBytecode = fs.readFileSync(runtimePath, 'utf8').trim();

  return { abi, bytecode, runtimeBytecode };
}


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


async function deployDemoContract() {
  const { abi, bytecode, runtimeBytecode } = loadCompiledDemo();

  const url = `${WEB_BASE_URL}/contract/deploy`;

  const payload = {
    groupId: GROUP_ID,              // group0
    user: USER_ADDRESS,             // WeBASE 本地私钥用户地址
    contractName: 'Demo',
    abiInfo: abi,                   // 就是 ABI JSON 数组
    bytecodeBin: bytecode,          // 合约 bytecode
    contractBin: runtimeBytecode,   // runtime-bytecode
    funcParam: [],                  // Demo 构造函数没有参数
    // 下面这些字段文档里列为可选/扩展，可先不填，如果接口报缺少再按错误信息补
    // contractId: 0,
    // contractPath: "/",
    // contractSource: "from-express",
    // signUserId: "",              // 如果你用了 WeBASE-Sign 再加
    // useAes: false,
    // version: ""
  };

  const resp = await axios.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  return resp.data;   // 文档示例直接返回合约地址
}

export { callContract, deployDemoContract };