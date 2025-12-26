
let settings = {};
let allApiItems = [];

// Icons shown next to each category in the UI
const categoryIcons = {
    'Downloader': 'download',
    'Imagecreator': 'image',
    'Openai': 'smart_toy',
    'Random': 'shuffle',
    'Search': 'search',
    'Stalker': 'visibility',
    'Tools': 'build',
    'Orderkuota': 'paid',
    'AI Tools': 'psychology'
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        settings = await loadSettings();
        setupUI();
        await loadAPIData();
        setupEventListeners();
        updateActiveUsers();
        
    } catch (error) {
        console.error('Error:', error);
        showErrorMessage(error);
    } finally {
        // Always hide loading screen
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 1000);
    }
}

async function loadSettings() {
    try {
        const response = await fetch('/settings');
        if (!response.ok) throw new Error('Settings not found');
        return await response.json();
    } catch (error) {
        return getDefaultSettings();
    }
}

function getDefaultSettings() {
    return {
        name: "Yopandelreyz API",
        creator: "Yopandelreyz",
        description: "Interactive API documentation with real-time testing",
        categories: []
    };
}

function setupUI() {
    const titleApi = document.getElementById("titleApi");
    const descApi = document.getElementById("descApi");
    const footer = document.getElementById("footer");
    
    const apiName = settings.name || "Yopandelreyz API";
    const apiDesc = settings.description || "Interactive API documentation with real-time testing";

    if (titleApi) titleApi.textContent = apiName;
    if (descApi) descApi.textContent = apiDesc;
    if (footer) footer.textContent = `© ${new Date().getFullYear()} ${settings.creator || "Yopandelreyz"} • ${apiName}`;

    // Also reflect in the browser tab title
    document.title = `${apiName} — API Docs`;
    
    const telegramLink = document.getElementById('telegramLink');
    const whatsappLink = document.getElementById('whatsappLink');
    const youtubeLink = document.getElementById('youtubeLink');
    const Information = document.getElementById("contactCustomerBtn");
    
    if (telegramLink) telegramLink.href = settings.linkTelegram || '#';
    if (whatsappLink) whatsappLink.href = settings.linkWhatsapp || '#';
    if (Information) Information.href = settings.linkWhatsapp || '#';
    if (youtubeLink) youtubeLink.href = settings.linkYoutube || '#';
}

function updateActiveUsers() {
    const el = document.getElementById('activeUsers');
    if (el) {
        const users = Math.floor(Math.random() * 5000) + 1000;
        el.textContent = users.toLocaleString();
    }
}

// Simpan data asli
let originalCategories = [];

async function loadAPIData() {
    console.log('Loading API data...');
    
    try {
        if (!settings.categories || settings.categories.length === 0) {
            console.log('No categories found, using default');
            settings.categories = [];
        }
        
        // Simpan data asli
        originalCategories = JSON.parse(JSON.stringify(settings.categories || []));
        console.log('Original categories saved:', originalCategories.length);
        
        // Render data awal
        renderAPIData(originalCategories);
        
    } catch (error) {
        console.error('Error loading API data:', error);
        // Tetap render dengan data kosong
        renderAPIData([]);
    }
}

