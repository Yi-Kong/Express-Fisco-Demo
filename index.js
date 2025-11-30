// index.js
import { callContract ,deployAllContracts, deploySingleContract} from './fiscoClient.js';
import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

// 写数据：调用 HelloWorld.set(string)
app.post('/api/hello/set', async (req, res) => {
  try {
    const { value } = req.body;
    if (typeof value !== 'string') {
      return res.status(400).json({ error: 'value 必须是字符串' });
    }

    // funcParam 是 String 数组
    const result = await callContract('hello','set', [value]);

    // 对于非 constant 函数，返回的是交易收据（blockHash、txHash 等）
    res.json({ ok: true, result });
  } catch (err) {
    console.error('set 失败:', err.response?.data || err.message);
    res.status(500).json({ error: '链上调用失败', detail: err.response?.data || err.message });
  }
});

// 读数据：调用 HelloWorld.get()
app.get('/api/hello/get', async (req, res) => {
  try {
    // 没有参数就传空数组
    const result = await callContract("hello",'get', []);

    // 对于 constant(view) 函数，WeBASE 直接返回合约返回值，比如 {"Hi,Welcome!"} 这样的对象  [oai_citation:7‡WeBASE 文档](https://webasedoc.readthedocs.io/zh-cn/lab/docs/WeBASE-Front/interface.html)
    res.json({ ok: true, result });
  } catch (err) {
    console.error('get 失败:', err.response?.data || err.message);
    res.status(500).json({ error: '链上查询失败', detail: err.response?.data || err.message });
  }
});

app.get('/api/demo/get', async (req, res) => {
  try {
    // 没有参数就传空数组
    const result = await callContract("Demo",'get', []);

    // 对于 constant(view) 函数，WeBASE 直接返回合约返回值，比如 {"Hi,Welcome!"} 这样的对象  [oai_citation:7‡WeBASE 文档](https://webasedoc.readthedocs.io/zh-cn/lab/docs/WeBASE-Front/interface.html)
    res.json({ ok: true, result });
  } catch (err) {
    console.error('get 失败:', err.response?.data || err.message);
    res.status(500).json({ error: '链上查询失败', detail: err.response?.data || err.message });
  }
});


// 写数据：调用 HelloWorld.set(string)
app.post('/api/demo/set', async (req, res) => {
  try {
    const { value } = req.body;
    if (typeof value !== 'number') {
      return res.status(400).json({ error: 'value 必须是数字' });
    }

    // funcParam 是 String 数组
    const result = await callContract('Demo','set', [value]);

    // 对于非 constant 函数，返回的是交易收据（blockHash、txHash 等）
    res.json({ ok: true, result });
  } catch (err) {
    console.error('set 失败:', err.response?.data || err.message);
    res.status(500).json({ error: '链上调用失败', detail: err.response?.data || err.message });
  }
});


app.post('/api/contracts/deploy-demo', async (req, res) => {
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
app.post('/api/contracts/deploy-one', async (req, res) => {
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