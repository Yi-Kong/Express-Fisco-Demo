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

// 现在只用 JS 文件作为配置，不再使用 JSON
const CONTRACT_CONFIG_JS = path.join(process.cwd(), "contractConfig.js");

/* ------------------------------------------------------------------
 * 工具函数：加载 / 保存 contractConfig（只操作 JS 文件）
 * ------------------------------------------------------------------ */

// 从已 import 的 contractConfig 拿配置对象，兜底 {}
function getContractConfigObject() {
  if (contractConfig && typeof contractConfig === "object") {
    // 浅拷贝一份，避免直接改 import 进来的对象引用
    return { ...contractConfig };
  }
  return {};
}

// 把配置写入 JS 导出文件（供其它文件 import { contractConfig } 使用）
function saveContractConfig(configObj) {
  const jsContent =
    `// 本文件由 fiscoClient.js 自动生成，请勿手动修改\n` +
    `export const contractConfig = ${JSON.stringify(configObj, null, 2)};\n`;

  fs.writeFileSync(CONTRACT_CONFIG_JS, jsContent);
}

/**
 * 兼容：老版本 config 里某个 key 可能是单个对象，这里统一转成数组
 *  - undefined/null      -> []
 *  - Array               -> 原样返回
 *  - Object (单个配置)    -> [Object]
 */
function normalizeContractList(entryOrList) {
  if (!entryOrList) return [];
  if (Array.isArray(entryOrList)) return entryOrList;
  return [entryOrList];
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
 * 单合约部署：记录所有同名合约
 * ------------------------------------------------------------------ */

async function deploySingleContract(contractName, constructorParams = []) {
  console.log(`\n=== 处理合约 ${contractName} ===`);

  const { abi, bytecode, runtimeBytecode } = loadCompiledContract(contractName);

  // 读取当前配置（来源于 contractConfig.js，而不是 JSON）
  const configObj = getContractConfigObject();

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

  // 4. 更新并写回 contractConfig（只写 JS）
  const newEntry = {
    contractName,
    contractAddress: addr,
    contractPath: "/",
    contractAbi: abi,
    deployedAt: Date.now(), // 记录部署时间（可选）
  };

  const oldList = normalizeContractList(configObj[contractName]);
  // 在原有基础上插入：这里选择 push 到末尾，保证最后一个是最新部署
  const newList = [...oldList, newEntry];

  configObj[contractName] = newList;
  saveContractConfig(configObj);

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

/**
 * funcName: 合约函数名，如 "set" / "get"
 * funcParam: 参数数组（字符串数组），如 ["333"] 或 []
 * options:
 *   - contractAddress: 可选，指定要调用的某个地址；
 *                      不传则默认使用该合约名下最后一个（最新部署）
 */
async function callContract(contractName, funcName, funcParam = [], options = {}) {
  const list = normalizeContractList(contractConfig[contractName]);

  if (!list || list.length === 0) {
    throw new Error(
      `未知的合约配置名称: ${contractName}，请先部署并写入 contractConfig。`
    );
  }

  const { contractAddress } = options;

  let c;
  if (contractAddress) {
    const addrLower = contractAddress.toLowerCase();
    c = list.find(
      (item) =>
        item &&
        item.contractAddress &&
        item.contractAddress.toLowerCase() === addrLower
    );
    if (!c) {
      throw new Error(
        `在 contractConfig 中未找到合约 ${contractName} 的地址 ${contractAddress}`
      );
    }
  } else {
    // 未指定地址，默认使用最后一个（最新）
    c = list[list.length - 1];
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

  console.log(
    `[${contractName}] 调用 ${funcName} (address=${c.contractAddress}) payload =`,
    payload
  );

  const resp = await axios.post(url, payload, {
    headers: { "Content-Type": "application/json" },
  });

  return resp.data;
}

export {
  callContract,
  deployAllContracts,   // 一次性部署 build_contracts 中所有合约
  deploySingleContract, // 单个合约的部署（并记录到数组）
};
