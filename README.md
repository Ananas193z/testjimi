ДЛЯ РАБОТЫ БОТА ПРИВАТКИ НУЖЕН ПИТОН 3.9
НА других версия приватка работать не будет




Есть папка privat_shit_dao_bot
    У не файл main.py - ЕГО НУЖНО ЗАПУСКАТЬ
        admins_ids = [1477094350, 1343852948] - айди админов
        GROUP_IDS = [-1002153392470] - айди приваток или груп
        pricanapodpisku = 50 - цена подписки - 
        sietidlaoplaty = 'USDT, USDC, SOL' -сети для коша
        adressdlaoplaty = 'GJ84J7NjPJFtiHPcghq35feMVhF6xosuoFexBwQMBkSd' - кош для оплаты
        managerusername = '@JimmyDeathless' - тг менеджера


Есть папка dca_and_limit
    У лимитки файлы:

        main.js - Здесть все фильтра лимитки и рпц

            const connection = new Connection('RCP_URL', 'confirmed');
            const programId = "programadres";

            const FILTERPRICE = 10000; - фильр цены в баксах
            const PRCENTFILTER = 40; - фильр по процентам потенциал чендж
            const MARCETCUPFILTER = 3000; - филтр по маркет капе

        tracker.js
        chaker.js

        tgbot.js - Здесь токены бота и чат айди ветки
            const token = 'TOKENAPITELEGRAM'; - токен бота для лимиток
            const chatId = 'CHATIDFORMESSEGES' - чат\канал\группа для сообзений бота





    У дца файлы:

        maindca.js - Здесть все фильтра дца и рцп

            const connection = new Connection('RCP_URL', 'confirmed');
            const programId = "programadres";
            const FILTERPRICE = 10000; - фильр цены в баксах

        dca.js
        dcat.js

        dcatgbot.js - Здесь токены бота и чат айди ветки
            const token = 'TOKENAPITELEGRAM'; - токен бота для дца
            const chatId = 'CHATIDFORMESSEGES' - чат\канал\группа для сообзений бота




    Общие файлы:
        getTokenPriceByPoolKK.js
        mainallbots.js - ЭТО НУЖНО ЗАПУСКАТЬ
