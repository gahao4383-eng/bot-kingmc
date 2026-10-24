const mineflayer = require('mineflayer');

const ACCOUNT = { 
    username: 'stt01sh', 
    password: 'stt01sh2705' 
};

const FOOD_NAMES = ['bread', 'cooked_beef', 'cooked_porkchop', 'cooked_chicken', 'apple', 'baked_potato', 'golden_carrot'];
let da_chuyen_cum = false; 
let da_gui_warp = false; // Biến khóa chống spam lệnh warp
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
        viewDistance: 'normal',
        physicsEnabled: true
    });

    bot.on('login', () => { 
        console.log('[+] Da mo cong ket noi socket thanh cong!'); 
    });

    // Xử lý dịch chuyển đổi cụm - Có khóa chống spam
    bot.on('forcedMove', () => {
        if (da_chuyen_cum && !da_gui_warp) {
            da_gui_warp = true; // Khóa ngay lập tức để chặn các sự kiện lặp lại sau đó
            console.log('[+] He thong phat hien doi cum! Dang doi 6 giay de go lenh AFK...');
            
            setTimeout(() => {
                bot.chat('/warp afk'); 
                console.log('[+] Da gui lenh di chuyen khu AFK: /warp afk. Hoan tat!');
                
                // Vòng lặp kiểm tra đói để tự ăn
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

                // Vòng lặp nhảy chống kick AFK
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
        
        console.log('[+] Nhan vat xuat hien tai sanh cho chinh.'); 
        setTimeout(() => { 
            if (!bot) return;
            bot.chat('/login ' + ACCOUNT.password); 
            console.log('[>] Da go lenh dang nhap.');
            
            setTimeout(() => { 
                if (da_chuyen_cum || !bot) return; 
                bot.chat('/menu'); 
                console.log('[>] Da go lenh mo menu.');
            }, 5000); 
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
        console.log('[-] Bot bi mat ket noi (' + reason + '). Tu dong dang nhap lai sau 15 giay...'); 
        if (checkEatInterval) clearInterval(checkEatInterval);
        setTimeout(() => startBot(), 15000); 
    });

    bot.on('error', (err) => { 
        console.log('[Loi he thong]:', err.message); 
    });
}

startBot();
