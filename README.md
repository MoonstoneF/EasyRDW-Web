# Easy RDW-Web
Run your RDW controller on the web!

## 1. 安装
1. 将仓库克隆到本地；

2. 安装所需依赖；
```
pip install -r requirements.txt
```

3. 在8000端口运行网页服务器；
```
uvicorn main:app --host 0.0.0.0 --port 8000 # remember to open port8000 to public IP
```

## 2. 使用

### 2.1 输入配置

本平台支持配置环境边界、障碍物、用户初始位置、用户速度等信息，共有两种方式

### 2.2 选择模式与连接控制器

本平台支持以两种方式连接用户实现的控制器：线上运行或本地运行。

#### 2.2.1 线上运行

点击 “Online - Position”  按钮进入线上运行模式，您可使用 “Upload Code”按钮上传您实现的控制器代码文件，或使用 “Default Code” 按钮恢复平台内置的默认控制器。

您可以使用 “Toggle Mode” 按钮在 Position 与 Gain 模式之间切换。Position 模式要求控制器实现 ``

目前，在线运行仅支持 JavaScript 语言，您需要实现
