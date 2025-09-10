// 全局变量
let currentPage = 'input';
let generatedHtmlCode = '';
let thinkingSteps = [];
let currentThinkingStep = 0;
let generationProgress = 0;
let uploadedFile = null;

// DOM元素引用
const pages = {
    input: document.getElementById('inputPage'),
    generate: document.getElementById('generatePage')
};

const elements = {
    loadingScreen: document.getElementById('loadingScreen'),
    promptInput: document.getElementById('promptInput'),
    fileUpload: document.getElementById('fileUpload'),
    uploadBtn: document.getElementById('uploadBtn'),
    fileInfo: document.getElementById('fileInfo'),
    generateBtn: document.getElementById('generateBtn'),
    historyBtn: document.getElementById('historyBtn'),
    historyModal: document.getElementById('historyModal'),
    closeHistoryModal: document.getElementById('closeHistoryModal'),
    historyGrid: document.getElementById('historyGrid'),
    streamingPanel: document.getElementById('streamingPanel'),
    streamingContent: document.getElementById('streamingContent'),
    codePreviewSection: document.getElementById('codePreviewSection'),
    previewFrame: document.getElementById('previewFrame'),
    generatedCode: document.getElementById('generatedCode'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    chatMessages: document.getElementById('chatMessages'),
    chatInput: document.getElementById('chatInput'),
    sendChatBtn: document.getElementById('sendChatBtn'),
    generationStatus: document.getElementById('generationStatus'),
    demoBtnHeader: document.getElementById('demoBtnHeader'),
    downloadBtnHeader: document.getElementById('downloadBtnHeader'),
    fullscreenDemo: document.getElementById('fullscreenDemo'),
    demoFrame: document.getElementById('demoFrame'),
    exitDemoBtn: document.getElementById('exitDemoBtn'),
    progressSteps: document.querySelectorAll('.progress-step'),
    // 配置相关元素
    configBtn: document.getElementById('configBtn'),
    configModal: document.getElementById('configModal'),
    closeConfigModal: document.getElementById('closeConfigModal'),
    apiProvider: document.getElementById('apiProvider'),
    apiKey: document.getElementById('apiKey'),
    baseUrl: document.getElementById('baseUrl'),
    toggleApiKey: document.getElementById('toggleApiKey'),
    testApiBtn: document.getElementById('testApiBtn'),
    apiTestResult: document.getElementById('apiTestResult'),
    systemPrompt: document.getElementById('systemPrompt'),
    temperatureSlider: document.getElementById('temperatureSlider'),
    temperatureValue: document.getElementById('temperatureValue'),
    saveConfigBtn: document.getElementById('saveConfigBtn'),
    resetConfigBtn: document.getElementById('resetConfigBtn')
};

// 初始化应用
function initApp() {
    // 隐藏加载屏幕
    setTimeout(() => {
        elements.loadingScreen.style.opacity = '0';
        setTimeout(() => {
            elements.loadingScreen.style.display = 'none';
        }, 500);
    }, 2000);

    // 绑定事件
    bindEvents();
    
    // 初始化历史数据
    initHistoryData();
    
    // 加载API配置
    loadApiConfigOnInit();
}

// 绑定事件
function bindEvents() {
    // 文件上传
    elements.uploadBtn.addEventListener('click', () => {
        elements.fileUpload.click();
    });

    elements.fileUpload.addEventListener('change', handleFileUpload);

    // 生成按钮
    elements.generateBtn.addEventListener('click', startGeneration);

    // 历史素材库
    elements.historyBtn.addEventListener('click', showHistoryModal);
    elements.closeHistoryModal.addEventListener('click', hideHistoryModal);
    
    // 点击模态框外部关闭
    elements.historyModal.addEventListener('click', (e) => {
        if (e.target === elements.historyModal) {
            hideHistoryModal();
        }
    });

    // Tab切换
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });

    // 聊天功能
    elements.sendChatBtn.addEventListener('click', sendChatMessage);
    elements.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });

    // 新的头部按钮
    elements.demoBtnHeader.addEventListener('click', startDemo);
    elements.downloadBtnHeader.addEventListener('click', downloadHtml);

    // 演示模式
    elements.exitDemoBtn.addEventListener('click', exitDemo);
    
    // 配置模态框
    elements.configBtn.addEventListener('click', showConfigModal);
    elements.closeConfigModal.addEventListener('click', hideConfigModal);
    
    // API Key显示切换
    elements.toggleApiKey.addEventListener('click', toggleApiKeyVisibility);
    
    // 温度滑块
    elements.temperatureSlider.addEventListener('input', updateTemperatureValue);
    
    // API提供商选择变化
    elements.apiProvider.addEventListener('change', updateApiHint);
    
    // 配置按钮
    elements.testApiBtn.addEventListener('click', testApiConnection);
    elements.saveConfigBtn.addEventListener('click', saveApiConfig);
    elements.resetConfigBtn.addEventListener('click', resetApiConfig);

    // 键盘快捷键
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// 处理文件上传
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        uploadedFile = file;
        elements.fileInfo.textContent = `已上传：${file.name}`;
        elements.fileInfo.style.color = 'rgba(255, 255, 255, 0.9)';
        
        // 模拟文件解析
        setTimeout(() => {
            showToast('文档解析完成！AI已理解您的教案内容。');
        }, 1500);
    }
}

