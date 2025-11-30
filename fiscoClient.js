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
const NODE_MGR_URL = process.env.NODE_MGR_URL;
const WEBASE_ACCOUNT = process.env.WEBASE_ACCOUNT;

function loadCompiledDemo() {
  const buildDir = path.join(process.cwd(), "build_contracts");

  const abiPath = path.join(buildDir, "Demo.abi.json");
  const bytecodePath = path.join(buildDir, "Demo.bytecode.txt");
  const runtimePath = path.join(buildDir, "Demo.runtimeBytecode.txt");

  const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  const bytecode = fs.readFileSync(bytecodePath, "utf8").trim();
  const runtimeBytecode = fs.readFileSync(runtimePath, "utf8").trim();

  return { abi, bytecode, runtimeBytecode };
}

async function importDemoAbiToNodeManager(contractAddress) {
  const { abi } = loadCompiledDemo();

  const url = `${NODE_MGR_URL}/abi`;

  const payload = {
    groupId: GROUP_ID,            // 建议 env 里写 group0
    contractAddress,              // 部署得到的地址
    contractName: "Demo",
    contractAbi: abi,             // 这里字段名是 contractAbi
    account: WEBASE_ACCOUNT,      // 比如 "admin"
    // abiId 可以不传，3.x 后端会自己分配；如果报错再显式给 0
    // abiId: 1,
  };

  console.log("import ABI payload =", payload);

  const resp = await axios.post(url, payload, {
    headers: { "Content-Type": "application/json" },
  });

  console.log("Node-Manager /abi resp.data =", resp.data);

  if (resp.data.code !== 0) {
    throw new Error(
      `Import ABI failed: code=${resp.data.code}, message=${resp.data.message}`
    );
  }
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
    groupId: GROUP_ID,
    user: USER_ADDRESS, // 你在 WeBASE 的用户地址
    contractName: "Demo",
    abiInfo: abi,
    bytecodeBin: bytecode,
    contractBin: runtimeBytecode,
    funcParam: [], // Demo 构造函数没有参数
    // contractId: 0,
    // contractPath: '/',
    // contractSource: 'from-express',
    // signUserId: '',              // 用 WeBASE-Sign 再补
    // useAes: false,
    // version: ''
  };

  const resp = await axios.post(url, payload, {
    headers: { "Content-Type": "application/json" },
  });

  console.log("resp:", resp.data);
  // 这里取出 WeBASE 返回的合约地址（按你的实际返回结构调整）
  // if (resp.data.code !== 0) {
  //   throw new Error(
  //     `Deploy failed: code=${resp.data.code}, message=${resp.data.message}`
  //   );
  // }

  // const contractAddress = resp.data.data.contractAddress;
  // 如果你中间还有一层封装，只要保证最后拿到地址即可

  // ★ 新增：把 ABI + 地址导入到 WeBASE-Node-Manager
  await importDemoAbiToNodeManager(resp.data);

  // 返回地址给上层使用
  return resp.data;
}

export { callContract, deployDemoContract };
