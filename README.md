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

## 2. 配置

您可使用 “Upload Config” 按钮上传配置文件，或使用 “Input Config” 按钮在线修改配置信息，改变模拟器中的环境形状、大小，障碍物分布与用户初始位置、用户行走路线等信息。此外，您还可以使用 “Environments” 按钮，应用平台内置的预设配置，或在预设的基础上进行修改。

控制器的配置信息以 JSON 表示，其中所有长度单位均为米，角度单位均为弧度，时间单位均为秒。具体格式与意义如下：

```JSON
{
    "border_phys": [    // 物理环境的边界，用3个及以上的点表示其多边形轮廓
        {
            "x": 0,
            "y": 0
        },
        // ...
    ],
    "border_virt": [    // 虚拟空间的边界
        {
            "x": 0,
            "y": 0
        },
        // ...
    ],
    "obstacles_phys": [ // 物理空间中的障碍物集合，每个障碍物使用若干点表示其多边形轮廓
        [
            {
                "x": 20,
                "y": 20
            },
            // ...
        ],
        [
            {
                "x": 60,
                "y": 60
            },
            // ...
        ],
        // ...
    ],
    "obstacles_virt": [	// 虚拟空间中的障碍物集合，同上
        // ...
    ],
    "poi": [    // 用户行走过程中经过的点，最终行走轨迹为依次经过所有 poi 的折线
        {
            "x": 50,
            "y": 150
        },
        // ...
    ],
    "walk_speed": 1,    // 用户的行走速度
    "turn_speed": 0.1,  // 用户的转向速度
    "initial_user_phys": {  // 用户的初始物理位置
        "x": 50,
        "y": 50,
        "angle": 0, // 朝向
        "v": 0, // 线速度，设为0即可
        "w": 0  // 角速度，设为0即可
    },
    "initial_user_virt": {  // 用户的初始虚拟位置
        "x": 50,
        "y": 50,
        "angle": 0,
        "v": 0,
        "w": 0
    }
}
```

## 3. 连接控制器

本平台支持以两种方式连接用户实现的控制器：线上运行或本地运行。

### 3.1 本地运行

点击 “Local” 按钮进入本地运行模式，您需要在本地搭建并运行 WebSocket 控制器服务器，接收相关请求信息并返回用户下一步的物理位置信息。具体实现请参考 [EasyRDW-Local](https://github.com/AlyName/EasyRDW-Local-Stable) 仓库。

### 3.2 线上运行

点击 “Online - Position”  按钮进入线上运行模式，您可使用 “Upload Code”按钮上传您实现的控制器代码文件，或使用 “Default Code” 按钮恢复平台内置的默认控制器。平台进行模拟仿真时，会在每一帧调用您上传的函数，以更新用户的物理位置。

您可以使用 “Toggle Mode” 按钮在 Position 与 Gain 模式之间切换。Position 模式要求上传文件中实现 `update_user` 和 `update_reset` 两个函数，Gain 模式要求上传文件中实现 `calc_gain` 一个函数。

#### 3.2.1 所上传函数的参数与返回值要求

- `user`: `{x: int, y: int, angle: float, v: int, w: float}`
	- `x`：用户的物理 x 坐标
	- `y`：用户的物理 y 坐标
	- `angle`：用户的物理朝向
	- `v`：用户的物理线速度
	- `w`：用户的物理角速度
- `border`: 二维点列表，每个点表示为 `{x: int, y: int}`
- `obstacles`: 嵌套二维点列表，每个点表示为 `{x: int, y: int}`

`update_user` 和 `update_reset` 的返回值为：

- `user`: `{x: int, y: int, angle: float, v: int, w: float}`
	- 含义同上

`calc_gain` 的返回值为：

- `gains`：`{trans_gain, rot_gain, cur_gain}`
	- `trans_gain`：translation gain
	- `rot_gain`：rotation gain
	- `cur_gain`：curvature gain

目前，在线运行仅支持 JavaScript 语言。

## 4. 运行控制

您可使用 “Start”、“Simulate”、“Pause” 和 “Reset” 四个按钮控制模拟进程。

在初始状态，点击 “Start” 按钮可以开始运行模拟程序，点击 “Simulate” 按钮则开始运行仿真程序。模拟程序以50帧运行，您可以观察用户的实时行走轨迹；仿真程序则没有帧率限制。

开始运行后，点击 “Pause” 按钮可以暂停程序，再次点击 “Pause” 按钮则可以继续运行。点击 “Reset” 按钮恢复到开始前的初始状态。

## 5. 下载数据

在模拟或仿真运行中，您可以在 “Data Panel” 中实时查看运行数据，包括用户在物理与虚拟空间中的实时位置、当前行走总路程、触发重置次数等；在模拟过程中，您还可以在对应的画布上看到用户在虚拟与物理空间中的行走轨迹。在运行结束后，您可以使用 “Download Data” 按钮下载全程的记录数据。