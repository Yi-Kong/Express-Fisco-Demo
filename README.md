# 使用方法

### 前提条件

需要安装**Nodejs**和**Bun**

### 具体步骤

1. 根据Fisco Bcos 3.x的文档和webase的文档完成配置 要求在Linux下完成

  * [Fisco Bcos 3.x 文档](https://fisco-bcos-doc.readthedocs.io/zh-cn/latest/docs/quick_start/air_installation.html) 
  * [WeBase安装文档](https://webasedoc.readthedocs.io/zh-cn/lab/docs/WeBASE/install.html)

2. 在WeBase-Front中添加一个测试用户，并复制其地址

    <img width="2830" height="1648" alt="image" src="https://github.com/user-attachments/assets/791ddce5-4eb5-4d07-a926-ab89f6477771" />


3. 准备.env文件 内容如下

    ```
    PORT=3001
    WEB_BASE_URL=http://127.0.0.1:5002/WeBASE-Front
    GROUP_ID="group0"
    USER_ADDRESS=你的用户地址
    # 新增的（Node-Manager 的 http 地址）
    NODE_MGR_URL=http://127.0.0.1:5001/WeBASE-Node-Manager
    # ABI 在 WeBASE 里显示的“所属账号”
    WEBASE_ACCOUNT=admin                              # 管理台右上角登陆账号名，一般就是 admin
    ```

4. 在contracts目录中撰写合约,例如：

    **可以删除所给的Demo和HelloWorld测试合约**

    ```solidity
    // contracts/demo.sol
    pragma solidity ^0.8.11;
    
    contract Demo {
        uint256 private value;
    
        event ValueChanged(address indexed operator, uint256 oldValue, uint256 newValue);
    
        function set(uint256 newValue) public {
            uint256 old = value;
            value = newValue;
            emit ValueChanged(msg.sender, old, newValue);
        }
    
        function get() public view returns (uint256) {
            return value;
        }
    }
    ```

5. 编译合约，命令如下：

    ```
    bun compile:demo
    ```

6. 调用接口部署合约和调用合约 代码在index.js中
