// index.js
import { callContract ,deployAllContracts, deploySingleContract} from './fiscoClient.js';
import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

// 调用指定合约的指定方法
app.post('/api/call_contract', async (req, res) => {
  try {
    const {
      contractName,     // String, 必填
      funcName,         // String, 必填
      funcParams = [],  // Array, 可选
      contractAddress,  // String, 可选
      options = {}      // Object，可选（WeBASE 的自定义参数）
    } = req.body;

    // 基本校验
    if (!contractName || typeof contractName !== 'string') {
      return res.status(400).json({ error: 'contractName 必须是字符串' });
    }

    if (!funcName || typeof funcName !== 'string') {
      return res.status(400).json({ error: 'funcName 必须是字符串' });
    }

    // funcParams 必须是数组
    if (!Array.isArray(funcParams)) {
      return res.status(400).json({ error: 'funcParams 必须是数组' });
    }

    // 合约地址格式校验（如果传了）
    if (contractAddress) {
      if (!/^0x[0-9a-fA-F]{40}$/.test(contractAddress)) {
        return res.status(400).json({ error: '无效的合约地址格式' });
      }
      options.contractAddress = contractAddress;
    }

    // 调用 WeBASE（自动判断 constant / 普通函数）
    const result = await callContract(
      contractName,
      funcName,
      funcParams,
      options
    );

    res.json({ ok: true, result });

  } catch (err) {
    console.error('调用合约失败:', err.response?.data || err.message);
    res.status(500).json({
      error: '链上调用失败',
      detail: err.response?.data || err.message
    });
  }
});



app.post('/api/contracts/deploy-all', async (req, res) => {
  try {
    const result = await deployAllContracts()
    res.json({ ok: true, result });
  } catch (err) {
    console.error('部署 Demo 合约失败:', err.response?.data || err.message);
    res.status(500).json({
      ok: false,
      error: 'deploy demo failed',
      detail: err.response?.data || err.message,
    });
  }
});


// 部署指定名字的合约
app.post('/api/contracts/deploy-single', async (req, res) => {
  try {
    const { contractName, constructorParams = [] } = req.body;

    if (!contractName || typeof contractName !== 'string') {
      return res.status(400).json({ ok: false, error: 'contractName 必须是字符串' });
    }

    // WeBASE 期望所有参数是字符串，这里统一转一下
    const paramsAsString = constructorParams.map((p) => String(p));

    const result = await deploySingleContract(contractName, paramsAsString);

    // result 里包含 contractName / contractAddress
    res.json({ ok: true, result });
  } catch (err) {
    console.error('部署指定合约失败:', err.response?.data || err.message);
    res.status(500).json({
      ok: false,
      error: 'deploy single contract failed',
      detail: err.response?.data || err.message,
    });
  }
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Express server listening on http://localhost:${port}`);
});