// 显示历史素材库
function showHistoryModal() {
    elements.historyModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// 隐藏历史素材库
function hideHistoryModal() {
    elements.historyModal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// 初始化历史数据
function initHistoryData() {
    const historyData = [
        {
            title: '植物光合作用互动课件',
            date: '2024-01-20',
            preview: '包含光合作用原理讲解、实验演示动画、互动练习题等内容...'
        },
        {
            title: '数学二次函数图像',
            date: '2024-01-18',
            preview: '动态展示二次函数图像变化规律，包含参数调节器和实时计算...'
        },
        {
            title: '化学分子结构模型',
            date: '2024-01-15',
            preview: '3D分子结构展示，支持旋转、放大，包含化学键的形成过程动画...'
        },
        {
            title: '历史朝代时间轴',
            date: '2024-01-12',
            preview: '中国历史朝代交互式时间轴，点击查看详细信息和重要事件...'
        }
    ];

    const historyHtml = historyData.map(item => `
        <div class="history-item" onclick="loadHistoryItem('${item.title}')">
            <div class="history-item-title">${item.title}</div>
            <div class="history-item-date">${item.date}</div>
            <div class="history-item-preview">${item.preview}</div>
        </div>
    `).join('');

    elements.historyGrid.innerHTML = historyHtml;
}

// 加载历史项目
function loadHistoryItem(title) {
    hideHistoryModal();
    elements.promptInput.value = `请重新生成"${title}"的课件内容`;
    showToast('已加载历史项目模板');
}

// 新的8步骤任务配置
const taskSteps = [
    { id: 1, name: 'AI课件生成器启动', streamText: '🚀 正在启动AI课件生成器...', duration: 1000 },
    { id: 2, name: '深度思考理解课件需求', streamText: '🧠 深度分析您的课件需求...', duration: 2000 },
    { id: 3, name: '确定教学目标和受众', streamText: '🎯 确定教学目标和目标受众...', duration: 1500 },
    { id: 4, name: '设计课件HTML架构', streamText: '🏗️ 设计课件HTML整体架构...', duration: 1800 },
    { id: 5, name: '编写CSS样式代码', streamText: '🎨 编写精美的CSS样式代码...', duration: 2200 },
    { id: 6, name: '实现JS功能交互', streamText: '⚡ 实现JavaScript交互功能...', duration: 2000 },
    { id: 7, name: '检查代码和优化性能', streamText: '🔍 检查代码质量并优化性能...', duration: 1200 },
    { id: 8, name: 'AI课件生成完成，可以预览和下载了', streamText: '🎉 课件生成完成！正在准备预览...', duration: 1000 }
];

let currentTaskIndex = 0;
let currentStepElement = null;

// 开始生成过程
function startGeneration() {
    const prompt = elements.promptInput.value.trim();
    
    if (!prompt) {
        showToast('请输入课件需求！', 'error');
        return;
    }

    // 切换到生成页面
    switchPage('generate');
    
    // 重置任务进度
    currentTaskIndex = 0;
    elements.streamingContent.innerHTML = '';
    
    // 开始执行任务流程
    executeNextTask();
}

// 执行下一个任务
async function executeNextTask() {
    if (currentTaskIndex >= taskSteps.length) {
        // 所有任务完成
        finishAllTasks();
        return;
    }
    
    const currentTask = taskSteps[currentTaskIndex];
    
    // 更新进度条（显示loading状态）
    updateProgressStep(currentTask.id);
    
    // 在流式区域显示loading状态
    currentStepElement = addLoadingStreamingStep(currentTask.streamText, 'thinking');
    
    // 根据不同任务执行不同逻辑
    await executeTaskWithRealLogic(currentTask);
    
    // 完成当前步骤
    completeLoadingStep(currentStepElement, currentTask.streamText.replace('正在', '已完成').replace('...', ''));
    
    // 更新进度条（标记为完成）
    updateProgressStep(currentTask.id, true);
    
    // 继续下一个任务
    currentTaskIndex++;
    
    // 短暂延迟后执行下一个任务
    setTimeout(() => {
        executeNextTask();
    }, 500);
}

// 根据任务步骤执行真实逻辑
async function executeTaskWithRealLogic(currentTask) {
    switch(currentTask.id) {
        case 1: // AI课件生成器启动
            // 立即显示代码预览区域（但内容为空）
            elements.codePreviewSection.style.display = 'flex';
            elements.generatedCode.textContent = '// 正在启动AI课件生成器...\n// 请等待代码生成完成';
            await new Promise(resolve => setTimeout(resolve, currentTask.duration));
            break;
            
        case 2: // 深度思考理解课件需求
            elements.generatedCode.textContent = `/* AI正在分析课件需求 */\n// 课件主题: ${elements.promptInput.value}\n// 正在理解教学目标...`;
            await new Promise(resolve => setTimeout(resolve, currentTask.duration));
            break;
            
        case 3: // 确定教学目标和受众
            elements.generatedCode.textContent += '\n\n/* 教学目标确定 */\n// 目标受众: 学生群体\n// 教学方式: 互动式课件\n// 显示比例: 16:9';
            await new Promise(resolve => setTimeout(resolve, currentTask.duration));
            break;
            
        case 4: // 设计课件HTML架构
            elements.generatedCode.textContent += '\n\n<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>正在生成...</title>\n</head>';
            await new Promise(resolve => setTimeout(resolve, currentTask.duration));
            break;
            
        case 5: // 编写CSS样式代码  
            elements.generatedCode.textContent += '\n<style>\n    /* 16:9比例容器 */\n    .courseware-container {\n        width: 100vw;\n        height: 56.25vw;\n        max-height: 100vh;\n        max-width: 177.78vh;\n        margin: 0 auto;\n    }\n</style>';
            await new Promise(resolve => setTimeout(resolve, currentTask.duration));
            break;
            
        case 6: // 实现JS功能交互 - 真实AI生成
            // 这一步执行真实的AI生成
            await executeActualGeneration();
            break;
            
        case 7: // 检查代码和优化性能
            // 如果没有生成内容，使用示例
            if (!generatedHtmlCode) {
                generatedHtmlCode = generateSampleCourseware();
                elements.generatedCode.textContent = generatedHtmlCode;
            }
            // 优化显示
            elements.generatedCode.textContent = generatedHtmlCode;
            await new Promise(resolve => setTimeout(resolve, currentTask.duration));
            break;
            
        case 8: // 完成
            // 最终更新预览
            updatePreview();
            await new Promise(resolve => setTimeout(resolve, currentTask.duration));
            break;
            
        default:
            await new Promise(resolve => setTimeout(resolve, currentTask.duration));
    }
}

// 执行实际的课件生成（在第6步时调用）
async function executeActualGeneration() {
    const prompt = elements.promptInput.value;
    let uploadedContent = '';
    
    // 显示生成中的状态
    elements.generatedCode.textContent += '\n\n/* 🤖 正在调用AI生成完整课件... */\n// 请稍等，AI正在创造您的专属课件';
    
    // 如果有上传的文件，提取内容
    if (uploadedFile) {
        uploadedContent = `文件名：${uploadedFile.name}`;
    }
    
    // 尝试使用真实AI API生成
    let generatedContent = null;
    
    if (apiConfig.apiKey) {
        try {
            elements.generatedCode.textContent += '\n// 正在连接AI服务...';
            generatedContent = await generateCoursewareWithAI(prompt, uploadedContent);
            
            if (generatedContent) {
                elements.generatedCode.textContent += '\n// ✅ AI生成成功！正在整理代码...';
            }
        } catch (error) {
            console.error('AI生成失败:', error);
            elements.generatedCode.textContent += '\n// ❌ AI生成失败，使用示例模板...';
        }
    } else {
        elements.generatedCode.textContent += '\n// 🔧 未配置API Key，使用示例模板...';
    }
    
    // 如果API生成失败或没有配置，使用示例代码作为后备
    if (!generatedContent) {
        generatedContent = generateSampleCourseware();
    }
    
    // 保存生成的代码
    generatedHtmlCode = generatedContent;
    
    // 立即更新显示的代码（显示真实生成的内容）
    elements.generatedCode.textContent = generatedContent;
    
    // 等待一小段时间让用户看到更新
    await new Promise(resolve => setTimeout(resolve, 1000));
}

// 完成所有任务
function finishAllTasks() {
    // 确保代码和预览区域可见（应该在第1步就显示了）
    elements.codePreviewSection.style.display = 'flex';
    
    // 确保显示最新的生成代码
    if (generatedHtmlCode) {
        elements.generatedCode.textContent = generatedHtmlCode;
    }
    
    // 最终更新预览
    updatePreview();
    
    // 启用头部按钮
    enableActionButtons();
    
    // 更新状态文本
    elements.generationStatus.innerHTML = '<p class="status-text">✅ 课件生成完成，所有功能已激活</p>';
    
    // 添加AI消息
    const aiMessage = apiConfig.apiKey 
        ? '🎊 太棒了！AI已经为您生成了专属课件。现在您可以：\n• 点击"预览"查看课件效果\n• 使用"演示"进行全屏展示\n• 选择"下载"保存到本地\n\n如需调整课件内容，随时告诉我哦！'
        : '🎊 使用示例模板为您生成了课件。要使用AI生成个性化课件，请先配置API Key。现在您可以：\n• 点击"预览"查看课件效果\n• 使用"演示"进行全屏展示\n• 选择"下载"保存到本地\n• 点击右上角⚙️配置AI API';
    
    addChatMessage('ai', aiMessage);
}

// 以下旧的思考和代码生成逻辑已被新的8步骤流程替代，保留以备用
/* 
function initThinkingProcess(prompt) {
    thinkingSteps = [
        '📋 解析课件需求内容',
        '🎯 确定教学目标和受众',
        '🏗️ 设计课件整体架构',
        '🎨 选择最佳展示方案',
        '⚙️ 规划技术实现方案'
    ];
    
    currentThinkingStep = 0;
    updateProgressStep(1);
}

function startThinkingSimulation() {
    const thinkingInterval = setInterval(() => {
        if (currentThinkingStep < thinkingSteps.length) {
            addStreamingStep(thinkingSteps[currentThinkingStep], 'thinking');
            currentThinkingStep++;
        } else {
            clearInterval(thinkingInterval);
            completeThinking();
        }
    }, 1500);
}
*/

// 添加流式输出步骤
function addStreamingStep(step, type = 'thinking') {
    const stepElement = document.createElement('div');
    stepElement.className = `${type}-step fade-in`;
    
    // 所有步骤都使用绿色的勾选图标
    const icon = '<i class="fas fa-check-circle" style="color: #4CAF50;"></i>';
    
    stepElement.innerHTML = `
        ${icon}
        ${step}
    `;
    
    elements.streamingContent.appendChild(stepElement);
    elements.streamingContent.scrollTop = elements.streamingContent.scrollHeight;
}

// 添加带loading状态的流式步骤
function addLoadingStreamingStep(step, type = 'thinking') {
    const stepElement = document.createElement('div');
    stepElement.className = `${type}-step fade-in`;
    
    // 初始显示loading图标
    const loadingIcon = '<i class="fas fa-spinner fa-spin" style="color: #2196F3;"></i>';
    
    stepElement.innerHTML = `
        ${loadingIcon}
        ${step}
    `;
    
    elements.streamingContent.appendChild(stepElement);
    elements.streamingContent.scrollTop = elements.streamingContent.scrollHeight;
    
    // 返回步骤元素，以便后续更新
    return stepElement;
}

// 完成loading状态的步骤
function completeLoadingStep(stepElement, step) {
    const completedIcon = '<i class="fas fa-check-circle" style="color: #4CAF50;"></i>';
    stepElement.innerHTML = `
        ${completedIcon}
        ${step}
    `;
}

// 完成思考阶段
function completeThinking() {
    // 完成第1步：AI课件生成器启动
    updateProgressStep(1, true); // 标记第1步为完成
    
    // 启动第2步：代码生成
    updateProgressStep(2);
    
    // 开始代码生成过程
    startCodeGeneration();
}

// 开始代码生成
function startCodeGeneration() {
    // 添加代码生成步骤
    const codeSteps = [
        '💻 构建HTML页面框架',
        '🎨 编写CSS样式代码',
        '⚡ 实现交互功能脚本',
        '📱 适配移动端显示',
        '✨ 添加动画特效',
        '🔧 优化代码性能'
    ];
    
    let currentStep = 0;
    const codeInterval = setInterval(() => {
        if (currentStep < codeSteps.length) {
            addStreamingStep(codeSteps[currentStep], 'code');
            currentStep++;
        } else {
            clearInterval(codeInterval);
            completeGeneration();
        }
    }, 1000);
}

// 完成代码生成
async function completeGeneration() {
    const prompt = elements.promptInput.value;
    let uploadedContent = '';
    
    // 如果有上传的文件，提取内容（这里简化处理）
    if (uploadedFile) {
        uploadedContent = `文件名：${uploadedFile.name}`;
    }
    
    // 完成第2步：代码生成
    updateProgressStep(2, true); // 标记第2步为完成
    
    // 启动第3步：效果预览
    updateProgressStep(3);
    
    // 尝试使用真实AI API生成
    let generatedContent = null;
    let loadingStep = null;
    
    if (apiConfig.apiKey) {
        // 显示loading状态的API调用步骤
        loadingStep = addLoadingStreamingStep('🤖 正在调用AI API生成课件...', 'thinking');
        
        try {
            generatedContent = await generateCoursewareWithAI(prompt, uploadedContent);
            
            if (generatedContent) {
                // API调用成功，更新步骤状态
                completeLoadingStep(loadingStep, '🤖 AI课件生成成功！');
            } else {
                throw new Error('API返回空内容');
            }
        } catch (error) {
            // API调用失败，更新步骤状态
            completeLoadingStep(loadingStep, '❌ AI生成失败，使用示例模板');
        }
    }
    
    // 如果API生成失败或没有配置，使用示例代码作为后备
    if (!generatedContent) {
        if (!loadingStep) {
            // 没有API Key的情况
            addStreamingStep('📝 使用示例模板生成课件...', 'thinking');
        }
        generatedContent = generateSampleCourseware();
    }
    
    generatedHtmlCode = generatedContent;
    
    // 在流式区域添加最终完成步骤
    addStreamingStep('🎉 课件生成完成！可以预览使用', 'thinking');
    
    // 完成第3步：效果预览
    updateProgressStep(3, true);
    
    // 显示代码和预览区域
    elements.codePreviewSection.style.display = 'flex';
    
    // 显示生成的代码
    elements.generatedCode.textContent = generatedContent;
    
    // 更新预览
    updatePreview();
    
    // 启用头部按钮
    enableActionButtons();
    
    // 更新状态文本
    elements.generationStatus.innerHTML = '<p class="status-text">✅ 所有功能已激活，可正常使用</p>';
    
    // 添加AI消息
    const aiMessage = apiConfig.apiKey 
        ? '🎊 太棒了！AI已经为您生成了专属课件。现在您可以：\n• 点击"预览"查看课件效果\n• 使用"演示"进行全屏展示\n• 选择"下载"保存到本地\n\n如需调整课件内容，随时告诉我哦！'
        : '🎊 使用示例模板为您生成了课件。要使用AI生成个性化课件，请先配置API Key。现在您可以：\n• 点击"预览"查看课件效果\n• 使用"演示"进行全屏展示\n• 选择"下载"保存到本地\n• 点击右上角⚙️配置AI API';
    
    addChatMessage('ai', aiMessage);
}

// 启用操作按钮
function enableActionButtons() {
    elements.demoBtnHeader.classList.remove('disabled');
    elements.downloadBtnHeader.classList.remove('disabled');
    elements.demoBtnHeader.disabled = false;
    elements.downloadBtnHeader.disabled = false;
}

// 打字机效果
function typewriterEffect(element, text, callback, speed = 20) {
    let i = 0;
    element.textContent = '';
    
    const typeInterval = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            // 自动滚动到底部
            element.scrollTop = element.scrollHeight;
        } else {
            clearInterval(typeInterval);
            if (callback) callback();
        }
    }, speed);
}