function renderAPIData(categories) {
    console.log('Rendering API data:', categories.length, 'categories');
    
    const apiList = document.getElementById('apiList');
    if (!apiList) {
        console.error('apiList element not found!');
        return;
    }
    
    // Clear existing content
    apiList.innerHTML = '';
    
    if (!categories || categories.length === 0) {
        apiList.innerHTML = `
            <div class="empty">
                <div class="empty__title">No API data available</div>
                <div class="empty__desc">The server returned no categories/endpoints.</div>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    categories.forEach((category, catIndex) => {
        if (!category || !category.items) return;
        
        const icon = categoryIcons[category.name] || 'folder';
        const itemCount = category.items.length || 0;
        
        html += `
        <div class="category-group" data-category="${(category.name || '').toLowerCase()}">
            <button onclick="toggleCategory(${catIndex})" class="category-head" type="button">
                <div class="category-title">
                    <span class="material-icons" aria-hidden="true">${icon}</span>
                    <span class="category-name" title="${escapeHtml(category.name || '')}">${escapeHtml(category.name || 'Unnamed Category')}</span>
                    <span class="category-count">(${itemCount})</span>
                </div>
                <span class="material-icons" id="category-icon-${catIndex}">expand_less</span>
            </button>
            <div id="category-${catIndex}" class="category-body">`;
        
        category.items.forEach((item, endpointIndex) => {
            if (!item) return;
            
            const method = item.method || 'GET';
            const pathParts = (item.path || '').split('?');
            const path = pathParts[0] || '';
            const itemName = item.name || 'Unnamed Endpoint';
            const itemDesc = item.desc || 'No description';
            
            // Status badge style
            const statusValue = (item.status || 'ready').toLowerCase();
            const statusClass = statusValue.includes('update') ? 'status--update' : (statusValue.includes('error') ? 'status--error' : 'status--ready');
            const methodClass = method.toLowerCase() === 'post' ? 'badge--post' : 'badge--get';

            html += `
                <div class="endpoint-item api-item"
                    data-method="${method.toLowerCase()}"
                    data-path="${escapeHtml(path)}"
                    data-alias="${escapeHtml(itemName)}"
                    data-description="${escapeHtml(itemDesc)}"
                    data-category="${(category.name || '').toLowerCase()}">

                    <button onclick="toggleEndpoint(${catIndex}, ${endpointIndex})" class="endpoint-head" type="button">
                        <div class="endpoint-left">
                            <span class="badge ${methodClass}">${method}</span>
                            <div class="endpoint-meta">
                                <div class="endpoint-path" title="${escapeHtml(path)}">${escapeHtml(path)}</div>
                                <div class="endpoint-row">
                                    <span class="endpoint-name" title="${escapeHtml(itemName)}">${escapeHtml(itemName)}</span>
                                    <span class="status ${statusClass}">${escapeHtml(item.status || 'ready')}</span>
                                </div>
                            </div>
                        </div>
                        <span class="material-icons" id="endpoint-icon-${catIndex}-${endpointIndex}">expand_more</span>
                    </button>

                    <div id="endpoint-${catIndex}-${endpointIndex}" class="endpoint-body hidden">
                        <div class="endpoint-desc">${escapeHtml(itemDesc)}</div>

                        <form id="form-${catIndex}-${endpointIndex}">
                            <div class="fields" id="params-container-${catIndex}-${endpointIndex}">
                                <!-- Parameters inserted here -->
                            </div>

                            <div class="block-title"><span class="material-icons" style="font-size:14px">link</span>Request URL</div>
                            <div class="urlrow">
                                <div class="codebox">
                                    <code id="url-display-${catIndex}-${endpointIndex}">${escapeHtml(window.location.origin + (item.path || ''))}</code>
                                </div>
                                <button type="button" onclick="copyUrl(${catIndex}, ${endpointIndex})" class="iconbtn" title="Copy URL">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>

                            <div class="btnrow">
                                <button type="button" onclick="executeRequest(event, ${catIndex}, ${endpointIndex}, '${method}', '${path}', 'application/json')" class="btn btn--primary">
                                    <i class="fas fa-play"></i>
                                    Execute
                                </button>
                                <button type="button" onclick="clearResponse(${catIndex}, ${endpointIndex})" class="btn btn--danger">
                                    <i class="fas fa-times"></i>
                                    Clear
                                </button>
                            </div>
                        </form>

                        <div id="response-${catIndex}-${endpointIndex}" class="response hidden">
                            <div class="block-title"><span class="material-icons" style="font-size:14px">code</span>Response</div>
                            <div class="response-box">
                                <div class="response-head">
                                    <div class="resp-meta">
                                        <span id="response-status-${catIndex}-${endpointIndex}" class="resp-status">200 OK</span>
                                        <span id="response-time-${catIndex}-${endpointIndex}" class="resp-time">0ms</span>
                                    </div>
                                    <button onclick="copyResponse(${catIndex}, ${endpointIndex})" type="button" class="iconbtn" title="Copy Response">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                                <div class="resp-body">
                                    <div class="response-media-container" id="response-content-${catIndex}-${endpointIndex}"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        });
        
        html += `</div></div>`;
    });
    
    apiList.innerHTML = html;
    
    // Initialize parameters for each endpoint
    setTimeout(() => {
        if (categories && categories.length > 0) {
            categories.forEach((category, catIndex) => {
                if (category && category.items) {
                    category.items.forEach((item, endpointIndex) => {
                        if (item) {
                            initializeEndpointParameters(catIndex, endpointIndex, item);
                        }
                    });
                }
            });
        }
    }, 100);
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    
    if (!searchInput) {
        console.warn('Search input not found');
        return;
    }
    
    searchInput.addEventListener('input', function() {
        handleSearch(this.value);
    });

    // Optional UI helpers (Arix-like UX)
    const expandAllBtn = document.getElementById('expandAllBtn');
    const collapseAllBtn = document.getElementById('collapseAllBtn');

    if (expandAllBtn) {
        expandAllBtn.addEventListener('click', () => setAllExpanded(true));
    }
    if (collapseAllBtn) {
        collapseAllBtn.addEventListener('click', () => setAllExpanded(false));
    }
}

