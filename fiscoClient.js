// fiscoClient.js
import fs from "fs";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import { contractConfig } from "./contractConfig.js";
dotenv.config();

const WEB_BASE_URL = process.env.WEB_BASE_URL; // http://127.0.0.1:5002/WeBASE-Front
const GROUP_ID = process.env.GROUP_ID;         // 比如 "1" 或 "group0"
const USER_ADDRESS = process.env.USER_ADDRESS; // 0x 开头
const NODE_MGR_URL = process.env.NODE_MGR_URL; // http://127.0.0.1:5001/WeBASE-Node-Manager
const WEBASE_ACCOUNT = process.env.WEBASE_ACCOUNT; // Node-Manager 中的账号，如 "admin"

const BUILD_DIR = path.join(process.cwd(), "build_contracts");

// 用 JSON 存实际配置，JS 文件是自动生成的壳
const CONTRACT_CONFIG_JSON = path.join(process.cwd(), "contractConfig.json");
const CONTRACT_CONFIG_JS = path.join(process.cwd(), "contractConfig.js");

/* ------------------------------------------------------------------
 * 工具函数：加载 / 保存 contractConfig
 * ------------------------------------------------------------------ */

// 读取 JSON 配置（不存在则返回 {}）
function loadContractConfigObject() {
  if (!fs.existsSync(CONTRACT_CONFIG_JSON)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(CONTRACT_CONFIG_JSON, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("读取 contractConfig.json 失败，将从空对象开始：", e);
    return {};
  }
}

// 把配置写入 JSON + 生成 JS 导出文件
function saveContractConfigObject(configObj) {
  // 1. 写 JSON
  fs.writeFileSync(CONTRACT_CONFIG_JSON, JSON.stringify(configObj, null, 2));

  // 2. 生成 JS（供其它文件 import { contractConfig } 使用）
  const jsContent =
    `// 本文件由 fiscoClient.js 自动生成，请勿手动修改\n` +
    `export const contractConfig = ${JSON.stringify(configObj, null, 2)};\n`;

  fs.writeFileSync(CONTRACT_CONFIG_JS, jsContent);
}

/* ------------------------------------------------------------------
 * 工具函数：读取编译产物（按合约名从 build_contracts/{contractName}/ 下读）
 * ------------------------------------------------------------------ */

function loadCompiledContract(contractName) {
  const dir = path.join(BUILD_DIR, contractName);

  const abiPath = path.join(dir, `${contractName}.abi.json`);
  const bytecodePath = path.join(dir, `${contractName}.bytecode.txt`);
  const runtimePath = path.join(dir, `${contractName}.runtimeBytecode.txt`);

  if (!fs.existsSync(abiPath)) {
    throw new Error(`ABI 文件不存在: ${abiPath}`);
  }
  if (!fs.existsSync(bytecodePath)) {
    throw new Error(`bytecode 文件不存在: ${bytecodePath}`);
  }
  if (!fs.existsSync(runtimePath)) {
    throw new Error(`runtimeBytecode 文件不存在: ${runtimePath}`);
  }

  const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  const bytecode = fs.readFileSync(bytecodePath, "utf8").trim();
  const runtimeBytecode = fs.readFileSync(runtimePath, "utf8").trim();

  return { abi, bytecode, runtimeBytecode };
}

/* ------------------------------------------------------------------
 * ABI 导入 Node-Manager
 * ------------------------------------------------------------------ */

async function importAbiToNodeManager(contractName, contractAddress, abi) {
  if (!NODE_MGR_URL) {
    console.warn("NODE_MGR_URL 未配置，跳过导入 ABI 到 Node-Manager。");
    return;
  }

  const url = `${NODE_MGR_URL}/abi`;

  const payload = {
    groupId: GROUP_ID,
    contractAddress,
    contractName,
    contractAbi: abi,
    account: WEBASE_ACCOUNT,
    // abiId 可以省略，3.x 节点会自己分配，如有需要再加
  };

  console.log(`[${contractName}] 导入 ABI payload =`, payload);

  const resp = await axios.post(url, payload, {
    headers: { "Content-Type": "application/json" },
  });

  console.log(`[${contractName}] Node-Manager /abi resp.data =`, resp.data);

  if (resp.data.code !== 0) {
    throw new Error(
      `Import ABI failed: code=${resp.data.code}, message=${resp.data.message}`
    );
  }
}

/* ------------------------------------------------------------------
 * 帮助函数：从 deploy 返回解析出合约地址
 * 兼容多种 WeBASE 返回格式
 * ------------------------------------------------------------------ */

function extractAddressFromDeployResp(data) {
  if (!data) return null;

  // 1) 新版：{ code:0, message:'', data:{ contractAddress:'0x...' } }
  if (data.data && typeof data.data === "object") {
    if (data.data.contractAddress && typeof data.data.contractAddress === "string") {
      return data.data.contractAddress;
    }
    // 某些版本是直接 data 为地址字符串
    if (typeof data.data === "string" && data.data.startsWith("0x")) {
      return data.data;
    }
  }

  // 2) 旧版示例文档：直接返回 { "0x1234..." }
  if (typeof data === "string" && data.startsWith("0x")) {
    return data;
  }

  // 3) 其他奇怪格式，打印出来便于调试
  console.warn("无法从 deploy 响应中解析合约地址，data=", data);
  return null;
}

/* ------------------------------------------------------------------
 * 单合约部署：如果链上已有则跳过，否则部署
 * ------------------------------------------------------------------ */

async function deploySingleContract(contractName, constructorParams = []) {
  console.log(`\n=== 处理合约 ${contractName} ===`);

  const { abi, bytecode, runtimeBytecode } = loadCompiledContract(contractName);

  // 读取当前配置
  const configObj = loadContractConfigObject();


  // 1. 走 /contract/deploy 部署（本地私钥）
  const url = `${WEB_BASE_URL}/contract/deploy`;

  const payload = {
    groupId: GROUP_ID,
    user: USER_ADDRESS,
    contractName,
    abiInfo: abi,
    bytecodeBin: bytecode,
    contractBin: runtimeBytecode,
    funcParam: constructorParams, // 所有构造参数均使用字符串
    // 其余字段按文档是必填，但旧版本里可以不传，你之前也是这么用的
  };

  console.log(`[${contractName}] 部署 payload =`, payload);

  const resp = await axios.post(url, payload, {
    headers: { "Content-Type": "application/json" },
  });

  console.log(`[${contractName}] deploy resp.data =`, resp.data);

  const addr = extractAddressFromDeployResp(resp.data);
  if (!addr) {
    throw new Error(`[${contractName}] 无法解析部署返回的合约地址`);
  }

  console.log(`[${contractName}] 部署成功，地址 = ${addr}`);

  // 3. 导入 ABI 到 Node-Manager（可选）
  await importAbiToNodeManager(contractName, addr, abi);

  // 4. 更新并写回 contractConfig
  configObj[contractName] = {
    contractName,
    contractAddress: addr,
    contractPath: "/",
    contractAbi: abi,
  };
  saveContractConfigObject(configObj);

  return {
    contractName,
    contractAddress: addr,
  };
}

/* ------------------------------------------------------------------
 * 批量部署：build_contracts 目录下所有合约
 * ------------------------------------------------------------------ */

async function deployAllContracts() {
  if (!fs.existsSync(BUILD_DIR)) {
    throw new Error(`build_contracts 目录不存在：${BUILD_DIR}`);
  }

  const entries = fs.readdirSync(BUILD_DIR);
  const contractNames = entries.filter((name) => {
    const full = path.join(BUILD_DIR, name);
    return fs.statSync(full).isDirectory();
  });

  if (contractNames.length === 0) {
    console.warn("build_contracts 下没有任何合约目录。");
    return [];
  }

  console.log("将依次处理合约：", contractNames);

  const results = [];
  for (const name of contractNames) {
    // 此处默认构造函数无参数，如有参数可自己改成一个映射表
    const r = await deploySingleContract(name, []);
    results.push(r);
  }

  console.log("\n=== 全部合约处理完成 ===");
  console.table(
    results.map((r) => ({
      contractName: r.contractName,
      contractAddress: r.contractAddress,
    }))
  );

  return results;
}

/* ------------------------------------------------------------------
 * 合约调用封装：通过 contractConfig + /trans/handle
 * ------------------------------------------------------------------ */

// funcName: 合约函数名，如 "set" / "get"
// funcParam: 参数数组（字符串数组），如 ["333"] 或 []
async function callContract(contractName, funcName, funcParam = []) {
  const c = contractConfig[contractName];

  if (!c) {
    throw new Error(`未知的合约配置名称: ${contractName}，请先部署并写入 contractConfig。`);
  }

  const url = `${WEB_BASE_URL}/trans/handle`;

  const payload = {
    groupId: String(GROUP_ID),
    user: USER_ADDRESS,
    contractName: c.contractName,
    contractPath: c.contractPath || "/",
    version: "",
    funcName,
    funcParam, // ["333"] 这种，字符串数组
    contractAddress: c.contractAddress,
    contractAbi: c.contractAbi,
    useAes: false,
    useCns: false,
    cnsName: "",
  };

  console.log(`[${contractName}] 调用 ${funcName} payload =`, payload);

  const resp = await axios.post(url, payload, {
    headers: { "Content-Type": "application/json" },
  });

  return resp.data;
}




export {
  callContract,
  deployAllContracts,   // 新增：一次性部署 build_contracts 中所有合约
  deploySingleContract, // 新增：单个合约的按需部署
};