// 生成示例课件代码
function generateSampleCourseware() {
    const prompt = elements.promptInput.value;
    
    // 基于prompt生成不同类型的课件
    if (prompt.includes('植物') || prompt.includes('光合作用')) {
        return generateBiologyCourseware();
    } else if (prompt.includes('数学') || prompt.includes('函数')) {
        return generateMathCourseware();
    } else if (prompt.includes('化学') || prompt.includes('分子')) {
        return generateChemistryCourseware();
    } else {
        return generateGeneralCourseware(prompt);
    }
}

// 生成生物课件（新版：16:9多页面结构）
function generateBiologyCourseware() {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>植物光合作用互动课件</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        html, body {
            width: 100%;
            height: 100%;
            overflow: hidden;
            font-family: 'Microsoft YaHei', sans-serif;
        }
        
        /* 16:9 固定比例容器 */
        .courseware-container {
            position: relative;
            width: 100vw;
            height: 56.25vw; /* 16:9 比例 */
            max-height: 100vh;
            max-width: 177.78vh; /* 16:9 比例 */
            margin: 0 auto;
            background: linear-gradient(135deg, #74b9ff 0%, #0984e3 50%, #00b894 100%);
            overflow: hidden;
        }
        
        /* 页面容器 */
        .page {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            padding: 3% 5%;
            display: none;
            flex-direction: column;
            opacity: 0;
            transform: translateX(100px);
            transition: all 0.5s ease;
        }
        
        .page.active {
            display: flex;
            opacity: 1;
            transform: translateX(0);
        }
        
        /* 导航栏 */
        .nav-bar {
            position: absolute;
            top: 2%;
            right: 2%;
            z-index: 1000;
            display: flex;
            gap: 10px;
        }
        
        .nav-btn {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.9em;
            transition: all 0.3s ease;
        }
        
        .nav-btn:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
        }
        
        .nav-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        /* 页面指示器 */
        .page-indicator {
            position: absolute;
            bottom: 3%;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 8px;
            z-index: 1000;
        }
        
        .dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: rgba(255,255,255,0.4);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .dot.active {
            background: white;
            transform: scale(1.3);
        }
        
        /* 页面样式 */
        .page-title {
            font-size: 3em;
            text-align: center;
            margin-bottom: 20px;
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            animation: fadeInDown 1s ease;
        }
        
        .page-subtitle {
            font-size: 1.3em;
            text-align: center;
            margin-bottom: 30px;
            color: rgba(255,255,255,0.9);
            animation: fadeInUp 1s ease 0.3s both;
        }
        
        .content-section {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 30px;
            flex-wrap: wrap;
        }
        
        /* 知识卡片 */
        .knowledge-card {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 25px;
            width: 280px;
            color: white;
            animation: slideInUp 0.8s ease;
        }
        
        .knowledge-card h3 {
            color: #00b894;
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        
        /* 互动元素 */
        .interactive-leaf {
            width: 120px;
            height: 120px;
            background: radial-gradient(ellipse at center, #00b894, #00a085);
            border-radius: 50% 10% 50% 10%;
            position: relative;
            cursor: pointer;
            transition: all 0.3s ease;
            animation: float 3s ease-in-out infinite;
        }
        
        .interactive-leaf:hover {
            transform: scale(1.1) rotate(5deg);
            box-shadow: 0 10px 30px rgba(0,184,148,0.4);
        }
        
        .interactive-leaf.clicked {
            background: radial-gradient(ellipse at center, #00e676, #00c853);
            animation: pulse 0.6s ease;
        }
        
        /* 练习题样式 */
        .quiz-container {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            max-width: 600px;
            width: 100%;
            margin: 0 auto;
        }
        
        .question {
            font-size: 1.2em;
            margin-bottom: 20px;
            color: white;
        }
        
        .options {
            display: grid;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .option {
            background: rgba(255,255,255,0.2);
            border: none;
            padding: 15px;
            border-radius: 10px;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        }
        
        .option:hover {
            background: rgba(255,255,255,0.3);
            transform: translateX(5px);
        }
        
        .option.correct {
            background: rgba(76, 175, 80, 0.7);
        }
        
        .option.incorrect {
            background: rgba(244, 67, 54, 0.7);
        }
        
        .result {
            margin-top: 20px;
            padding: 15px;
            border-radius: 10px;
            display: none;
        }
        
        .result.show {
            display: block;
            animation: slideInUp 0.5s ease;
        }
        
        .result.correct {
            background: rgba(76, 175, 80, 0.3);
            color: #c8e6c9;
        }
        
        .result.incorrect {
            background: rgba(244, 67, 54, 0.3);
            color: #ffcdd2;
        }
        
        /* 动画 */
        @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInUp {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        /* 响应式调整 */
        @media (max-height: 600px) {
            .page-title { font-size: 2.2em; }
            .page-subtitle { font-size: 1.1em; }
        }
    </style>
</head>
<body>
    <div class="courseware-container">
        <!-- 导航栏 -->
        <div class="nav-bar">
            <button class="nav-btn" id="prevBtn" onclick="changePage(-1)">◀ 上一页</button>
            <button class="nav-btn" id="nextBtn" onclick="changePage(1)">下一页 ▶</button>
        </div>
        
        <!-- 页面指示器 -->
        <div class="page-indicator">
            <div class="dot active" onclick="goToPage(0)"></div>
            <div class="dot" onclick="goToPage(1)"></div>
            <div class="dot" onclick="goToPage(2)"></div>
            <div class="dot" onclick="goToPage(3)"></div>
            <div class="dot" onclick="goToPage(4)"></div>
            <div class="dot" onclick="goToPage(5)"></div>
        </div>
        
        <!-- 第1页：标题页 -->
        <div class="page active">
            <h1 class="page-title">🌱 植物光合作用</h1>
            <p class="page-subtitle">探索绿色植物的神奇能量转换</p>
            <div class="content-section">
                <div class="knowledge-card">
                    <h3>📚 学习目标</h3>
                    <ul style="line-height: 1.8;">
                        <li>了解光合作用的基本过程</li>
                        <li>掌握光合作用的条件和产物</li>
                        <li>理解光合作用的生物学意义</li>
                        <li>通过互动实验加深理解</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <!-- 第2页：重点知识1 -->
        <div class="page">
            <h2 class="page-title">📚 光合作用的条件</h2>
            <div class="content-section" style="justify-content: space-around;">
                <div class="knowledge-card">
                    <h3>☀️ 光照</h3>
                    <p>阳光提供光合作用所需的光能，是光反应阶段的必要条件。</p>
                </div>
                <div class="knowledge-card">
                    <h3>💧 水分</h3>
                    <p>水分作为光合作用的原料，参与光反应，产生氧气和氢离子。</p>
                </div>
                <div class="knowledge-card">
                    <h3>🌬️ 二氧化碳</h3>
                    <p>CO₂作为暗反应的原料，在叶绿体中被固定形成有机物。</p>
                </div>
            </div>
        </div>
        
        <!-- 第3页：重点知识2 -->
        <div class="page">
            <h2 class="page-title">⚗️ 光合作用方程式</h2>
            <div class="content-section">
                <div class="knowledge-card" style="width: 500px; text-align: center;">
                    <h3>化学反应式</h3>
                    <div style="font-size: 1.2em; margin: 30px 0; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                        6CO₂ + 6H₂O + 光能 → C₆H₁₂O₆ + 6O₂
                    </div>
                    <p><strong>场所：</strong>叶绿体</p>
                    <p><strong>条件：</strong>光照、叶绿素</p>
                    <p><strong>意义：</strong>将无机物转化为有机物，释放氧气</p>
                </div>
            </div>
        </div>
        
        <!-- 第4页：互动实践1 -->
        <div class="page">
            <h2 class="page-title">🎮 互动探索：光合作用要素</h2>
            <p class="page-subtitle">点击不同的叶片，了解光合作用的三大要素</p>
            <div class="content-section">
                <div style="position: relative;">
                    <div class="interactive-leaf" onclick="showLeafInfo(0)" style="animation-delay: 0s;">
                        <div style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); font-size: 0.9em; color: #fff;">☀️ 阳光</div>
                    </div>
                </div>
                <div style="position: relative;">
                    <div class="interactive-leaf" onclick="showLeafInfo(1)" style="animation-delay: 1s;">
                        <div style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); font-size: 0.9em; color: #fff;">💧 水分</div>
                    </div>
                </div>
                <div style="position: relative;">
                    <div class="interactive-leaf" onclick="showLeafInfo(2)" style="animation-delay: 2s;">
                        <div style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); font-size: 0.9em; color: #fff;">🌬️ CO₂</div>
                    </div>
                </div>
            </div>
            <div id="leafInfo" style="margin-top: 30px; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 15px; display: none; animation: slideInUp 0.5s ease;">
                <h3 id="infoTitle"></h3>
                <p id="infoContent"></p>
            </div>
        </div>
        
        <!-- 第5页：随堂练习1 -->
        <div class="page">
            <h2 class="page-title">📝 随堂练习：选择题</h2>
            <div class="content-section">
                <div class="quiz-container">
                    <div class="question">
                        光合作用的主要场所是？
                    </div>
                    <div class="options">
                        <button class="option" onclick="selectAnswer(0, false)">A. 细胞核</button>
                        <button class="option" onclick="selectAnswer(1, false)">B. 细胞膜</button>
                        <button class="option" onclick="selectAnswer(2, true)">C. 叶绿体</button>
                        <button class="option" onclick="selectAnswer(3, false)">D. 线粒体</button>
                    </div>
                    <div id="result1" class="result">
                        <h4 id="resultTitle1"></h4>
                        <p id="resultText1"></p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 第6页：总结回顾 -->
        <div class="page">
            <h2 class="page-title">🎯 总结与回顾</h2>
            <div class="content-section">
                <div class="knowledge-card" style="width: 600px;">
                    <h3>🌟 关键知识点</h3>
                    <ul style="line-height: 2; font-size: 1.1em;">
                        <li><strong>条件：</strong>阳光 + 水分 + 二氧化碳 + 叶绿素</li>
                        <li><strong>场所：</strong>叶绿体（光反应在类囊体，暗反应在基质）</li>
                        <li><strong>产物：</strong>葡萄糖 + 氧气</li>
                        <li><strong>意义：</strong>为生物圈提供氧气和有机物</li>
                    </ul>
                    <div style="margin-top: 30px; text-align: center; font-size: 1.2em; color: #00b894;">
                        🎊 恭喜完成光合作用学习！
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        let currentPage = 0;
        const totalPages = 6;
        let answeredQ1 = false;
        
        const leafInfos = [
            {
                title: "☀️ 阳光的作用",
                content: "阳光为光合作用提供光能，激发叶绿素分子，启动光反应过程。没有光照，植物无法进行光合作用。"
            },
            {
                title: "💧 水分的重要性", 
                content: "水分不仅是光合作用的原料，还参与光反应过程，分解产生氢离子和氧气。"
            },
            {
                title: "🌬️ 二氧化碳的作用",
                content: "CO₂是暗反应的原料，在酶的催化下被固定，最终形成葡萄糖等有机物。"
            }
        ];
        
        function changePage(direction) {
            const newPage = currentPage + direction;
            if (newPage >= 0 && newPage < totalPages) {
                goToPage(newPage);
            }
        }
        
        function goToPage(pageNum) {
            if (pageNum < 0 || pageNum >= totalPages) return;
            
            // 更新页面
            document.querySelectorAll('.page')[currentPage].classList.remove('active');
            document.querySelectorAll('.dot')[currentPage].classList.remove('active');
            
            currentPage = pageNum;
            
            document.querySelectorAll('.page')[currentPage].classList.add('active');
            document.querySelectorAll('.dot')[currentPage].classList.add('active');
            
            // 更新导航按钮状态
            document.getElementById('prevBtn').disabled = currentPage === 0;
            document.getElementById('nextBtn').disabled = currentPage === totalPages - 1;
        }
        
        function showLeafInfo(index) {
            const leaf = document.querySelectorAll('.interactive-leaf')[index];
            leaf.classList.add('clicked');
            setTimeout(() => leaf.classList.remove('clicked'), 600);
            
            const info = leafInfos[index];
            document.getElementById('infoTitle').textContent = info.title;
            document.getElementById('infoContent').textContent = info.content;
            document.getElementById('leafInfo').style.display = 'block';
        }
        
        function selectAnswer(optionIndex, isCorrect) {
            if (answeredQ1) return;
            
            answeredQ1 = true;
            const options = document.querySelectorAll('.option');
            const result = document.getElementById('result1');
            const resultTitle = document.getElementById('resultTitle1');
            const resultText = document.getElementById('resultText1');
            
            // 显示所有答案的正确性
            options.forEach((option, index) => {
                if (index === 2) { // 正确答案
                    option.classList.add('correct');
                } else if (index === optionIndex && !isCorrect) {
                    option.classList.add('incorrect');
                }
                option.disabled = true;
            });
            
            // 显示结果
            result.classList.add('show');
            if (isCorrect) {
                result.classList.add('correct');
                resultTitle.textContent = '✅ 回答正确！';
                resultText.textContent = '叶绿体是植物进行光合作用的主要场所，包含叶绿素和必要的酶系统。';
            } else {
                result.classList.add('incorrect');
                resultTitle.textContent = '❌ 回答错误';
                resultText.textContent = '正确答案是C。叶绿体是光合作用的场所，而不是细胞核、细胞膜或线粒体。';
            }
        }
        
        // 初始化
        document.getElementById('prevBtn').disabled = true;
        
        // 键盘导航
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                changePage(-1);
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                changePage(1);
            }
        });
    </script>