function setAllExpanded(expand = true) {
    // Expand/collapse all categories + endpoints currently rendered in DOM
    const categoryBodies = document.querySelectorAll('.category-body');
    categoryBodies.forEach((body) => {
        const parts = String(body.id || '').split('-');
        const idx = parts[1];
        const icon = document.getElementById(`category-icon-${idx}`);

        if (expand) {
            body.classList.remove('hidden');
            if (icon) icon.textContent = 'expand_less';
        } else {
            body.classList.add('hidden');
            if (icon) icon.textContent = 'expand_more';
        }
    });

    const endpointBodies = document.querySelectorAll('.endpoint-body');
    endpointBodies.forEach((body) => {
        const parts = String(body.id || '').split('-');
        if (parts.length < 3) return;
        const catIndex = parts[1];
        const endpointIndex = parts[2];
        const icon = document.getElementById(`endpoint-icon-${catIndex}-${endpointIndex}`);

        if (expand) {
            body.classList.remove('hidden');
            if (icon) icon.textContent = 'expand_less';
        } else {
            body.classList.add('hidden');
            if (icon) icon.textContent = 'expand_more';
        }
    });
}

function handleSearch(searchTerm) {
    const searchTermLower = (searchTerm || '').toLowerCase().trim();
    const noResults = document.getElementById('noResults');
    
    if (!searchTermLower) {
        // Kembalikan ke data asli
        console.log('Empty search, showing all');
        renderAPIData(originalCategories);
        if (noResults) noResults.classList.add('hidden');
        return;
    }
    
    console.log('Searching for:', searchTermLower);
    
    // Filter data
    const filteredData = [];
    
    originalCategories.forEach(category => {
        if (!category || !category.items) return;
        
        const filteredItems = [];
        
        category.items.forEach(item => {
            if (!item) return;
            
            const matches = 
                (item.name || '').toLowerCase().includes(searchTermLower) ||
                (item.desc || '').toLowerCase().includes(searchTermLower) ||
                (item.path || '').toLowerCase().includes(searchTermLower) ||
                (item.method || '').toLowerCase().includes(searchTermLower) ||
                (category.name || '').toLowerCase().includes(searchTermLower);
            
            if (matches) {
                filteredItems.push(item);
            }
        });
        
        if (filteredItems.length > 0) {
            filteredData.push({
                ...category,
                items: filteredItems
            });
        }
    });
    
    console.log('Filtered results:', filteredData.length, 'categories');
    
    if (filteredData.length === 0) {
        const apiList = document.getElementById('apiList');
        if (apiList) apiList.innerHTML = '';
        if (noResults) noResults.classList.remove('hidden');
    } else {
        renderAPIData(filteredData);
        if (noResults) noResults.classList.add('hidden');
    }
}

