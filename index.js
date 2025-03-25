const fs = require('fs');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { SocksProxyAgent } = require('socks-proxy-agent');

const API_BASE_URL = 'https://api.gatewayai.app/v1';
const CATEGORIES = ['SOCIAL', 'PARTNERS'];
const CONFIG_FILE = 'config.txt';
const PROXIES_FILE = 'proxies.txt';
(function () {
    const colors = {
        reset: "\x1b[0m",
        bright: "\x1b[1m",
        dim: "\x1b[2m",
        underscore: "\x1b[4m",
        blink: "\x1b[5m",
        reverse: "\x1b[7m",
        hidden: "\x1b[8m",
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
        bgBlack: "\x1b[40m",
        bgRed: "\x1b[41m",
        bgGreen: "\x1b[42m",
        bgYellow: "\x1b[43m",
        bgBlue: "\x1b[44m",
        bgMagenta: "\x1b[45m",
        bgCyan: "\x1b[46m",
        bgWhite: "\x1b[47m"
    };

const bannerLines = [
    `${colors.bright}${colors.green}░▀▀█░█▀█░▀█▀░█▀█${colors.reset}\n` +
    `${colors.bright}${colors.cyan}░▄▀░░█▀█░░█░░█░█${colors.reset}\n` +
    `${colors.bright}${colors.yellow}░▀▀▀░▀░▀░▀▀▀░▀░▀${colors.reset}`,
        `${colors.bright}${colors.bgBlue}╔══════════════════════════════════╗${colors.reset}`,
        `${colors.bright}${colors.bgBlue}║                                  ║${colors.reset}`,
        `${colors.bright}${colors.bgBlue}║  ${colors.magenta}ZAIN ARAIN                      ${colors.bgBlue}║${colors.reset}`,
        `${colors.bright}${colors.bgBlue}║  ${colors.cyan}AUTO SCRIPT MASTER              ${colors.bgBlue}║${colors.reset}`,
        `${colors.bright}${colors.bgBlue}║                                  ║${colors.reset}`,
        `${colors.bright}${colors.bgBlue}║  ${colors.yellow}JOIN TELEGRAM CHANNEL NOW!      ${colors.bgBlue}║${colors.reset}`,
        `${colors.bright}${colors.bgBlue}║  ${colors.green}https://t.me/AirdropScript6     ${colors.bgBlue}║${colors.reset}`,
        `${colors.bright}${colors.bgBlue}║  ${colors.red}@AirdropScript6 - OFFICIAL      ${colors.bgBlue}║${colors.reset}`,
        `${colors.bright}${colors.bgBlue}║  ${colors.cyan}CHANNEL                         ${colors.bgBlue}║${colors.reset}`,
        `${colors.bright}${colors.bgBlue}║                                  ║${colors.reset}`,
        `${colors.bright}${colors.bgBlue}║  ${colors.green}FAST - RELIABLE - SECURE        ${colors.bgBlue}║${colors.reset}`,
        `${colors.bright}${colors.bgBlue}║  ${colors.yellow}SCRIPTS EXPERT                  ${colors.bgBlue}║${colors.reset}`,
        `${colors.bright}${colors.bgBlue}║                                  ║${colors.reset}`,
        `${colors.bright}${colors.bgBlue}╚══════════════════════════════════╝${colors.reset}`
    ];

    // Print each line separately
    bannerLines.forEach(line => console.log(line));
})();

function displayBanner() {
  const banner = `
====================================================================
                   ByData Auto Bot
====================================================================
`;
  console.log(banner);
}

async function readConfig() {
  try {
    const configContent = await fs.promises.readFile(CONFIG_FILE, 'utf8');
    const configs = configContent.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
    
    const accounts = [];
    
    for (const config of configs) {
      const [walletAddress, token] = config.split('|').map(part => part.trim());
      if (walletAddress && token) {
        accounts.push({ walletAddress, token });
      }
    }
    
    console.log(`Loaded ${accounts.length} accounts from config file`);
    return accounts;
  } catch (error) {
    console.error('Error reading config file:', error.message);
    console.log('Make sure you have a config.txt file with format: walletAddress|token');
    process.exit(1);
  }
}

