// scripts/compileDemo.js
import fs from 'fs';
import path from 'path';
import solc from 'solc';

const contractPath = path.join(process.cwd(), 'contracts', 'Demo.sol');
console.log(`编译合约: ${contractPath}`);
const source = fs.readFileSync(contractPath, 'utf8');

// solc 标准输入格式
const input = {
  language: 'Solidity',
  sources: {
    'demo.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode'],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  for (const err of output.errors) {
    console.error(err.formattedMessage);
  }
}

// 合约名 Demo
const contract = output.contracts['demo.sol']['Demo'];

if (!contract) {
  throw new Error('未找到 Demo 合约编译结果');
}

const abi = contract.abi;
const bytecode = contract.evm.bytecode.object;
const runtimeBytecode = contract.evm.deployedBytecode.object;

// 输出到 build 目录
const buildDir = path.join(process.cwd(), '.', 'build_contracts');
if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir);

fs.writeFileSync(path.join(buildDir, 'Demo.abi.json'), JSON.stringify(abi, null, 2));
fs.writeFileSync(path.join(buildDir, 'Demo.bytecode.txt'), bytecode);
fs.writeFileSync(path.join(buildDir, 'Demo.runtimeBytecode.txt'), runtimeBytecode);

console.log('编译完成：build_contracts/Demo.abi.json  和  Demo.bytecode.txt / Demo.runtimeBytecode.txt');