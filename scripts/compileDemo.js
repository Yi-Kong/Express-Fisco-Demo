// compileContracts.js
import fs from "fs";
import path from "path";
import solc from "solc";

const contractsDir = path.join(process.cwd(), "contracts");
const buildDir = path.join(process.cwd(), "build_contracts");

if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}

// 读取全部 .sol
const sources = {};
const solFiles = fs.readdirSync(contractsDir).filter(f => f.endsWith(".sol"));

for (const file of solFiles) {
  const full = path.join(contractsDir, file);
  sources[file] = { content: fs.readFileSync(full, "utf8") };
}

// solc 输入
const input = {
  language: "Solidity",
  sources,
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  for (const e of output.errors) console.log(e.formattedMessage);
  if (output.errors.some(e => e.severity === "error")) {
    throw new Error("❌ 编译失败");
  }
}

// ★ 输出每个合约到独立文件夹
for (const sourceFile of Object.keys(output.contracts)) {
  const contracts = output.contracts[sourceFile];

  for (const contractName of Object.keys(contracts)) {
    const c = contracts[contractName];

    const outDir = path.join(buildDir, contractName);

    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir);
    }

    const abiPath = path.join(outDir, `${contractName}.abi.json`);
    const bytecodePath = path.join(outDir, `${contractName}.bytecode.txt`);
    const runtimePath = path.join(outDir, `${contractName}.runtimeBytecode.txt`);

    fs.writeFileSync(abiPath, JSON.stringify(c.abi, null, 2));
    fs.writeFileSync(bytecodePath, c.evm.bytecode.object || "");
    fs.writeFileSync(runtimePath, c.evm.deployedBytecode.object || "");

    console.log(`✅ 输出合约 ${contractName} 到 ${outDir}`);
  }
}

console.log("🎉 所有合约编译完成！");
