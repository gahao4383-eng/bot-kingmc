const http = require('http');
const mineflayer = require('mineflayer');

// TẠO WEB SERVER ĐỂ GIỮ BOT SỐNG 24/7
http.createServer((req, res) => {
  res.write("Bot KingMC dang online 24/7!");
  res.end();
}).listen(process.env.PORT || 3000);

// CẤU HÌNH TÀI KHOẢN
const ACCOUNT = { username: 'stt03sh', password: 'stt03sh2705' };
const FOOD_NAMES = ['bread', 'cooked_beef', 'cooked_porkchop', 'cooked_chicken', 'apple', 'baked_potato', 'golden_carrot'];
let da_chuyen_cum = false;
let da_gui_warp = false; 
let checkEatInterval = null;
let isLoggingIn = false;

function startBot() {
  da_chuyen_cum = false;
  da_gui_warp = false;
  isLoggingIn = false;
  if (checkEatInterval) clearInterval(checkEatInterval);
  
  console.log('[~] Dang ket noi tai khoan ' + ACCOUNT.username + ' den KingMC...');
  
  const bot = mineflayer.createBot({
    host: 'kingmc.vn',
    port: 25565,
    username: ACCOUNT.username,
    version: '1.20.4',
    brand: 'vanilla',
    viewDistance: 'tiny',
    physicsEnabled: true
  });

  bot.on('login', () => {
    console.log('[+] Da mo cong ket noi socket thanh cong!');
  });

  // Lắng nghe chat để theo dõi trạng thái thực tế
  bot.on('message', (message) => {
    const text = message.toString();
    if (text.includes('Dang nhap thanh cong') || text.includes('Welcome')) {
      console.log('[+] Chinh thuc dang nhap thanh cong vao server!');
    }
  });

  bot.on('forcedMove', () => {
    if (da_chuyen_cum && !da_gui_warp) {
      da_gui_warp = true; 
      console.log('[+] He thong phat hien doi cum! Dang doi 6 giay de go lenh AFK...');
      setTimeout(() => {
        bot.chat('/warp afk');
        console.log('[+] Da gui lenh di chuyen khu AFK: /warp afk. Hoan tat!');
        
        if (!checkEatInterval) {
          checkEatInterval = setInterval(async () => {
            if (!bot || !bot.inventory) return;
            if (bot.food < 15) {
              const foodItem = bot.inventory.items().find(item => FOOD_NAMES.includes(item.name));
              if (foodItem) {
                try {
                  await bot.equip(foodItem, 'hand');
                  bot.activateItem();
                  setTimeout(() => { if (bot && bot.deactivateItem) bot.deactivateItem(); }, 3500);
                } catch (err) {}
              }
            }
          }, 7000);
        }

        setInterval(() => {
          if (!bot || !bot.setControlState) return;
          bot.setControlState('jump', true);
          setTimeout(() => { if (bot && bot.setControlState) bot.setControlState('jump', false); }, 500);
        }, 30000);
      }, 6000);
    }
  });

  bot.on('spawn', () => {
    if (da_chuyen_cum) return;
    if (isLoggingIn) return;
    isLoggingIn = true;
    console.log('[+] Nhan varsity xuat hien tai sanh cho chinh.');
    
    setTimeout(() => {
      if (!bot) return;
      bot.chat('/login ' + ACCOUNT.password);
      console.log('[>] Da go lenh dang nhap.');
      
      // Tăng thời gian chờ lên 8 giây để tránh lag server
      setTimeout(() => {
        if (da_chuyen_cum || !bot) return;
        bot.chat('/menu');
        console.log('[>] Da go lenh mo menu lần 1.');
        
        // Dự phòng: Gõ lại lệnh menu sau 5 giây nếu lần 1 thất bại
        setTimeout(() => {
          if (da_chuyen_cum || !bot) return;
          bot.chat('/menu');
          console.log('[>] Auto gõ lại /menu phòng hờ delay.');
        }, 5000);
        
      }, 8000);
    }, 4000);
  });

  bot.on('windowOpen', async (window) => {
    if (da_chuyen_cum) return;
    console.log('[+] Menu giao dien da mo thanh cong.');
    setTimeout(async () => {
      try {
        da_chuyen_cum = true;
        await bot.clickWindow(24, 0, 0);
        console.log('[>] Da chon o so 24 (KingSMP). Tien hanh buoc di de kich hoat chuyen cum...');
        setTimeout(() => {
          if (bot && bot.setControlState) {
            bot.setControlState('forward', true);
            setTimeout(() => bot.setControlState('forward', false), 1000);
          }
        }, 1000);
      } catch (err) {
        console.log('[Loi] Khong the tuong tact voi menu:', err.message);
        da_chuyen_cum = false;
      }
    }, 3000);
  });

  bot.on('end', (reason) => {
    console.log('[-] Bot bi mat ket noi (' + reason + '). Tu dung dang nhap lai sau 15 giay...');
    if (checkEatInterval) clearInterval(checkEatInterval);
    setTimeout(() => startBot(), 15000);
  });

  bot.on('error', (err) => {
    console.log('[Loi he thong]:', err.message);
  });
}

startBot();
