const { getProgramIdl } = require("@solanafm/explorer-kit-idls");
const { SolanaFMParser, ParserType, checkIfInstructionParser } = require("@solanafm/explorer-kit");
const { Connection, clusterApiUrl } = require("@solana/web3.js");
const { PublicKey } = require('@solana/web3.js'); // Импортируем для работы с PublicKey
const axios = require('axios');
const Moralis = require("moralis").default;
const { SolNetwork } = require("@moralisweb3/common-sol-utils");
const sqlite3 = require('sqlite3').verbose();
const { sendAndUpdateMessage } = require('./dcatgbot.js');


const db = new sqlite3.Database('./dcausers.db', (err) => {
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
      status TEXT NOT NULL, -- Статус (строка: "да", "нет", "почти" и т.д.)
      content TEXT
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
const programId = "DCA265Vj8a9CEuX1eb1LWRnDT7uK6q1xMipnNyatn23M";
const test = 'DCA';
let rawdatafromsignature;
let mintfrom;
let mintto;
const FILTERPRICE = 10000;
let inAmountinUSDT;
let priceoftoken;
let takingamamam;
let makingamama;
let symf;
let timestampoffinish
let symt;



async function getTransactionTimestamp(signature) {
    const transaction = await connection.getTransaction(signature, { 
            commitment: "confirmed", 
            maxSupportedTransactionVersion: 0 
        });
    if (!transaction || !transaction.blockTime) {
        throw new Error('Transaction or blockTime not found');
    }
    const blockTime = transaction.blockTime; 
    const date = new Date(blockTime * 1000); 
    return date.toUTCString(); 
}




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
        //console.log('Fetching transaction details...');
        const transaction = await connection.getTransaction(signature, { 
            commitment: "confirmed", 
            maxSupportedTransactionVersion: 0 
        });
        return transaction ? transaction.meta : null;
    } catch (error) {
        console.error("Ошибка получения деталей транзакции:", error);
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

function getUsersFromDB() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('./dcausers.db');
        db.all('SELECT * FROM users', [], (err, rows) => {
            if (err) {
                reject(err); 
            } else {
                resolve(rows); 
            }
        });
        db.close();
    });
}





async function dcatrackWalletTransactionsChaler() {
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
                        //console.log(signature)
                        //console.log('Owner',txDetails.postTokenBalances[0].owner)

                        if (txDetails && txDetails.logMessages && txDetails.logMessages[3]) {
                            const detailsInSig = txDetails.logMessages[3]; 
                            
                            if (detailsInSig.includes('EndAndClose')) {
                                console.log('EndAndClose  ',signature)
                                const transaction = await getTransactionDetails(signature);
                                console.log('Owner',transaction.postTokenBalances[0].owner)
                                //console.log('CA CancelOrder ')

                                try {
                                    const users = await getUsersFromDB(); 

                                    for (let user of users) {
                                        if (user.singerwallet == transaction.postTokenBalances[0].owner) {
                                            const timestampoffinish = await getTransactionTimestamp(signature);

                                            await sendAndUpdateMessage(user.singerwallet, user.message_id, timestampoffinish, 1);
                                        }
                                    }
                                } catch (err) {
                                    console.error('Ошибка при чтении из базы данных:', err.message);
                                }



                                
                            }else if (detailsInSig.includes('CloseDca')){
                                const transaction = await getTransactionDetails(signature);
                                console.log('CloseDca  ',signature)
                                console.log('Owner',transaction.postTokenBalances[0].owner)

                                try {
                                    const users = await getUsersFromDB();

                                    for (let user of users) {
                                        if (user.singerwallet == transaction.postTokenBalances[0].owner) {
                                            const timestampoffinish = await getTransactionTimestamp(signature);

                                            await sendAndUpdateMessage(user.singerwallet, user.message_id, timestampoffinish, 0);
                                        }
                                    }
                                } catch (err) {
                                    console.error('Ошибка при чтении из базы данных:', err.message);
                                }
                            }
                        }
                    }else{

                    }
                }

                lastSignature = transactions[0].signature;
            } else {
                console.log("Нет новых транзакций.");
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            

        } catch (error) {
            console.error("Ошибка при отслеживании транзакций:", error);
        }
    }
}


module.exports = { dcatrackWalletTransactionsChaler };