function initializeEndpointParameters(catIndex, endpointIndex, item) {
    const paramsContainer = document.getElementById(`params-container-${catIndex}-${endpointIndex}`);
    if (!paramsContainer) return;
    
    const params = extractParameters(item.path);
    
    if (params.length === 0) {
        paramsContainer.innerHTML = `
            <div class="muted" style="padding: 6px 0;">
                <i class="fas fa-circle-check" style="color: var(--good); margin-right: 6px;"></i>
                No parameters required
            </div>
        `;
        return;
    }
    
    let paramsHtml = '';
    params.forEach(param => {
        const isRequired = param.required;
        paramsHtml += `
            <div class="field">
                <div class="field-top">
                    <label for="param-${catIndex}-${endpointIndex}-${param.name}">
                        ${escapeHtml(param.name)} ${isRequired ? '<span class="req">*</span>' : ''}
                    </label>
                    <span class="hint">${escapeHtml(param.type)}</span>
                </div>
                <input
                    type="text"
                    name="${escapeHtml(param.name)}"
                    id="param-${catIndex}-${endpointIndex}-${param.name}"
                    class="input"
                    placeholder="Input ${escapeHtml(param.name)}…"
                    ${isRequired ? 'required' : ''}
                    oninput="updateRequestUrl(${catIndex}, ${endpointIndex})"
                />
            </div>
        `;
    });
    
    paramsContainer.innerHTML = paramsHtml;
    
    // Initial URL update
    setTimeout(() => {
        updateRequestUrl(catIndex, endpointIndex);
    }, 50);
}

function extractParameters(path) {
    const params = [];
    if (!path) return params;
    
    const queryString = path.split('?')[1];
    
    if (!queryString) return params;
    
    try {
        const urlParams = new URLSearchParams(queryString);
        
        for (const [key, value] of urlParams) {
            if (value === '' || value === 'YOUR_API_KEY') {
                params.push({
                    name: key,
                    required: true,
                    type: getParamType(key),
                    description: getParamDescription(key)
                });
            }
        }
    } catch (error) {
        console.error('Error parsing query string:', error);
    }
    
    return params;
}

function getParamType(paramName) {
    const types = {
        'apikey': 'string',
        'url': 'string',
        'question': 'string',
        'query': 'string',
        'prompt': 'string',
        'format': 'string',
        'quality': 'string',
        'size': 'string',
        'limit': 'number'
    };
    return types[paramName] || 'string';
}

function getParamDescription(paramName) {
    const descriptions = {
        'apikey': 'Your API key for authentication',
        'url': 'URL of the content to download/process',
        'question': 'Question or message to ask the AI',
        'query': 'Search query or keywords',
        'prompt': 'Text description for image generation',
        'format': 'Output format (mp4, mp3, jpg, png)',
        'quality': 'Video quality (360p, 720p, 1080p)',
        'size': 'Image dimensions (512x512, 1024x1024)',
        'limit': 'Number of results to return'
    };
    return descriptions[paramName] || paramName;
}

function toggleCategory(index) {
    const category = document.getElementById(`category-${index}`);
    const icon = document.getElementById(`category-icon-${index}`);
    if (category && icon) {
        if (category.classList.contains('hidden')) {
            category.classList.remove('hidden');
            icon.textContent = 'expand_less';
        } else {
            category.classList.add('hidden');
            icon.textContent = 'expand_more';
        }
    }
}

function toggleEndpoint(catIndex, endpointIndex) {
    const endpoint = document.getElementById(`endpoint-${catIndex}-${endpointIndex}`);
    const icon = document.getElementById(`endpoint-icon-${catIndex}-${endpointIndex}`);
    if (endpoint && icon) {
        if (endpoint.classList.contains('hidden')) {
            endpoint.classList.remove('hidden');
            icon.textContent = 'expand_less';
        } else {
            endpoint.classList.add('hidden');
            icon.textContent = 'expand_more';
        }
    }
}

