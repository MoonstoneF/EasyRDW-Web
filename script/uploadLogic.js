// 移除先前可能存在的逻辑代码 / 装饰器
function clearPreviousLogicCode(name) {
    console.log(`Clearing previous logic code: ${name}`);
    const existingScript = document.getElementById(name);
    ["update_user", "update_reset", "calc_gain", "calc_move_with_gain"].forEach((func_name) => {
        if (window[func_name]) {
            delete window[func_name];
        }
    });
    if (existingScript) {
        existingScript.remove();
        console.log(`Removal finished: ${name}`);
    }
}

// 处理上传的js逻辑代码 
function process_js(code) {
    clearPreviousLogicCode("logicCodeScript");
    const script = document.createElement("script");
    script.id = "logicCodeScript";
    script.textContent = code;
    document.body.appendChild(script);
    console.log(document.getElementById("logicCodeScript"));
}

// 处理上传的py逻辑代码
function process_py(code) {
    clearPreviousLogicCode("logicCodeScript");
    const script = document.createElement("script");
    script.id = "logicCodeScript";
    script.type= "text/python";

    // 将python代码转换为js代码
    const prologue = "from browser import document, window, alert, console\n\n";
    var epilogue = "\n";
    // 自带检测
    ["update_user", "update_reset", "calc_gain", "calc_move_with_gain"].forEach((func_name) => {
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
    ["update_user", "update_reset", "calc_gain", "calc_move_with_gain"].forEach((func_name) => {
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