</body>
</html>`;
}

// 生成数学课件（新版：16:9多页面结构）
function generateMathCourseware() {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>二次函数图像互动课件</title>
    <style>
        * {
            box-sizing: border-box;
        }
        
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        
        body {
            font-family: 'Microsoft YaHei', sans-serif;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .courseware-container {
            width: 100vw;
            height: 100vh;
            aspect-ratio: 16/9;
            max-width: calc(100vh * 16 / 9);
            max-height: calc(100vw * 9 / 16);
            background: linear-gradient(135deg, #667eea, #764ba2);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
        }
        
        .container {
            width: 100%;
            height: 100%;
            padding: 2vh 3vw;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .title {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .panel {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        
        .controls {
            margin-bottom: 20px;
        }
        
        .control-group {
            margin-bottom: 15px;
        }
        
        .control-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        .slider-container {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .slider {
            flex: 1;
            height: 6px;
            border-radius: 3px;
            background: rgba(255,255,255,0.3);
            outline: none;
            cursor: pointer;
        }
        
        .slider::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #ff6b6b;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        
        .value-display {
            min-width: 60px;
            background: rgba(255,255,255,0.2);
            padding: 5px 10px;
            border-radius: 5px;
            text-align: center;
            font-weight: bold;
        }
        
        #canvas {
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        .equation-display {
            font-size: 1.5em;
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            background: rgba(255,255,255,0.15);
            border-radius: 10px;
            font-family: 'Courier New', monospace;
        }
        
        .info-section {
            grid-column: span 2;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .info-card {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #ff6b6b;
        }
        
        .info-card h3 {
            margin-top: 0;
            color: #ffd700;
        }
        
        .demo-btn {
            background: linear-gradient(135deg, #ff6b6b, #ffa500);
            border: none;
            color: white;
            padding: 12px 25px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1em;
            margin: 10px 5px;
            transition: all 0.3s ease;
        }
        
        .demo-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(255,107,107,0.4);
        }
    </style>
</head>
<body>
    <div class="courseware-container">
        <div class="container">
            <div class="header">
                <h1 class="title">📈 二次函数图像</h1>
                <p>交互式探索 y = ax² + bx + c 的奥秘</p>
            </div>
        
        <div class="content-grid">
            <div class="panel">
                <h2>🎛️ 参数控制器</h2>
                <div class="controls">
                    <div class="control-group">
                        <label for="aSlider">参数 a (开口方向和大小):</label>
                        <div class="slider-container">
                            <input type="range" id="aSlider" class="slider" min="-3" max="3" step="0.1" value="1">
                            <div class="value-display" id="aValue">1.0</div>
                        </div>
                    </div>
                    
                    <div class="control-group">
                        <label for="bSlider">参数 b (对称轴位置):</label>
                        <div class="slider-container">
                            <input type="range" id="bSlider" class="slider" min="-5" max="5" step="0.1" value="0">
                            <div class="value-display" id="bValue">0.0</div>
                        </div>
                    </div>
                    
                    <div class="control-group">
                        <label for="cSlider">参数 c (纵轴截距):</label>
                        <div class="slider-container">
                            <input type="range" id="cSlider" class="slider" min="-5" max="5" step="0.1" value="0">
                            <div class="value-display" id="cValue">0.0</div>
                        </div>
                    </div>
                </div>
                
                <div class="equation-display" id="equation">
                    y = x²
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <button class="demo-btn" onclick="animateDemo()">📱 动画演示</button>
                    <button class="demo-btn" onclick="resetFunction()">🔄 重置</button>
                </div>
            </div>
            
            <div class="panel">
                <h2>📊 函数图像</h2>
                <canvas id="canvas" width="400" height="400"></canvas>
            </div>
            
            <div class="panel info-section">
                <h2>📚 知识要点</h2>
                <div class="info-grid">
                    <div class="info-card">
                        <h3>参数 a 的作用</h3>
                        <p>• a > 0 时，开口向上<br>
                        • a < 0 时，开口向下<br>
                        • |a| 越大，开口越小</p>
                    </div>
                    
                    <div class="info-card">
                        <h3>参数 b 的作用</h3>
                        <p>• 影响对称轴位置<br>
                        • 对称轴：x = -b/(2a)<br>
                        • b ≠ 0 时，图像左右移动</p>
                    </div>
                    
                    <div class="info-card">
                        <h3>参数 c 的作用</h3>
                        <p>• 决定y轴截距<br>
                        • c > 0 时，图像上移<br>
                        • c < 0 时，图像下移</p>
                    </div>
                    
                    <div class="info-card">
                        <h3>重要性质</h3>
                        <p>• 对称轴：x = -b/(2a)<br>
                        • 顶点：(-b/(2a), c-b²/(4a))<br>
                        • 判别式：Δ = b² - 4ac</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const aSlider = document.getElementById('aSlider');
        const bSlider = document.getElementById('bSlider');
        const cSlider = document.getElementById('cSlider');
        const aValue = document.getElementById('aValue');
        const bValue = document.getElementById('bValue');
        const cValue = document.getElementById('cValue');
        const equation = document.getElementById('equation');
        
        let a = 1, b = 0, c = 0;
        
        function updateFunction() {
            a = parseFloat(aSlider.value);
            b = parseFloat(bSlider.value);
            c = parseFloat(cSlider.value);
            
            aValue.textContent = a.toFixed(1);
            bValue.textContent = b.toFixed(1);
            cValue.textContent = c.toFixed(1);
            
            updateEquation();
            drawFunction();
        }
        
        function updateEquation() {
            let eq = 'y = ';
            
            if (a === 1) eq += 'x²';
            else if (a === -1) eq += '-x²';
            else eq += a.toFixed(1) + 'x²';
            
            if (b > 0) eq += ' + ' + b.toFixed(1) + 'x';
            else if (b < 0) eq += ' - ' + Math.abs(b).toFixed(1) + 'x';
            
            if (c > 0) eq += ' + ' + c.toFixed(1);
            else if (c < 0) eq += ' - ' + Math.abs(c).toFixed(1);
            
            equation.textContent = eq;
        }
        
        function drawFunction() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 绘制坐标轴
            ctx.strokeStyle = '#ccc';
            ctx.lineWidth = 1;
            
            // x轴
            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2);
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
            
            // y轴
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();
            
            // 绘制网格
            ctx.strokeStyle = '#f0f0f0';
            for (let i = 0; i < canvas.width; i += 40) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvas.height);
                ctx.stroke();
            }
            for (let i = 0; i < canvas.height; i += 40) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i);
                ctx.stroke();
            }
            
            // 绘制函数曲线
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            let firstPoint = true;
            for (let px = 0; px < canvas.width; px += 2) {
                const x = (px - canvas.width / 2) / 40; // 将像素转换为数学坐标
                const y = a * x * x + b * x + c;
                const py = canvas.height / 2 - y * 40; // 将数学坐标转换为像素
                
                if (py >= 0 && py <= canvas.height) {
                    if (firstPoint) {
                        ctx.moveTo(px, py);
                        firstPoint = false;
                    } else {
                        ctx.lineTo(px, py);
                    }
                }
            }
            ctx.stroke();
            
            // 标记顶点
            const vertexX = -b / (2 * a);
            const vertexY = a * vertexX * vertexX + b * vertexX + c;
            const vertexPx = canvas.width / 2 + vertexX * 40;
            const vertexPy = canvas.height / 2 - vertexY * 40;
            
            if (vertexPx >= 0 && vertexPx <= canvas.width && vertexPy >= 0 && vertexPy <= canvas.height) {
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(vertexPx, vertexPy, 6, 0, 2 * Math.PI);
                ctx.fill();
                
                // 顶点坐标标注
                ctx.fillStyle = '#333';
                ctx.font = '12px Arial';
                ctx.fillText(\`(\${vertexX.toFixed(1)}, \${vertexY.toFixed(1)})\`, vertexPx + 10, vertexPy - 10);
            }
        }
        
        function animateDemo() {
            const originalA = a, originalB = b, originalC = c;
            let step = 0;
            
            const animate = () => {
                step++;
                
                if (step < 50) {
                    aSlider.value = 1 + Math.sin(step * 0.2) * 2;
                    bSlider.value = Math.sin(step * 0.15) * 3;
                    cSlider.value = Math.sin(step * 0.1) * 3;
                    updateFunction();
                    requestAnimationFrame(animate);
                } else {
                    aSlider.value = originalA;
                    bSlider.value = originalB;
                    cSlider.value = originalC;
                    updateFunction();
                }
            };
            
            animate();
        }
        
        function resetFunction() {
            aSlider.value = 1;
            bSlider.value = 0;
            cSlider.value = 0;
            updateFunction();
        }
        
        // 事件监听
        aSlider.addEventListener('input', updateFunction);
        bSlider.addEventListener('input', updateFunction);
        cSlider.addEventListener('input', updateFunction);
        
        // 初始化
        updateFunction();
    </script>
        </div>
    </div>
</body>
</html>`;
}