function updateRequestUrl(catIndex, endpointIndex) {
    const form = document.getElementById(`form-${catIndex}-${endpointIndex}`);
    if (!form) return { url: '', hasErrors: false };

    const urlDisplay = document.getElementById(`url-display-${catIndex}-${endpointIndex}`);
    if (!urlDisplay) return { url: '', hasErrors: false };

    let hasErrors = false;
    if (!urlDisplay.dataset.baseUrl) {
        const full = urlDisplay.textContent.trim();
        const [base, query] = full.split('?');
        urlDisplay.dataset.baseUrl = base;
        urlDisplay.dataset.defaultQuery = query || '';
    }
    const baseUrl = urlDisplay.dataset.baseUrl;
    const params = new URLSearchParams(urlDisplay.dataset.defaultQuery);

    const inputs = form.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
        const name = input.name;
        const value = input.value.trim();

        input.classList.remove('border-red-500');

        if (input.required && !value) {
            hasErrors = true;
        }
        params.set(name, value);
    });

    const finalUrl = baseUrl + '?' + params.toString();
    urlDisplay.textContent = finalUrl;

    return { url: finalUrl, hasErrors };
}

async function executeRequest(event, catIndex, endpointIndex, method, path, produces) {
    event.preventDefault();
    
    const { url, hasErrors } = updateRequestUrl(catIndex, endpointIndex);
    
    if (hasErrors) {
        showToast('Please fill in all required parameters', 'error');
        return;
    }
    
    const responseDiv = document.getElementById(`response-${catIndex}-${endpointIndex}`);
    const responseContent = document.getElementById(`response-content-${catIndex}-${endpointIndex}`);
    const responseStatus = document.getElementById(`response-status-${catIndex}-${endpointIndex}`);
    const responseTime = document.getElementById(`response-time-${catIndex}-${endpointIndex}`);
    
    if (!responseDiv || !responseContent || !responseStatus || !responseTime) {
        showToast('Error: Response elements not found', 'error');
        return;
    }
    
    responseDiv.classList.remove('hidden');
    responseContent.innerHTML = '<div style="display:flex;justify-content:center;padding:16px 0;"><div class="loader"></div></div>';
    responseStatus.textContent = 'Loading...';
    responseStatus.className = 'resp-status';
    responseStatus.classList.remove('is-error');
    responseTime.textContent = '';
    
    const startTime = Date.now();
    
    try {
        console.log('Request URL:', url);
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Accept': '*/*',
                'User-Agent': 'Yopandelreyz-API-Docs'
            }
        });
        
        const responseTimeMs = Date.now() - startTime;
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Get content type
        const contentType = response.headers.get('content-type') || '';
        
        // Update response info
        responseStatus.textContent = `${response.status} OK`;
        responseStatus.className = 'resp-status';
        responseStatus.classList.remove('is-error');
        responseTime.textContent = `${responseTimeMs}ms`;
        
        // Handle different content types
        if (contentType.startsWith('image/')) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            
            responseContent.innerHTML = `<img src="${blobUrl}" alt="Image Response">`;
            
        } else if (contentType.includes('audio/')) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            
            responseContent.innerHTML = `
                <audio controls autoplay>
                    <source src="${blobUrl}" type="${contentType}">
                </audio>
            `;
            
        } else if (contentType.includes('video/')) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            
            responseContent.innerHTML = `
                <video controls autoplay>
                    <source src="${blobUrl}" type="${contentType}">
                </video>
            `;
            
        } else if (contentType.includes('application/json')) {
            const data = await response.json();
            
            if (data && typeof data === 'object' && data.error) {
                throw new Error(`API Error: ${data.error}`);
            }
            
            const formattedResponse = JSON.stringify(data, null, 2);
            responseContent.innerHTML = `<pre>${formattedResponse}</pre>`;
           
        } else if (contentType.includes('text/')) {
            const text = await response.text();
            responseContent.innerHTML = `<pre>${escapeHtml(text)}</pre>`;
            
        } else {
            const text = await response.text();
            responseContent.innerHTML = `<pre>${escapeHtml(text)}</pre>`;
        }
        
        showToast('Request successful!', 'success');
        
    } catch (error) {
        console.error('API Request Error:', error);
        
        const errorMessage = error.message || 'Unknown error occurred';
        responseContent.innerHTML = `
            <div style="text-align:center;padding:18px 0;">
                <i class="fas fa-exclamation-triangle" style="font-size:22px;color:var(--bad);"></i>
                <div style="margin-top:8px;font-weight:700;">Error</div>
                <div class="muted" style="margin-top:6px;">${escapeHtml(errorMessage)}</div>
            </div>
        `;
        responseStatus.textContent = 'Error';
        responseStatus.className = 'resp-status is-error';
        responseTime.textContent = '0ms';
        
        showToast(`Request failed: ${errorMessage}`, 'error');
    }
}

function clearResponse(catIndex, endpointIndex) {
    const form = document.getElementById(`form-${catIndex}-${endpointIndex}`);
    const responseDiv = document.getElementById(`response-${catIndex}-${endpointIndex}`);
    
    if (!form || !responseDiv) return;
    
    // Clear inputs
    const inputs = form.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
        input.classList.remove('border-red-500');
    });
    
    // Hide response
    responseDiv.classList.add('hidden');
    
    // Update URL
    updateRequestUrl(catIndex, endpointIndex);
    
    showToast('Form cleared', 'info');
}

function copyUrl(catIndex, endpointIndex) {
    const urlDisplay = document.getElementById(`url-display-${catIndex}-${endpointIndex}`);
    if (!urlDisplay) return;
    
    const url = urlDisplay.textContent.trim()
    
    navigator.clipboard.writeText(url).then(() => {
        showToast('URL copied!', 'success');
    }).catch(err => {
        console.error('Failed to copy URL:', err);
        showToast('Failed to copy URL', 'error');
    });
}

function copyResponse(catIndex, endpointIndex) {
    const responseContent = document.getElementById(`response-content-${catIndex}-${endpointIndex}`);
    if (!responseContent) return;
    
    const text = responseContent.textContent || responseContent.innerText;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('Response copied!', 'success');
    }).catch(err => {
        console.error('Failed to copy response:', err);
        showToast('Failed to copy response', 'error');
    });
}

function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    const icon = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'info': 'fa-info-circle'
    }[type] || 'fa-info-circle';
    
    const color = {
        'success': '#10b981',
        'error': '#ef4444',
        'info': '#3b82f6'
    }[type] || '#3b82f6';
    
    // Avoid injecting raw HTML from message
    toast.innerHTML = `
        <i class="fas ${icon}" style="color: ${color}; font-size: 14px;"></i>
        <span></span>
    `;
    const msgSpan = toast.querySelector('span');
    if (msgSpan) msgSpan.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showErrorMessage(err = undefined) {
    const loadingScreen = document.getElementById('loadingScreen');
    if (!loadingScreen) return;

    const message = (err && err.message) ? err.message : (err ? String(err) : "Using demo configuration");
    
    loadingScreen.innerHTML = `
        <div class="loading__card">
            <i class="fa-solid fa-wifi" style="font-size:22px;color:var(--muted);"></i>
            <div class="loading__text">${escapeHtml(message)}</div>
        </div>
    `;
    
    // Reset settings
    settings = getDefaultSettings();
    setupUI();
    
    // Load empty data
    originalCategories = [];
    renderAPIData([]);
    
    // Setup event listeners
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            handleSearch(this.value);
        });
    }
    
    updateActiveUsers();
    
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => loadingScreen.style.display = 'none', 300);
    }, 1000);
}

// Global functions
window.toggleCategory = toggleCategory;
window.toggleEndpoint = toggleEndpoint;
window.executeRequest = executeRequest;
window.clearResponse = clearResponse;
window.copyUrl = copyUrl;
window.copyResponse = copyResponse;
window.updateRequestUrl = updateRequestUrl;