const { getProgramIdl } = require("@solanafm/explorer-kit-idls");
const { SolanaFMParser, ParserType, checkIfInstructionParser } = require("@solanafm/explorer-kit");
const { Connection, clusterApiUrl } = require("@solana/web3.js");
const { PublicKey } = require('@solana/web3.js'); // Импортируем для работы с PublicKey
const axios = require('axios');
const Moralis = require("moralis").default;
const { SolNetwork } = require("@moralisweb3/common-sol-utils");
const sqlite3 = require('sqlite3').verbose();
const { sendAndRemoveMessage } = require('./tgbot.js');


const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.message);
  } else {
    console.log('Подключение к базе данных успешно');
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      singerwallet TEXT NOT NULL, -- Кошелек пользователя (строка)
      message_id INTEGER NOT NULL, -- ID сообщения (число)
      status TEXT NOT NULL -- Статус (строка: "да", "нет", "почти" и т.д.)
    )
  `, (err) => {
    if (err) {
      console.error('Ошибка при создании таблицы:', err.message);
    } else {
      console.log('Таблица создана успешно');
    }
  });
});


const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=a329a7d4-0fb2-478b-9289-970b1632e80f', 'confirmed');
const programId = "j1o2qRpjcyUwEvwtcfhEQefh773ZgjxcVRry7LDqg5X";
const test = 'LIMIT';
let rawdatafromsignature;
let mintfrom;
let mintto;
const FILTERPRICE = 10000;
let inAmountinUSDT;
let priceoftoken;
let takingamamam;
let makingamama;
let symf;
let symt;








async function getTransactionsForWallet(walletAddress, after = null) {
    try {
        const options = { limit: 100 };
        if (after) {
            options.after = after;
        }
        const signatures = await connection.getSignaturesForAddress(new PublicKey(walletAddress), options);
        return signatures; 
    } catch (error) {
        console.error("Ошибка при получении транзакций:", error);
        return [];
    }
}


async function getTransactionDetails(signature) {
    try {
        const transaction = await connection.getTransaction(signature);
        return transaction ? transaction.meta : null;
    } catch (error) {
        //console.error("Ошибка получения деталей транзакции:", error);
        return null;
    }
}

async function getTransactionBySignature(signature) {
    try {
        const transaction = await connection.getTransaction(signature, { commitment: "confirmed" });
        return transaction;
    } catch (error) {
        console.error("Ошибка получения транзакции:", error);
        return null;
    }
}





async function trackWalletTransactionsChaler() {
    let lastSignature = null;
    //console.log(`Отслеживаем транзакции для адреса: ${programId}`);
    
    while (true) {
        try {
            const transactions = await getTransactionsForWallet(programId, lastSignature);
            
            if (transactions.length > 0) {
                for (let tx of transactions.reverse()) {  
                    const signature = tx.signature;
                    const txDetails = await getTransactionDetails(signature);
                    if (signature!=lastSignature){

                        if (txDetails && txDetails.logMessages && txDetails.logMessages[5]) {
                            const detailsInSig = txDetails.logMessages[5];  
                            if (detailsInSig.includes('CancelOrder')) {
                                const transaction = await getTransactionBySignature(signature);
                                //console.log('CA CancelOrder ')

                                const sqlite3 = require('sqlite3').verbose();
    							const db = new sqlite3.Database('./users.db');

    							db.all('SELECT * FROM users', [], (err, rows) => {
    							  if (err) {
    							    //console.error('Ошибка при чтении данных:', err.message);
    							    return;  
    							  }

    							  for (let i = 0; i < rows.length; i++) {
    							    //console.log(rows[i].singerwallet);
    							    if (rows[i].singerwallet == transaction.transaction.message.accountKeys[0].toString()){

    							    	sendAndRemoveMessage(rows[i].singerwallet, rows[i].message_id,)


    							    }
    							  }
    							});

    							db.close();



                                
                            }
                        }
                    }else{
                        console.log('ARORO')

                    }
                }
                lastSignature = transactions[0].signature;

            }else{
                console.log("Нет новых транзакций.");
                await new Promise(resolve => setTimeout(resolve, 50));

            }
            

        } catch (error) {
            console.error("Ошибка при отслеживании транзакций:", error);
        }
    }
}


module.exports = { trackWalletTransactionsChaler };