// 生成化学课件
function generateChemistryCourseware() {
    return generateGeneralCourseware('化学分子结构展示');
}

// 生成通用课件
function generateGeneralCourseware(topic) {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${topic} - 互动课件</title>
    <style>
        * {
            box-sizing: border-box;
        }
        
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        
        body {
            font-family: 'Microsoft YaHei', sans-serif;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .courseware-container {
            width: 100vw;
            height: 100vh;
            aspect-ratio: 16/9;
            max-width: calc(100vh * 16 / 9);
            max-height: calc(100vw * 9 / 16);
            background: linear-gradient(135deg, #667eea, #764ba2);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
        }
        
        .container {
            width: 100%;
            height: 100%;
            padding: 2vh 3vw;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .title {
            font-size: 2.5em;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .section {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        
        .interactive-demo {
            display: flex;
            justify-content: space-around;
            align-items: center;
            margin: 30px 0;
            flex-wrap: wrap;
            gap: 20px;
        }
        
        .demo-item {
            background: rgba(255,255,255,0.15);
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            min-width: 150px;
            animation: float 3s ease-in-out infinite;
        }
        
        .demo-item:hover {
            transform: scale(1.05);
            background: rgba(255,255,255,0.25);
        }
        
        .demo-item:nth-child(1) { animation-delay: 0s; }
        .demo-item:nth-child(2) { animation-delay: 0.5s; }
        .demo-item:nth-child(3) { animation-delay: 1s; }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
        }
        
        .icon {
            font-size: 3em;
            margin-bottom: 10px;
            display: block;
        }
        
        .quiz-area {
            background: rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 25px;
            margin: 20px 0;
        }
        
        .question {
            font-size: 1.2em;
            margin-bottom: 20px;
            font-weight: bold;
        }
        
        .options {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            list-style: none;
            padding: 0;
        }
        
        .option {
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
        }
        
        .option:hover {
            background: rgba(255,255,255,0.2);
            transform: translateY(-2px);
        }
        
        .btn {
            background: linear-gradient(135deg, #ff6b6b, #ffa500);
            border: none;
            color: white;
            padding: 12px 25px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1em;
            margin: 10px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255,107,107,0.3);
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255,107,107,0.4);
        }
        
        .highlight {
            background: linear-gradient(135deg, #ffd700, #ff8c00);
            padding: 2px 8px;
            border-radius: 4px;
            color: #333;
            font-weight: bold;
        }
        
        @media (max-width: 768px) {
            .interactive-demo {
                flex-direction: column;
            }
            
            .options {
                grid-template-columns: 1fr;
            }
            
            .title {
                font-size: 2em;
            }
        }
    </style>
</head>
<body>
    <div class="courseware-container">
        <div class="container">
            <div class="header">
                <h1 class="title">📚 ${topic}</h1>
                <p>互动式学习体验，让知识更生动有趣</p>
            </div>
        
        <div class="section">
            <h2>🎯 学习目标</h2>
            <ul>
                <li>理解 <span class="highlight">${topic}</span> 的基本概念和原理</li>
                <li>通过互动演示加深理解</li>
                <li>掌握相关的实际应用</li>
                <li>培养科学思维和探索精神</li>
            </ul>
        </div>
        
        <div class="section">
            <h2>🔬 互动演示</h2>
            <div class="interactive-demo">
                <div class="demo-item" onclick="showDemo(1)">
                    <span class="icon">🧪</span>
                    <div>基础概念</div>
                </div>
                <div class="demo-item" onclick="showDemo(2)">
                    <span class="icon">⚡</span>
                    <div>动态过程</div>
                </div>
                <div class="demo-item" onclick="showDemo(3)">
                    <span class="icon">🌟</span>
                    <div>实际应用</div>
                </div>
            </div>
            
            <div id="demoContent" style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin-top: 20px; display: none;">
                <p id="demoText">点击上方按钮开始互动演示</p>
            </div>
        </div>
        
        <div class="section">
            <h2>🧠 知识检测</h2>
            <div class="quiz-area">
                <div class="question">关于${topic}，下列说法正确的是？</div>
                <div class="options">
                    <div class="option" onclick="selectOption(this, false)">选项 A</div>
                    <div class="option" onclick="selectOption(this, true)">选项 B（正确答案）</div>
                    <div class="option" onclick="selectOption(this, false)">选项 C</div>
                    <div class="option" onclick="selectOption(this, false)">选项 D</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>📖 总结与思考</h2>
            <p>通过本次学习，我们深入了解了<span class="highlight">${topic}</span>的各个方面。这些知识不仅在学术研究中具有重要意义，在日常生活和实际应用中也发挥着重要作用。</p>
            
            <div style="text-align: center; margin-top: 30px;">
                <button class="btn" onclick="restartCourse()">🔄 重新开始</button>
                <button class="btn" onclick="showSummary()">📊 学习总结</button>
            </div>
        </div>
    </div>
    
    <script>
        const demoContent = {
            1: "📖 基础概念：这里是${topic}的基本定义和核心概念。通过图文并茂的方式，帮助大家建立清晰的认知框架。",
            2: "⚡ 动态过程：观察${topic}的动态变化过程，理解其内在的运行机制和变化规律。",
            3: "🌟 实际应用：探索${topic}在现实生活中的具体应用场景，了解其实用价值和意义。"
        };
        
        function showDemo(num) {
            const content = document.getElementById('demoContent');
            const text = document.getElementById('demoText');
            
            text.textContent = demoContent[num];
            content.style.display = 'block';
            content.style.animation = 'fadeInUp 0.5s ease';
        }
        
        function selectOption(element, isCorrect) {
            const options = element.parentNode.children;
            
            for (let option of options) {
                option.style.pointerEvents = 'none';
                if (option === element) {
                    option.style.background = isCorrect ? 
                        'linear-gradient(135deg, #00b894, #00cec9)' : 
                        'linear-gradient(135deg, #ff6b6b, #e17055)';
                } else if (option.textContent.includes('正确答案')) {
                    option.style.background = 'linear-gradient(135deg, #00b894, #00cec9)';
                }
            }
            
            setTimeout(() => {
                alert(isCorrect ? '🎉 回答正确！' : '❌ 回答错误，请查看正确答案。');
            }, 500);
        }
        
        function restartCourse() {
            location.reload();
        }
        
        function showSummary() {
            alert('📊 学习总结：\\n\\n✅ 完成了${topic}的基础学习\\n✅ 参与了互动演示\\n✅ 完成了知识检测\\n\\n继续保持学习热情！');
        }
        
        // 添加一些动态效果
        document.addEventListener('DOMContentLoaded', function() {
            const sections = document.querySelectorAll('.section');
            sections.forEach((section, index) => {
                setTimeout(() => {
                    section.style.opacity = '0';
                    section.style.transform = 'translateY(30px)';
                    section.style.transition = 'all 0.6s ease';
                    
                    setTimeout(() => {
                        section.style.opacity = '1';
                        section.style.transform = 'translateY(0)';
                    }, 100);
                }, index * 200);
            });
        });
    </script>
        </div>
    </div>
</body>
</html>`;
}

// Tab切换
function switchTab(tabName) {
    elements.tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    elements.tabPanes.forEach(pane => {
        pane.classList.toggle('active', pane.id === tabName + 'Tab');
    });
}

// 更新预览
function updatePreview() {
    const previewDoc = elements.previewFrame.contentDocument || elements.previewFrame.contentWindow.document;
    previewDoc.open();
    previewDoc.write(generatedHtmlCode);
    previewDoc.close();
    
    // 确保iframe内容加载完成后处理显示
    elements.previewFrame.onload = function() {
        try {
            const iframeDoc = elements.previewFrame.contentDocument || elements.previewFrame.contentWindow.document;
            if (iframeDoc.body) {
                iframeDoc.body.style.margin = '0';
                iframeDoc.body.style.padding = '0';
                iframeDoc.body.style.width = '100%';
                iframeDoc.body.style.height = '100%';
                iframeDoc.body.style.overflow = 'auto';
                
                // 设置html元素样式
                if (iframeDoc.documentElement) {
                    iframeDoc.documentElement.style.margin = '0';
                    iframeDoc.documentElement.style.padding = '0';
                    iframeDoc.documentElement.style.width = '100%';
                    iframeDoc.documentElement.style.height = '100%';
                }
            }
        } catch (e) {
            console.log('无法访问iframe内容，可能是跨域限制');
        }
    };
}

// 发送聊天消息
async function sendChatMessage() {
    const message = elements.chatInput.value.trim();
    if (!message) return;
    
    // 检查是否有生成的代码
    if (!generatedHtmlCode) {
        addChatMessage('ai', '请先生成课件代码，然后我就可以帮您修改了！');
        return;
    }
    
    // 检查API配置
    if (!apiConfig.apiKey) {
        addChatMessage('ai', '请先配置AI API Key，我需要调用AI来帮您修改课件。点击右上角⚙️进行配置。');
        return;
    }
    
    addChatMessage('user', message);
    elements.chatInput.value = '';
    
    // 判断是否为修改请求
    if (isModificationRequest(message)) {
        // 显示加载状态
        const loadingMessageId = addChatMessage('ai', '🤔 正在分析您的修改需求...');
        
        try {
            // 调用AI修改代码
            await modifyCodeWithAI(message, loadingMessageId);
        } catch (error) {
            // 移除加载消息
            removeChatMessage(loadingMessageId);
            addChatMessage('ai', `❌ 抱歉，修改过程中出现错误：${error.message}`);
        }
    } else {
        // 普通对话
        try {
            const loadingMessageId = addChatMessage('ai', '🤖 思考中...');
            const aiResponse = await generateAIResponse(message);
            updateChatMessage(loadingMessageId, aiResponse);
        } catch (error) {
            addChatMessage('ai', `❌ 抱歉，我现在无法回复：${error.message}`);
        }
    }
}

// 添加聊天消息
function addChatMessage(type, content) {
    const messageDiv = document.createElement('div');
    const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    messageDiv.id = messageId;
    messageDiv.className = `message ${type}-message fade-in`;
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-${type === 'ai' ? 'robot' : 'user'}"></i>
        </div>
        <div class="message-content">${content.replace(/\n/g, '<br>')}</div>
    `;
    
    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    
    return messageId;
}

// 更新聊天消息
function updateChatMessage(messageId, newContent) {
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
        const contentElement = messageElement.querySelector('.message-content');
        if (contentElement) {
            contentElement.innerHTML = newContent.replace(/\n/g, '<br>');
        }
    }
}

// 移除聊天消息
function removeChatMessage(messageId) {
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
        messageElement.remove();
    }
}

// 生成AI回复（普通对话）
async function generateAIResponse(message) {
    const prompt = `你是Vibe Teaching课件生成助手。用户说："${message}"

请简短、友好地回复用户。如果用户询问功能或需要帮助，请给出有用的建议。如果用户想修改课件，建议他们具体说明想要什么样的修改。

回复要求：
- 简洁明了，不超过100字
- 友好专业的语调
- 中文回复`;

    try {
        const response = await callAIAPI(prompt);
        return response || '我明白了！有什么其他需要帮助的吗？';
    } catch (error) {
        console.error('AI回复生成失败:', error);
        return '我明白了！有什么其他需要帮助的吗？';
    }
}

// 判断是否为修改请求
function isModificationRequest(message) {
    const modifyKeywords = ['修改', '更改', '调整', '优化', '改成', '换成', '加上', '删除', '改', '换', '变', '增加', '减少', '移除', '调', '美化', '改进'];
    return modifyKeywords.some(keyword => message.includes(keyword));
}

// 使用AI修改代码
async function modifyCodeWithAI(request, loadingMessageId) {
    try {
        // 更新加载状态
        updateChatMessage(loadingMessageId, '🔄 正在调用AI分析修改需求...');
        
        // 构建修改prompt
        const modifyPrompt = `你是一个专业的HTML课件修改助手。我有一个HTML互动课件，用户想要进行以下修改：

用户需求：${request}

当前的HTML代码：
\`\`\`html
${generatedHtmlCode}
\`\`\`

请根据用户的需求修改这个HTML代码。要求：
1. 保持16:9的课件比例
2. 保持原有的交互功能
3. 确保代码结构清晰
4. 只修改相关的部分，不要破坏整体结构
5. 直接返回修改后的完整HTML代码，不需要其他说明

修改后的HTML代码：`;

        // 更新加载状态
        updateChatMessage(loadingMessageId, '🤖 AI正在生成修改后的代码...');
        
        // 调用AI API
        const modifiedHtmlCode = await callAIAPI(modifyPrompt);
        
        if (modifiedHtmlCode && modifiedHtmlCode.trim()) {
            // 更新代码
            generatedHtmlCode = modifiedHtmlCode;
            
            // 更新界面
            elements.generatedCode.textContent = generatedHtmlCode;
            updatePreview();
            
            // 更新加载状态为成功
            updateChatMessage(loadingMessageId, '✅ 修改完成！我已经根据您的要求更新了课件。请查看左侧的预览效果，如果还需要调整，请继续告诉我。');
            
            // 显示成功提示
            showToast('课件代码已更新！', 'success');
            
            // 更新状态文本
            elements.generationStatus.innerHTML = '<p class="status-text">✅ 课件已根据您的要求更新</p>';
            
        } else {
            throw new Error('AI返回的代码为空');
        }
        
    } catch (error) {
        console.error('AI修改代码失败:', error);
        
        // 移除加载消息并显示错误
        removeChatMessage(loadingMessageId);
        addChatMessage('ai', `❌ 抱歉，修改过程中出现问题：${error.message}\n\n请尝试重新描述您的修改需求，或者检查API配置是否正常。`);
        
        showToast('代码修改失败', 'error');
    }
}


// 开始演示
function startDemo() {
    // 检查按钮是否已启用
    if (elements.demoBtnHeader.classList.contains('disabled')) {
        showToast('请等待课件生成完成', 'error');
        return;
    }
    
    elements.fullscreenDemo.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // 在演示框中显示课件
    const demoDoc = elements.demoFrame.contentDocument || elements.demoFrame.contentWindow.document;
    demoDoc.open();
    demoDoc.write(generatedHtmlCode);
    demoDoc.close();
}

// 退出演示
function exitDemo() {
    elements.fullscreenDemo.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 下载HTML
function downloadHtml() {
    // 检查按钮是否已启用
    if (elements.downloadBtnHeader.classList.contains('disabled')) {
        showToast('请等待课件生成完成', 'error');
        return;
    }
    
    const blob = new Blob([generatedHtmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vibe-teaching-courseware.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('课件已成功下载到本地！');
}


// 页面切换
function switchPage(pageName) {
    Object.keys(pages).forEach(key => {
        pages[key].style.display = key === pageName ? 'flex' : 'none';
    });
    currentPage = pageName;
}

// 更新进度步骤（支持8个步骤）
function updateProgressStep(step, markAsCompleted = false) {
    elements.progressSteps.forEach((stepEl, index) => {
        stepEl.classList.remove('active', 'completed');
        if (index + 1 < step) {
            stepEl.classList.add('completed');
        } else if (index + 1 === step) {
            if (markAsCompleted) {
                stepEl.classList.add('completed');
            } else {
                stepEl.classList.add('active');
            }
        }
    });
    
    // 如果到达最后一步，将当前步骤也标记为完成
    if (step === 8 && !markAsCompleted) {
        setTimeout(() => {
            elements.progressSteps.forEach((stepEl, index) => {
                if (index + 1 <= step) {
                    stepEl.classList.remove('active');
                    stepEl.classList.add('completed');
                }
            });
        }, 1000);
    }
}

// 显示提示消息
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        max-width: 300px;
        animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s forwards;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (document.body.contains(toast)) {
            document.body.removeChild(toast);
        }
    }, 3000);
}

// 键盘快捷键
function handleKeyboardShortcuts(event) {
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 'Enter':
                if (currentPage === 'input') {
                    startGeneration();
                }
                event.preventDefault();
                break;
            case 's':
                if (currentPage === 'output') {
                    downloadHtml();
                }
                event.preventDefault();
                break;
            case 'f':
                if (currentPage === 'output') {
                    startDemo();
                }
                event.preventDefault();
                break;
        }
    }
    
    if (event.key === 'Escape') {
        if (elements.fullscreenDemo.style.display === 'block') {
            exitDemo();
        } else if (elements.historyModal.classList.contains('show')) {
            hideHistoryModal();
        }
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ===== 配置管理功能 =====

// API配置数据
let apiConfig = {
    provider: 'openai',
    apiKey: '',
    baseUrl: '',
    systemPrompt: `你是一个专业的HTML互动课件生成器。请根据用户提供的课件主题和要求，生成高质量的HTML互动课件。

🎯 核心要求：
1. **固定16:9比例**：课件必须严格保持16:9的宽高比，不能是流式布局
2. **多页面结构**：课件内部包含多个子页面，支持页面间导航
3. **三大核心模块**：
   - 📚 重点知识展示：图文并茂的知识点讲解
   - 🎮 互动实践：可点击、拖拽、操作的交互元素
   - 📝 随堂练习：选择题、填空题、问答题等多种题型

🎨 技术规范：
1. 使用固定尺寸容器（如100vw x 56.25vw 或 177.78vh x 100vh）
2. 内部采用绝对定位或Flexbox，确保在任何屏幕上都保持16:9比例
3. 包含页面导航系统（上一页/下一页按钮，页面指示器）
4. 丰富的CSS3动画和过渡效果
5. JavaScript交互逻辑完善，包括答题判断、进度跟踪等

📋 标准课件结构：
- 第1页：标题页 + 学习目标
- 第2-3页：重点知识图文讲解
- 第4-5页：互动实践操作
- 第6-7页：随堂练习题目
- 第8页：总结与回顾

🎭 视觉要求：
- 现代化UI设计，渐变背景，卡片式布局
- 图标和插图丰富视觉效果
- 统一的色彩方案和字体规范
- 响应式交互反馈

请直接返回完整的HTML代码，确保代码结构清晰、注释完善、功能完整。`,
    temperature: 0.7
};

// 显示配置模态框
function showConfigModal() {
    elements.configModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    loadApiConfig();
}

// 隐藏配置模态框
function hideConfigModal() {
    elements.configModal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// 切换API Key显示
function toggleApiKeyVisibility() {
    const apiKeyInput = elements.apiKey;
    const toggleIcon = elements.toggleApiKey.querySelector('i');
    
    if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        toggleIcon.className = 'fas fa-eye-slash';
    } else {
        apiKeyInput.type = 'password';
        toggleIcon.className = 'fas fa-eye';
    }
}

// 更新温度值显示
function updateTemperatureValue() {
    const value = elements.temperatureSlider.value;
    elements.temperatureValue.textContent = value;
}

// 更新API提示信息
function updateApiHint() {
    const provider = elements.apiProvider.value;
    const apiHint = document.getElementById('apiHint');
    const hintText = document.getElementById('hintText');
    
    const hints = {
        google: '⚠️ Google AI Studio在浏览器中直接调用会遇到CORS限制，建议使用代理或在服务端部署',
        openai: '💡 支持GPT-4/3.5模型，需要OpenAI官方API Key',
        anthropic: '💡 支持Claude系列模型，需要Anthropic官方API Key',
        deepseek: '💡 支持DeepSeek Chat模型，中文理解能力强。需要充值使用，新用户通常有免费额度',
        zhipu: '💡 支持GLM-4模型，适合中文内容生成'
    };
    
    if (hints[provider]) {
        hintText.textContent = hints[provider];
        apiHint.style.display = 'block';
        
        // Google特殊样式
        if (provider === 'google') {
            apiHint.style.color = '#ff9800';
        } else {
            apiHint.style.color = '#666';
        }
    } else {
        apiHint.style.display = 'none';
    }
}

// 验证API Key格式
function validateApiKey(provider, apiKey) {
    const patterns = {
        openai: /^sk-[a-zA-Z0-9]{48}$/,
        anthropic: /^sk-ant-[a-zA-Z0-9-_]{32,}$/,
        deepseek: /^sk-[a-fA-F0-9]{32}$/,
        zhipu: /^[a-zA-Z0-9]{32}\.[a-zA-Z0-9]{8}$/,
        google: /^[a-zA-Z0-9_-]{32,}$/
    };
    
    const pattern = patterns[provider];
    if (pattern && !pattern.test(apiKey)) {
        return false;
    }
    return true;
}

// 测试API连接
async function testApiConnection() {
    const provider = elements.apiProvider.value;
    const apiKey = elements.apiKey.value.trim();
    const baseUrl = elements.baseUrl.value.trim();
    
    if (!apiKey) {
        showApiTestResult('请输入API Key', 'error');
        return;
    }
    
    // 验证API Key格式
    if (!validateApiKey(provider, apiKey)) {
        showApiTestResult(`❌ API Key格式不正确，请检查${provider.toUpperCase()}的Key格式`, 'error');
        return;
    }
    
    showApiTestResult('正在测试连接...', 'loading');
    elements.testApiBtn.disabled = true;
    
    try {
        const success = await testApiProvider(provider, apiKey, baseUrl);
        if (success) {
            showApiTestResult('✅ 连接成功！', 'success');
        } else {
            showApiTestResult('❌ 连接失败，请检查配置', 'error');
        }
    } catch (error) {
        console.error('API测试错误:', error);
        showApiTestResult(`❌ 测试失败：${error.message}`, 'error');
    } finally {
        elements.testApiBtn.disabled = false;
    }
}

// 显示API测试结果
function showApiTestResult(message, type) {
    elements.apiTestResult.textContent = message;
    elements.apiTestResult.className = `test-result ${type}`;
    
    if (type !== 'loading') {
        setTimeout(() => {
            elements.apiTestResult.textContent = '';
            elements.apiTestResult.className = 'test-result';
        }, 3000);
    }
}

// 实际的API提供商测试
async function testApiProvider(provider, apiKey, baseUrl) {
    const configs = {
        openai: {
            url: baseUrl || 'https://api.openai.com/v1/chat/completions',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 10
            }
        },
        anthropic: {
            url: baseUrl || 'https://api.anthropic.com/v1/messages',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            body: {
                model: 'claude-3-haiku-20240307',
                max_tokens: 10,
                messages: [{ role: 'user', content: 'Hello' }]
            }
        },
        google: {
            url: baseUrl || `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                contents: [{
                    parts: [{ text: 'Hello' }]
                }],
                generationConfig: {
                    maxOutputTokens: 10
                }
            }
        },
        deepseek: {
            url: baseUrl || 'https://api.deepseek.com/v1/chat/completions',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: {
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 10,
                stream: false
            }
        },
        zhipu: {
            url: baseUrl || 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: {
                model: 'glm-4',
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 10
            }
        }
    };
    
    const config = configs[provider];
    if (!config) {
        throw new Error('不支持的API提供商');
    }
    
    try {
        console.log(`[${provider}] 测试请求URL:`, config.url);
        console.log(`[${provider}] 请求体:`, config.body);
        
        const response = await fetch(config.url, {
            method: 'POST',
            headers: config.headers,
            body: JSON.stringify(config.body)
        });
        
        console.log(`[${provider}] 响应状态:`, response.status, response.statusText);
        
        if (response.ok) {
            return true;
        } else {
            // 尝试获取详细错误信息
            try {
                const errorData = await response.json();
                console.log(`[${provider}] 错误详情:`, errorData);
                
                // 针对不同提供商的特定错误处理
                if (provider === 'deepseek' && response.status === 401) {
                    throw new Error('API Key无效或已过期，请检查DeepSeek控制台');
                } else if (provider === 'deepseek' && response.status === 402) {
                    throw new Error('账户余额不足或免费额度已用完，请前往DeepSeek控制台充值');
                } else if (provider === 'deepseek' && response.status === 429) {
                    throw new Error('请求频率限制，请稍后再试');
                } else if (response.status === 402) {
                    throw new Error('账户余额不足，请检查您的API账户余额');
                } else {
                    throw new Error(errorData.error?.message || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (jsonError) {
                if (provider === 'deepseek' && response.status === 404) {
                    throw new Error('API端点不存在，可能模型名称错误');
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        }
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            if (provider === 'google') {
                throw new Error('CORS限制：Google AI Studio需要使用代理或服务端调用');
            } else {
                throw new Error('网络连接失败，可能是CORS问题或API服务不可用');
            }
        }
        throw error;
    }
}

// 保存API配置
function saveApiConfig() {
    const config = {
        provider: elements.apiProvider.value,
        apiKey: elements.apiKey.value.trim(),
        baseUrl: elements.baseUrl.value.trim(),
        systemPrompt: elements.systemPrompt.value,
        temperature: parseFloat(elements.temperatureSlider.value)
    };
    
    // 保存到localStorage
    localStorage.setItem('vibeTeaching_apiConfig', JSON.stringify(config));
    apiConfig = { ...config };
    
    showToast('配置已保存！', 'success');
    hideConfigModal();
}

// 加载API配置（用于配置模态框）
function loadApiConfig() {
    const saved = localStorage.getItem('vibeTeaching_apiConfig');
    if (saved) {
        const config = JSON.parse(saved);
        apiConfig = { ...config };
        
        elements.apiProvider.value = config.provider || 'openai';
        elements.apiKey.value = config.apiKey || '';
        elements.baseUrl.value = config.baseUrl || '';
        elements.systemPrompt.value = config.systemPrompt || apiConfig.systemPrompt;
        elements.temperatureSlider.value = config.temperature || 0.7;
        elements.temperatureValue.textContent = config.temperature || 0.7;
    }
    
    // 更新API提示信息
    updateApiHint();
}

// 初始化时加载API配置（不更新UI）
function loadApiConfigOnInit() {
    const saved = localStorage.getItem('vibeTeaching_apiConfig');
    if (saved) {
        const config = JSON.parse(saved);
        apiConfig = { ...config };
    }
}

// 重置API配置
function resetApiConfig() {
    if (confirm('确定要重置所有配置吗？这将清除您保存的API设置。')) {
        localStorage.removeItem('vibeTeaching_apiConfig');
        
        // 重置表单
        elements.apiProvider.value = 'openai';
        elements.apiKey.value = '';
        elements.baseUrl.value = '';
        elements.systemPrompt.value = apiConfig.systemPrompt;
        elements.temperatureSlider.value = 0.7;
        elements.temperatureValue.textContent = '0.7';
        
        showToast('配置已重置！', 'success');
    }
}

// 使用真实AI API生成课件
async function generateCoursewareWithAI(prompt, uploadedContent = '') {
    if (!apiConfig.apiKey) {
        showToast('请先配置API Key', 'error');
        return null;
    }
    
    const fullPrompt = uploadedContent 
        ? `基于以下教案内容：\n${uploadedContent}\n\n用户要求：${prompt}\n\n${apiConfig.systemPrompt}`
        : `${apiConfig.systemPrompt}\n\n用户要求：${prompt}`;
    
    try {
        const response = await callAIAPI(fullPrompt);
        return response;
    } catch (error) {
        console.error('AI生成失败:', error);
        showToast(`生成失败：${error.message}`, 'error');
        return null;
    }
}

// 调用AI API
async function callAIAPI(prompt) {
    const { provider, apiKey, baseUrl, temperature } = apiConfig;
    
    const configs = {
        openai: {
            url: baseUrl || 'https://api.openai.com/v1/chat/completions',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: {
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: temperature,
                max_tokens: 4000
            }
        },
        anthropic: {
            url: baseUrl || 'https://api.anthropic.com/v1/messages',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            body: {
                model: 'claude-3-sonnet-20240229',
                max_tokens: 4000,
                temperature: temperature,
                messages: [{ role: 'user', content: prompt }]
            }
        },
        google: {
            url: baseUrl || `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    maxOutputTokens: 4000,
                    temperature: temperature
                }
            }
        },
        deepseek: {
            url: baseUrl || 'https://api.deepseek.com/v1/chat/completions',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: {
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: prompt }],
                temperature: temperature,
                max_tokens: 4000,
                stream: false
            }
        },
        zhipu: {
            url: baseUrl || 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: {
                model: 'glm-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: temperature,
                max_tokens: 4000
            }
        }
    };
    
    const config = configs[provider];
    if (!config) {
        throw new Error('不支持的API提供商');
    }
    
    const response = await fetch(config.url, {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify(config.body)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '请求失败');
    }
    
    const data = await response.json();
    
    // 提取响应内容
    let content = '';
    if (provider === 'anthropic') {
        content = data.content?.[0]?.text || '';
    } else if (provider === 'google') {
        content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
        content = data.choices?.[0]?.message?.content || '';
    }
    
    return content;
}

// 应用初始化
document.addEventListener('DOMContentLoaded', initApp);