async function readProxies() {
  try {
    const exists = await fs.promises.access(PROXIES_FILE).then(() => true).catch(() => false);
    if (!exists) {
      console.log('No proxies.txt file found. Will proceed without proxies.');
      return [];
    }
    
    const proxiesContent = await fs.promises.readFile(PROXIES_FILE, 'utf8');
    const proxies = proxiesContent.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
    
    console.log(`Loaded ${proxies.length} proxies from proxies file`);
    return proxies;
  } catch (error) {
    console.error('Error reading proxies file:', error.message);
    return [];
  }
}

function createProxyAgent(proxy) {
  if (!proxy) return null;
  
  try {
    if (proxy.startsWith('socks://') || proxy.startsWith('socks4://') || proxy.startsWith('socks5://')) {
      return new SocksProxyAgent(proxy);
    }
    
    if (proxy.includes('@') && !proxy.startsWith('http://') && !proxy.startsWith('https://')) {
      const [auth, address] = proxy.split('@');
      const [user, pass] = auth.split(':');
      const [host, port] = address.split(':');
      
      return new HttpsProxyAgent({
        host,
        port,
        auth: `${user}:${pass}`
      });
    }
    
    if (!proxy.startsWith('http://') && !proxy.startsWith('https://')) {
      const [host, port] = proxy.split(':');
      
      return new HttpsProxyAgent({
        host,
        port
      });
    }
    
    return new HttpsProxyAgent(proxy);
  } catch (error) {
    console.error(`Error creating proxy agent for ${proxy}:`, error.message);
    return null;
  }
}

function createApiClient(token, proxy = null) {
  const config = {
    baseURL: API_BASE_URL,
    headers: {
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.7',
      'content-type': 'application/json',
      'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Brave";v="134"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
      'sec-gpc': '1',
      'Referer': 'https://bydata.app/',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Authorization': `Bearer ${token}`
    },
    timeout: 30000, 
  };
  
  if (proxy) {
    try {
      const agent = createProxyAgent(proxy);
      if (agent) {
        config.httpsAgent = agent;
        config.proxy = false; 
      }
    } catch (error) {
      console.error(`Error setting up proxy for ${proxy}:`, error.message);
    }
  }
  
  return axios.create(config);
}

async function makeApiRequest(apiClient, method, url, data = null) {
  try {
    const config = {
      method,
      url,
      ...(data && { data })
    };
    
    return await apiClient(config);
  } catch (error) {
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.message.includes('socket disconnected')) {
      console.error(`Network error (${error.code || 'connection issue'}). Retrying in 5 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      try {
        return await apiClient({
          method,
          url,
          ...(data && { data })
        });
      } catch (retryError) {
        throw retryError;
      }
    }
    
    throw error;
  }
}

async function fetchTasks(apiClient, walletAddress, category) {
  try {
    const response = await makeApiRequest(
      apiClient, 
      'get', 
      `/social/${walletAddress}?category=${category}`
    );
    
    const tasks = response.data.socialActions || [];
    console.log(`Found ${tasks.length} tasks in ${category} category`);
    return tasks;
  } catch (error) {
    console.error(`Error fetching ${category} tasks:`, error.response?.data || error.message);
    return [];
  }
}

async function completeTask(apiClient, walletAddress, taskId) {
  try {
    const payload = {
      walletAddress,
      id: taskId
    };
    
    const response = await makeApiRequest(
      apiClient,
      'post',
      '/social/complete',
      payload
    );
    
    console.log(`✅ Task ${taskId} completed successfully`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error completing task ${taskId}:`, error.response?.data || error.message);
    return null;
  }
}

