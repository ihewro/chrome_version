document.addEventListener('DOMContentLoaded', function() {
    // 元素引用
    const versionInput = document.getElementById('version');
    const channelSelect = document.getElementById('channel');
    const platformSelect = document.getElementById('platform');
    const searchBtn = document.getElementById('search-btn');
    const resultsBody = document.getElementById('results-body');
    const resultsTable = document.getElementById('results-table');
    const resultsPagination = document.getElementById('results-pagination');
    const totalCountElem = document.getElementById('total-count');
    const currentPageElem = document.getElementById('current-page');
    const totalPagesElem = document.getElementById('total-pages');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    // 获取分页控件容器
    const paginationControls = document.getElementById('pagination-controls');
    const loadingSpinner = document.getElementById('loading-spinner');
    const detailModal = document.getElementById('detail-modal');
    const detailContent = document.getElementById('detail-content');
    const closeModal = document.querySelector('.close-modal');

    // 分页配置
    const itemsPerPage = 10;
    let currentPage = 1;
    let totalPages = 1;
    let allResults = [];
    
    // 初始加载
    loadDefaultResults();
    
    // 事件监听器
    searchBtn.addEventListener('click', performSearch);
    prevPageBtn.addEventListener('click', goToPrevPage);
    nextPageBtn.addEventListener('click', goToNextPage);
    
    // 事件委托：处理动态生成的 "下载" 按钮点击
    document.addEventListener('click', function(event) {
        // 检查是否是下载按钮，但不是模态框内的最终下载链接
        if (event.target.classList.contains('download-btn') && !event.target.classList.contains('modal-download-link')) {
            event.preventDefault(); // 阻止默认行为（例如，表格中的按钮）
            const index = event.target.getAttribute('data-index');
            const position = event.target.getAttribute('data-position');
            const platform = event.target.getAttribute('data-platform'); // 获取基础平台
            if (index !== null && position !== null && platform !== null) {
                // 直接调用 handleDownloadClick，它会处理模态框和检查
                handleDownloadClick(parseInt(index), platform, parseInt(position));
            }
        } else if (event.target.classList.contains('modal-download-link')) {
            // 对于模态框内的最终下载链接，不阻止默认行为，允许在新标签页打开
        }
    });

    // 事件委托：处理动态生成的 "详情" 按钮点击
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('detail-btn')) {
            const index = event.target.getAttribute('data-index');
            if (index !== null) {
                showDetails(parseInt(index));
            }
        }
    });

    // 事件委托：处理动态生成的 "继续尝试更多" 按钮点击
    document.addEventListener('click', async function(event) {
        if (event.target.id === 'try-more-btn') {
            const button = event.target;
            // 读取当前选中的架构 (确保使用精确的架构)
            const selectedPlatform = getSelectedPlatformArch(); // 使用函数获取精确平台
            const position = parseInt(button.dataset.position);
            const lastPosition = parseInt(button.dataset.lastPosition);
            const modal = button.closest('.detail-modal'); // 找到按钮所在的模态框
    
            if (!modal) {
                console.error('无法找到模态框');
                return;
            }
    
            const containerElement = modal.querySelector('#download-check-results'); // 找到该模态框内的结果容器
            const loadingAnimation = modal.querySelector('#loading-animation'); // 找到该模态框内的加载动画
    
            if (!containerElement) {
                console.error('无法找到下载检查结果容器');
                return;
            }
    
            // 读取上一次尝试的 *最后一个* 位置
            const lastAttemptedPosition = parseInt(button.dataset.lastPosition);

            // 移除当前按钮
            button.remove();
    
            // 显示加载动画
            if (loadingAnimation) loadingAnimation.style.display = 'flex';
    
            // 继续检查更多位置，传入选定的平台架构，并确保是递增查找
            // 注意：这里的逻辑需要确认是递增还是递减。假设原始意图是查找 *更新* 的版本，则应递增。
            // 如果是查找 *更旧* 的版本，则递减。根据用户反馈，应为递增。
            const nextPositionToTry = lastAttemptedPosition + 1; // 从上一次失败的位置之后开始递增查找
            const moreResult = await findAvailableDownload(selectedPlatform, nextPositionToTry, containerElement, 10, nextPositionToTry); // 使用递增后的位置

            // 更新结果 - 如果在“更多尝试”中找到结果，则更新UI
            // 注意：findAvailableDownload 在找不到时会自己处理UI（添加新的 try-more-btn），这里只需要处理找到的情况
            if (moreResult.available) {
                 // 隐藏加载动画（如果它还在）
                 if (loadingAnimation) loadingAnimation.style.display = 'none';
                 const statusElement = containerElement.querySelector('#check-status');
                 if (statusElement) statusElement.textContent = `检查完成`;
    
                // 获取列表元素，准备追加成功信息
                const resultsList = containerElement.querySelector('#check-results-list');
                
                // 移除旧的摘要和错误信息
                const oldSummary = containerElement.querySelector('.check-summary');
                if (oldSummary) oldSummary.remove();
                const oldError = containerElement.querySelector('.download-info.error');
                if (oldError) oldError.remove();
                // 移除旧的“未找到可用下载链接”状态文本（如果存在于 #check-status）
                // (可选) 如果需要，可以清空或更新 statusElement.textContent

                // 添加成功信息和下载按钮（追加到容器末尾，在列表之后）
                const successFragment = document.createRange().createContextualFragment(`
                    <a href="https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=${selectedPlatform}/${moreResult.position}/" target="_blank" class="modal-download-link download-btn ant-btn ant-btn-success">下载 (${selectedPlatform})</a>
                    <div class="download-info success">已找到可用下载链接 (位置: ${moreResult.position}, 平台: ${selectedPlatform})</div>
                    <div class="check-summary">检查结果摘要: 在后续尝试中找到可用链接</div>
                `);
                containerElement.appendChild(successFragment); // 追加到容器末尾
            } else {
                 // 如果 findAvailableDownload 再次失败，它内部会处理UI（可能再次添加按钮或显示最终失败消息）
                 // 这里不需要额外操作，除非想覆盖 findAvailableDownload 的失败处理逻辑
                 if (loadingAnimation) loadingAnimation.style.display = 'none'; // 确保隐藏加载
                 const statusElement = containerElement.querySelector('#check-status');
                 if (statusElement) statusElement.textContent = `在额外尝试后仍未找到可用链接`;
            }
        }
    });
    
    // 默认加载Stable & Mac的结果
    function loadDefaultResults() {
        const channel = 'Stable';
        const platform = 'Mac';
        fetchReleases(channel, platform);
    }
    
    // 执行搜索
    function performSearch() {
        const channel = channelSelect.value;
        const platform = platformSelect.value;
        const versionFilter = versionInput.value.trim();
        
        currentPage = 1;
        fetchReleases(channel, platform, versionFilter);
    }
    
    // 获取版本数据
    function fetchReleases(channel, platform, versionFilter = '') {
        // 显示加载动画，隐藏表格和分页
        loadingSpinner.style.display = 'flex';
        resultsTable.style.display = 'none'; // 隐藏表格主体
        resultsPagination.style.display = 'none'; // 隐藏分页
        if (paginationControls) paginationControls.style.display = 'none'; // 隐藏分页
        resultsBody.innerHTML = ''; // 清空旧结果
        
        // 使用较大的num值以获取足够的数据进行客户端过滤
        const apiUrl = `https://chromiumdash.appspot.com/fetch_releases?channel=${channel}&platform=${platform}&num=100&offset=0`;
        
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                // 隐藏加载动画，显示表格和分页
                loadingSpinner.style.display = 'none';
                resultsTable.style.display = ''; // 恢复表格显示
                resultsPagination.style.display = ''; // 恢复分页显示
                if (paginationControls) paginationControls.style.display = 'flex'; // 恢复分页显示
                
                // 如果有版本过滤条件，进行客户端过滤
                if (versionFilter) { 
                    allResults = data.filter(item => {
                        return item.version.includes(versionFilter);
                    });
                } else {
                    allResults = data;
                }
                
                // 更新分页信息
                totalPages = Math.ceil(allResults.length / itemsPerPage);
                updatePaginationUI();
                
                // 显示当前页的结果
                displayResults();
            })
            .catch(error => {
                // 隐藏加载动画，显示表格和分页（即使出错也要显示错误信息）
                loadingSpinner.style.display = 'none';
                resultsBody.style.display = ''; // 恢复表格显示
                if (paginationControls) paginationControls.style.display = 'flex'; // 恢复分页显示
                console.error('获取数据失败:', error);
                resultsBody.innerHTML = `<tr><td colspan="4">获取数据失败，请稍后再试</td></tr>`;
            });
    }
    
    // 显示结果
    function displayResults() {
        // 清空现有结果
        resultsBody.innerHTML = '';
        
        // 计算当前页的起始和结束索引
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, allResults.length);
        
        // 如果没有结果
        if (allResults.length === 0) {
            resultsBody.innerHTML = `<tr><td colspan="3">没有找到匹配的结果</td></tr>`;
            totalCountElem.textContent = `总计: 0 个结果`;
            return;
        }
        
        // 更新总计数
        totalCountElem.textContent = `总计: ${allResults.length} 个结果`;
        
        // 添加当前页的结果
        for (let i = startIndex; i < endIndex; i++) {
            const item = allResults[i];
            const row = document.createElement('tr');
            
            // 格式化时间
            const date = new Date(item.time);
            const formattedDate = date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            // 构建下载链接 (使用新的函数获取列表展示用的平台代码)
            const platformCodeForList = getPlatformCodeForList(item.platform);
            // 注意：这里的 downloadUrl 仅用于列表展示参考，实际检查在模态框中进行
            // const downloadUrl = `https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=${platformCodeForList}/${item.chromium_main_branch_position}`;

            row.innerHTML = `
                <td>${item.version}</td>
                <td>${formattedDate}</td>
                <td>
                    <button class="download-btn ant-btn ant-btn-success" data-index="${i}" data-position="${item.chromium_main_branch_position}" data-platform="${item.platform}">检查下载</button>
                </td>
                <td>
                    <button class="detail-btn ant-btn ant-btn-default" data-index="${i}">+</button>
                </td>
            `;

            resultsBody.appendChild(row);
        }
    }

    // 获取平台代码 (调整为返回最常用架构或基础平台供初始列表使用)
    function getPlatformCodeForList(platform) {
        switch (platform) {
            case 'Mac':
                return 'Mac_Arm'; // 默认显示 ARM 链接，或保持 'Mac' 让用户选择
            case 'Windows':
                return 'Win_x64';
            case 'Linux':
                return 'Linux_x64';
            default:
                return 'Mac_Arm'; // 默认回退
        }
    }

    // 新增：获取模态框中选中的平台架构
    function getSelectedPlatformArch() {
        const macArchOptions = document.getElementById('mac-arch-options');
        const linuxArchOptions = document.getElementById('linux-arch-options');
        const windowsArchOptions = document.getElementById('windows-arch-options');
        console.log(macArchOptions, linuxArchOptions, windowsArchOptions);
        if (macArchOptions.style.display !== 'none') {
            const selectedMacArch = document.querySelector('input[value="Mac"]:checked');
            return selectedMacArch ? selectedMacArch.value : 'Mac_Arm'; // 默认 Mac_Arm
        } else if (linuxArchOptions.style.display !== 'none') {
            const selectedLinuxArch = document.querySelector('input[value="Linux"]:checked');
            return selectedLinuxArch ? selectedLinuxArch.value : 'Linux_x64'; // 默认 Linux_x64
        } else if (windowsArchOptions.style.display !== 'none') {
            const selectedWindowsArch = document.querySelector('input[value="Win"]:checked');
            return selectedWindowsArch ? selectedWindowsArch.value : 'Win_x64'; // 默认 Win_x64
        }
        console.error('未找到匹配的架构选项',macArchOptions, linuxArchOptions, windowsArchOptions);
        alert('未找到匹配的架构选项');
        // 如果选择器都不可见（理论上不应发生），返回基础平台或默认值
        return platformSelect.value; // 或者一个更安全的默认值
    }

    // 更新分页UI
    function updatePaginationUI() {
        currentPageElem.textContent = currentPage;
        totalPagesElem.textContent = totalPages;
        
        // 更新按钮状态
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
    }

    // 上一页
    function goToPrevPage() {
        if (currentPage > 1) {
            currentPage--;
            updatePaginationUI();
            displayResults();
        }
    }

    // 下一页
    function goToNextPage() {
        if (currentPage < totalPages) {
            currentPage++;
            updatePaginationUI();
            displayResults();
        }
    }

    // 检查下载链接可用性 (现在接收精确的 platformArch)
    async function checkDownloadAvailability(platformArch, position) {
        // 直接使用传入的 platformArch
        const url = `https://www.googleapis.com/download/storage/v1/b/chromium-browser-snapshots/o/${platformArch}%2F${position}%2FREVISIONS?alt=media`;

        try {
            // 不再需要 Mac 的特殊处理和回退逻辑
            const response = await fetch(url, { method: 'HEAD' });
            return {
                status: response.status,
                available: response.status !== 404,
                position: position,
                // 生成对应架构的下载页面链接
                url: `https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=${platformArch}/${position}`,
                platform: platformArch // 返回使用的具体平台架构
            };
        } catch (error) {
            console.error(`检查 ${platformArch}/${position} 出错:`, error);
            return {
                status: -1, // 表示网络或其他错误
                available: false,
                position: position,
                url: `https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=${platformArch}/${position}`,
                platform: platformArch,
                error: error
            };
        }
    }

    // 查找可用的下载链接 (现在接收精确的 platformArch)
    async function findAvailableDownload(platformArch, startPosition, containerElement, maxAttempts = 10, lastKnownPosition = null) {
        let currentPosition = startPosition;
        const resultsList = containerElement.querySelector('#check-results-list');
        const statusElement = containerElement.querySelector('#check-status');
        const loadingAnimation = containerElement.querySelector('#loading-animation');

        // 清空旧结果并显示加载状态
        if (resultsList) resultsList.innerHTML = '';
        if (statusElement) statusElement.textContent = '正在检查...';
        if (loadingAnimation) loadingAnimation.style.display = 'flex';

        // 移除旧的“继续尝试”按钮（如果存在）
        const existingTryMoreBtn = containerElement.querySelector('#try-more-btn');
        if (existingTryMoreBtn) existingTryMoreBtn.remove();
        // 移除旧的成功/错误信息和下载按钮
        const oldSuccessLink = containerElement.querySelector('.modal-download-link');
        if (oldSuccessLink) oldSuccessLink.remove();
        const oldInfo = containerElement.querySelectorAll('.download-info');
        oldInfo.forEach(el => el.remove());
        const oldSummary = containerElement.querySelector('.check-summary');
        if (oldSummary) oldSummary.remove();


        for (let i = 0; i < maxAttempts; i++) {
            if (statusElement) statusElement.textContent = `正在检查 ${platformArch} 位置: ${currentPosition}... (${i + 1}/${maxAttempts})`;
            if (resultsList) {
                const li = document.createElement('li');
                li.textContent = `尝试位置: ${currentPosition} (${platformArch})...`;
                resultsList.appendChild(li);
            }

            const result = await checkDownloadAvailability(platformArch, currentPosition);

            if (resultsList) {
                const lastLi = resultsList.lastElementChild;
                if (lastLi) {
                    lastLi.textContent += result.available ? ' ✔️ 可用' : ' ❌ 不可用';
                    lastLi.classList.add(result.available ? 'success' : 'error');
                }
            }

            if (result.available) {
                if (statusElement) statusElement.textContent = '检查完成';
                if (loadingAnimation) loadingAnimation.style.display = 'none';
                return { available: true, position: currentPosition, platform: platformArch };
            }

            // 如果达到最大尝试次数
            if (i === maxAttempts - 1) {
                break; // 跳出循环，处理未找到的情况
            }

            // 递增位置
            currentPosition++;
            // 如果位置小于0，停止尝试
            if (currentPosition < 0) {
                 if (statusElement) statusElement.textContent = '检查完成 (已尝试所有有效位置)';
                 if (loadingAnimation) loadingAnimation.style.display = 'none';
                 // 添加最终未找到信息
                 const finalErrorFragment = document.createRange().createContextualFragment(`
                    <div class="download-info error">在 ${maxAttempts} 次尝试后仍未找到 ${platformArch} 的可用下载链接 (起始位置 ${startPosition})</div>
                    <div class="check-summary">检查结果摘要: 未找到可用链接</div>
                 `);
                 containerElement.appendChild(finalErrorFragment);
                 return { available: false, position: null, platform: platformArch };
            }
        }

        // 循环结束仍未找到
        if (statusElement) statusElement.textContent = '检查完成';
        if (loadingAnimation) loadingAnimation.style.display = 'none';

        const lastAttemptedPositionInLoop = currentPosition - 1; // 记录循环中最后尝试的位置
        const fragment = document.createRange().createContextualFragment(`
            <div class="download-info error">在 ${maxAttempts} 次尝试后未找到 ${platformArch} 的可用下载链接 (起始位置 ${startPosition})</div>
            <button id="try-more-btn" class="ant-btn ant-btn-default" style="margin-top:10px;" data-platform="${platformArch}" data-start-position="${startPosition}" data-last-position="${lastAttemptedPositionInLoop}">继续尝试更多 (+10)</button>
            <div class="check-summary">检查结果摘要: 未找到可用链接</div>
        `);
        containerElement.appendChild(fragment);

        return { available: false, position: null, platform: platformArch };
    }

    // 处理下载按钮点击（现在接收基础平台和位置）
    async function handleDownloadClick(index, basePlatform, position) {
        const item = allResults[index];
        if (!item) return;

        // 准备模态框内容，但不立即开始检查
        detailContent.innerHTML = `
            <h4>版本: ${item.version} (${basePlatform})</h4>
            <p>Channel: ${item.channel}</p>
            <p>Milestone: ${item.milestone}</p>
            <p>Position: ${item.chromium_main_branch_position}</p>
            <p>Time: ${new Date(item.time).toLocaleString('zh-CN')}</p>
            <div id="download-check-results">
                <p id="check-status">请选择架构并点击检查按钮</p>
                <ul id="check-results-list">选择正确的平台架构以便获取链接</ul>
                <div id="loading-animation" class="loading-spinner" style="display: none; justify-content: center; align-items: center; margin-top: 10px;">
                    <div class="ant-spin ant-spin-spinning">
                        <span class="ant-spin-dot ant-spin-dot-spin">
                            <i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i>
                        </span>
                    </div>
                    <span style="margin-left: 8px;">检查中...</span>
                </div>
                <!-- 下载链接/按钮将在此处动态添加 -->
            </div>
        `;

        // 添加架构选择器（从 index.html 移入或复制结构）
        const archSelectorHtml = `
            <div id="platform-arch-selector" style="display: none; margin-top: 15px;">
                <strong>选择架构:</strong>
                <div id="mac-arch-options" style="display: none;">
                    <label><input type="radio" name="Mac" value="Mac_Arm" checked> Mac ARM</label>
                    <label style="margin-left: 10px;"><input type="radio" name="Mac" value="Mac"> Mac Intel</label>
                </div>
                <div id="linux-arch-options" style="display: none;">
                    <label><input type="radio" name="Linux" value="Linux_x64" checked> Linux x64</label>
                    <label style="margin-left: 10px;"><input type="radio" name="Linux" value="Linux"> Linux</label>
                </div>
                <div id="windows-arch-options" style="display: none;">
                    <label><input type="radio" name="Win" value="Win_x64" checked> Windows x64</label>
                    <label style="margin-left: 10px;"><input type="radio" name="Win" value="Win"> Windows</label>
                </div>
                <button id="start-check-btn" class="ant-btn ant-btn-primary" style="margin-top: 10px;">开始检查</button>
            </div>
        `;
        detailContent.insertAdjacentHTML('beforeend', archSelectorHtml);

        // 获取新添加的元素引用
        const platformArchSelector = detailContent.querySelector('#platform-arch-selector');
        const macArchOptions = detailContent.querySelector('#mac-arch-options');
        const linuxArchOptions = detailContent.querySelector('#linux-arch-options');
        const windowsArchOptions = detailContent.querySelector('#windows-arch-options');
        const startCheckBtn = detailContent.querySelector('#start-check-btn');

        // 根据基础平台显示对应的架构选项
        console.log('basePlatform:', basePlatform);
        macArchOptions.style.display = basePlatform === 'Mac' ? 'block' : 'none';
        linuxArchOptions.style.display = basePlatform === 'Linux' ? 'block' : 'none';
        windowsArchOptions.style.display = basePlatform === 'Windows' ? 'block' : 'none';
        platformArchSelector.style.display = 'block'; // 确保选择器可见

        // 显示模态框
        detailModal.style.display = 'block';

        // 为“开始检查”按钮添加一次性事件监听器
        startCheckBtn.onclick = async () => {
            const selectedArch = getSelectedPlatformArch(); // 获取模态框内的选择
            const checkResultsContainer = detailContent.querySelector('#download-check-results');
            
            // 禁用按钮，防止重复点击
            startCheckBtn.disabled = true;
            startCheckBtn.textContent = '检查中...';

            // 开始检查
            const result = await findAvailableDownload(selectedArch, position, checkResultsContainer, 10);

            // 根据检查结果更新UI
            if (result.available) {
                const successFragment = document.createRange().createContextualFragment(`
                    <a href="https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=${result.platform}/${result.position}/" target="_blank" class="modal-download-link download-btn ant-btn ant-btn-success">下载 (${result.platform})</a>
                    <div class="download-info success">已找到可用下载链接 (位置: ${result.position}, 平台: ${result.platform})</div>
                    <div class="check-summary">检查结果摘要: 找到可用链接</div>
                `);
                checkResultsContainer.appendChild(successFragment);
                const statusElement = checkResultsContainer.querySelector('#check-status');
                if (statusElement) statusElement.textContent = '检查完成';
            } else {
                // findAvailableDownload 内部会处理未找到的情况（包括添加 try-more-btn）
                const statusElement = checkResultsContainer.querySelector('#check-status');
                 if (statusElement) statusElement.textContent = '检查完成'; // 即使失败也标记完成
            }
            // 检查完成后可以移除“开始检查”按钮或保持禁用状态
            startCheckBtn.remove(); // 或者 startCheckBtn.textContent = '检查完成';
        };
    }

    // 显示详细信息模态框 (仅显示信息，不触发检查)
    function showDetails(index) {
        const item = allResults[index];
        if (!item) return;

        // 获取模态框内容区域
        const detailContent = document.getElementById('detail-content');
        if (!detailContent) {
            console.error('无法找到模态框内容区域 #detail-content');
            return;
        }

        // 格式化时间
        const date = new Date(item.time);
        const formattedDate = date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // 填充模态框内容
        detailContent.innerHTML = `
            <p><strong>版本:</strong> ${item.version}</p>
            <p><strong>时间:</strong> ${formattedDate}</p>
            <p><strong>平台:</strong> ${item.platform}</p>
            <p><strong>位置 (Position):</strong> ${item.chromium_main_branch_position}</p>
            <!-- 可以根据需要添加更多详细信息 -->
        `;

        // 获取模态框元素 (确保 detailModal 已在全局或函数作用域内定义并获取)
        const detailModal = document.getElementById('detail-modal');
        if (!detailModal) {
            console.error('无法找到模态框元素 #detail-modal');
            return;
        }

        // 显示模态框
        detailModal.style.display = 'block';
    }

    // 关闭模态框
    closeModal.addEventListener('click', function() {
        detailModal.style.display = 'none';
        // 清空内容，防止旧的检查结果残留
        detailContent.innerHTML = '';
    });

    // 点击模态框外部关闭
    window.addEventListener('click', function(event) {
        if (event.target == detailModal) {
            detailModal.style.display = 'none';
            // 清空内容
            detailContent.innerHTML = '';
        }
    });
});