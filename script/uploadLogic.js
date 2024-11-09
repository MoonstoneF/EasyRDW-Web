const requiredFunctions = [];
if (is_universal) {
    requiredFunctions = ["update_user", "update_reset"];
}
else {
    requiredFunctions = ["calc_gain"];
}

// 移除先前可能存在的逻辑代码 / 装饰器
function clearPreviousLogicCode(name) {
    console.log(`Clearing previous logic code: ${name}`);
    const existingScript = document.getElementById(name);
    requiredFunctions.forEach((func_name) => {
        if (window[func_name]) {
            delete window[func_name];
        }
    });
    if (existingScript) {
        existingScript.remove();
        console.log(`Removal finished: ${name}`);
    }
}

// 添加一个监听event 加载localStorage中的逻辑代码
document.addEventListener("DOMContentLoaded", function () {
    const savedCode = localStorage.getItem('userLogicCode');
    console.log("loadUserLogic");
    if (savedCode) {
        console.log("loadUserLogic: savedCode");
        process_js(savedCode);
    }
    else {
        console.log("no localStorage code, load default");
    }
});

// 存
function saveUserLogic(code) {
    localStorage.setItem('userLogicCode', code);
}

// 处理上传的js逻辑代码 
function process_js(code) {
    // 检查代码中是否包含示例代码中的关键函数
    // 这里的函数名可以加 无所谓
    const hasRequiredFunctions = requiredFunctions.every(funcName => new RegExp(`function\\s+${funcName}\\s*\\(`).test(code));

    if (hasRequiredFunctions) {
        saveUserLogic(code);
        clearPreviousLogicCode("logicCodeScript");
        const script = document.createElement("script");
        script.id = "logicCodeScript";
        script.textContent = code;
        document.body.appendChild(script);
        console.log(document.getElementById("logicCodeScript"));
    }
    else {
        console.warn("The uploaded code does not contain the required functions.");
        console.log(document.getElementById("logicCodeScript"));
    }
}

// 处理上传的py逻辑代码
function process_py(code) {
    clearPreviousLogicCode("logicCodeScript");
    const script = document.createElement("script");
    script.id = "logicCodeScript";
    script.type = "text/python";

    // 将python代码转换为js代码
    const prologue = "from browser import document, window, alert, console\n\n";
    var epilogue = "\n";
    // 自带检测
    requiredFunctions.forEach((func_name) => {
        const testPattern = new RegExp(`def\\s+${func_name}\\s*\\(`);
        if (testPattern.test(code)) {
            epilogue += `window.${func_name} = ${func_name}\n`;
        }
    })
    script.textContent = prologue + code + epilogue;
    document.body.appendChild(script);
    console.log(document.getElementById("logicCodeScript"));
}

// 为 py 逻辑申请一个 js 的包装器
function get_py_wrapper(code) {
    clearPreviousLogicCode("logicCodeScriptWrapper");
    const scriptwrapper = document.createElement("script");
    scriptwrapper.id = "logicCodeScriptWrapper";
    scriptwrapper.type = "text/javascript";
    var wrap = "";
    requiredFunctions.forEach((func_name) => {
        const testPattern = new RegExp(`def\\s+${func_name}\\s*\\(`);
        if (testPattern.test(code)) {
            wrap += `function ${func_name}(...args) {\n`;
            wrap += `    return window.${func_name}.apply(null, args);\n`;
            wrap += `}\n\n`;
        }
    })
    scriptwrapper.textContent = wrap;
    document.body.appendChild(scriptwrapper);
    console.log(document.getElementById("logicCodeScriptWrapper"));
}