async function claimTask(apiClient, walletAddress, taskId) {
  try {
    const payload = {
      walletAddress,
      templateId: taskId
    };
    
    const response = await makeApiRequest(
      apiClient,
      'post',
      '/social/claim',
      payload
    );
    
    console.log(`🏆 XP for task ${taskId} claimed successfully`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error claiming task ${taskId}:`, error.response?.data || error.message);
    return null;
  }
}

async function processTasksWithDelay(apiClient, walletAddress, tasks) {
  for (const task of tasks) {
    if (task.completed && task.claimed) {
      console.log(`⏩ Task "${task.title}" already completed and claimed. Skipping...`);
      continue;
    }
    
    console.log(`\n🔄 Processing: ${task.title} (${task.id}) - ${task.category}`);
    
    if (!task.completed) {
      await completeTask(apiClient, walletAddress, task.id);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    if (!task.claimed) {
      await claimTask(apiClient, walletAddress, task.id);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    console.log(`✨ Finished: ${task.title}`);
    console.log('-----------------------------------');
    
    await new Promise(resolve => setTimeout(resolve, 2500));
  }
}

function displayStats(allTasks, walletAddress) {
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(task => task.completed).length;
  const claimedTasks = allTasks.filter(task => task.claimed).length;
  const totalXP = allTasks.reduce((sum, task) => sum + (task.claimed ? task.xpRewarded : 0), 0);
  
  console.log('\n===== TASK STATISTICS =====');
  console.log(`Wallet: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`);
  console.log(`Total Tasks: ${totalTasks}`);
  console.log(`Completed Tasks: ${completedTasks}`);
  console.log(`Claimed Tasks: ${claimedTasks}`);
  console.log(`Total XP Rewarded: ${totalXP}`);
  console.log('===========================\n');
}

async function processAccount(account, proxy = null) {
  const { walletAddress, token } = account;
  
  console.log(`\n==== Processing account: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)} ====`);
  if (proxy) {
    console.log(`Using proxy: ${proxy}`);
  }
  
  const apiClient = createApiClient(token, proxy);
  let allTasks = [];
  
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      for (const category of CATEGORIES) {
        const tasks = await fetchTasks(apiClient, walletAddress, category);
        allTasks = [...allTasks, ...tasks];
      }
      
      break;
    } catch (error) {
      retryCount++;
      console.error(`Error fetching tasks (attempt ${retryCount}/${maxRetries}):`, error.message);
      
      if (retryCount < maxRetries) {
        console.log(`Waiting 10 seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      } else {
        console.error(`Failed to fetch tasks after ${maxRetries} attempts. Skipping this account.`);
        return;
      }
    }
  }
  
  if (allTasks.length === 0) {
    console.log('No tasks found to process for this account');
    return;
  }
  
  console.log('\nInitial status:');
  displayStats(allTasks, walletAddress);
  
  await processTasksWithDelay(apiClient, walletAddress, allTasks);
  
  let updatedTasks = [];
  for (const category of CATEGORIES) {
    const tasks = await fetchTasks(apiClient, walletAddress, category);
    updatedTasks = [...updatedTasks, ...tasks];
  }
  
  console.log('\nFinal status:');
  displayStats(updatedTasks, walletAddress);
}

async function main() {
  try {
    displayBanner();
    
    const accounts = await readConfig();
    const proxies = await readProxies();
    
    if (accounts.length === 0) {
      console.error('No valid accounts found in config file');
      return;
    }
    
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      const proxy = proxies.length > 0 ? proxies[i % proxies.length] : null;
      
      try {
        await processAccount(account, proxy);
      } catch (error) {
        console.error(`Error processing account ${account.walletAddress.substring(0, 6)}...: ${error.message}`);
        console.log('Continuing with next account...');
      }
      
      if (i < accounts.length - 1) {
        console.log('\nWaiting 5 seconds before processing next account...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    console.log('\n✅ All accounts processed successfully!');
    
  } catch (error) {
    console.error('Error in main process:', error.message);
  }
}

main();