// Local 和 Online 按钮切换逻辑
const localControls = document.getElementById("localControls");
const onlineControls = document.getElementById("onlineControls");

function toggleLocal() {
    localControls.style.display = (localControls.style.display === "none" || localControls.style.display === "") ? "block" : "none";
    onlineControls.style.display = "none"; // 隐藏 Online 按钮组
}

function toggleOnline() {
    onlineControls.style.display = (onlineControls.style.display === "none" || onlineControls.style.display === "") ? "block" : "none";
    localControls.style.display = "none"; // 隐藏 Local 按钮组
}

// 处理上传配置文件的功能
document.getElementById('uploadConfig').addEventListener('click', function () {
    document.getElementById('fileUploadInput').click();
});

// 处理输入配置的功能
document.getElementById('inputConfig').addEventListener('click', function () {
    document.getElementById('inputConfigModal').style.display = 'block';
});

document.getElementById('submitConfigButton').addEventListener('click', function () {
    const configInput = document.getElementById('configInput').value;
    try {
        config = JSON.parse(configInput); // 将输入的JSON配置更新到config
        renderEnvironment();
        document.getElementById('inputConfigModal').style.display = 'none';
    } catch (e) {
        alert('Invalid configuration');
    }
});

document.getElementById('closeModalButton').addEventListener('click', function () {
    document.getElementById('inputConfigModal').style.display = 'none';
});

// -------------------- Configuration Management --------------------

const uploadConfigButton = document.getElementById("uploadConfig");
const inputConfigButton = document.getElementById("inputConfig");
const downloadDataButton = document.getElementById("downloadData");
const fileUploadInput = document.getElementById("fileUploadInput");
const inputConfigModal = document.getElementById("inputConfigModal");
const configInput = document.getElementById("configInput");
const submitConfigButton = document.getElementById("submitConfigButton");
const closeModalButton = document.getElementById("closeModalButton");

uploadConfigButton.addEventListener("click", () => {
    fileUploadInput.click();
});

fileUploadInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const configData = JSON.parse(e.target.result);
                config = convertConfigToPixels(configData);
                console.log("Uploaded Config (in pixels):", config);
                saveConfig();
                updateView();
            } catch (error) {
                alert("Invalid JSON format");
            }
        };
        reader.readAsText(file);
    }
});

// Input configuration modal logic
inputConfigButton.addEventListener("click", () => {
    inputConfigModal.style.display = "block";
    configInput.value = JSON.stringify(convertConfigToCoords(config), undefined, 4);
});

submitConfigButton.addEventListener("click", () => {
    const configData = configInput.value;
    try {
        const parsedConfig = JSON.parse(configData);
        config = convertConfigToPixels(parsedConfig);
        console.log("Input Config (in pixels):", config);
        saveConfig();
        updateView();
    } catch (error) {
        alert("Invalid JSON format");
    }
    inputConfigModal.style.display = "none";
});

closeModalButton.addEventListener("click", () => {
    inputConfigModal.style.display = "none";
});

// Download data logic
downloadDataButton.addEventListener("click", () => {
    const data = {
        positions: [{ x: 0, y: 0 }],
        totalDistance: 0,
        resetCount: 0
    };
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data.json";
    link.click();
});

// Upload and reset logic code
const uploadCodeButton = document.getElementById("uploadLogicCode");
const codeUploadInput = document.getElementById("logicCodeUploadInput");
const resetCodeButton = document.getElementById("resetLogicCode");

resetCodeButton.addEventListener("click", () => {
    localStorage.removeItem("userLogicCode");
    clearPreviousLogicCode("logicCodeScript");
    const defaultScript = document.createElement("script");
    defaultScript.id = "logicCodeScript";
    defaultScript.src = "script/exampleLogic.js";
    document.body.appendChild(defaultScript);
    console.log(document.getElementById("logicCodeScript"));
});

uploadCodeButton.addEventListener("click", () => {
    codeUploadInput.click();
});

codeUploadInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const fileContent = e.target.result;
            if (file.name.slice(-3) === ".js") {
                console.log("Injecting JS logic code");
                process_js(fileContent);
            } else if (file.name.slice(-3) === ".py") {
                console.log("Injecting Python logic code");
                process_py(fileContent);
                get_py_wrapper(fileContent);
            } else {
                alert("Format not supported");
            }
        };
        reader.readAsText(file);
        codeUploadInput.value = "";
    }
});

