const { getProgramIdl } = require("@solanafm/explorer-kit-idls");
const { SolanaFMParser, ParserType, checkIfInstructionParser } = require("@solanafm/explorer-kit");
const { Connection, clusterApiUrl } = require("@solana/web3.js");
const { PublicKey } = require('@solana/web3.js');
const axios = require('axios');
const Moralis = require("moralis").default;
const { SolNetwork } = require("@moralisweb3/common-sol-utils");
const sqlite3 = require('sqlite3').verbose();
const { getTokenPricebyPools } = require('./getTokenPriceByPoolKK.js');
const { sendAndStoreMessage } = require('./tgbot.js');

const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.message);
  } else {
    //console.log('Подключение к базе данных успешно');
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
      //console.log('Таблица создана успешно');
    }
  });
});



const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=a329a7d4-0fb2-478b-9289-970b1632e80f', 'confirmed');
const programId = "j1o2qRpjcyUwEvwtcfhEQefh773ZgjxcVRry7LDqg5X";
const test = 'LIMIT';
let rawdatafromsignature;
let mintfrom = null;
let mintto = null;
let decimalfrom;
let decimalto;
const FILTERPRICE = 10000;
const PRCENTFILTER = 40;
const MARCETCUPFILTER = 3000;
let inAmountinUSDT;
let priceoftoken;
let takingamamam;
let makingamama;
let tafornow;
let cuptafornow;
let prcentaofchacge;
let cakontract;
let noforeverprcent;
let takingamamaminusd;
let priceoftaking;
let symf;
let symt;
let outAmountinUSDT;
let marcetcupnow;
let marcetcupfuture;





const knownTokens = {
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
    'So11111111111111111111111111111111111111112': 'WSOL',
};

async function getTokenSymbolByMint(mint) {
    ////console.log('start')
    if (mint=='Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB') {
        return 'USDT';
    }else if (mint=='EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') {
        return 'USDC';
    }else if (mint=='So11111111111111111111111111111111111111112') {
        return 'WSOL';
    }else if (mint=='USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA') {
        return 'USDS';
    }else{
        ////console.log('else')
        let symbol = await getTokenSymbolByGeco(mint);
        if (!symbol) {
            symbol = await getTokenSymbol(mint);
        }
        return symbol;
    }
}


async function getTokenSymbol(mintAddress) {
  try {
    const response = await fetch('https://mainnet.helius-rpc.com/?api-key=a329a7d4-0fb2-478b-9289-970b1632e80f', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "jsonrpc": "2.0",
            "id": "text",
            "method": "getAsset",
            "params": { id: mintAddress}
        }),
    });
    const data = await response.json();
    //console.log(`name = ${data.result.content.metadata.name}`);
    //console.log(`symbol = ${data.result.content.metadata.symbol}`);
    const symbol = data.result.content.metadata.symbol
    return symbol
  } catch (error) {
    //console.error('Ошибка при получении данных токена:', error);
    return null
  }
}

async function getTokenSymbolByGeco(mintAddress) {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/solana/contract/${mintAddress}`);

    if (response.data) {
        //const tokenName = response.data.name;  
        const tokenSymbol = response.data.symbol;  
        return tokenSymbol.toUpperCase()
    }
  } catch (error) {
    //console.error('Ошибка при получении данных токена:', error);
    return null
  }
}
async function getTokenPriceByGeco(mintAddress) {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/solana/contract/${mintAddress}`);

    if (response.data) {
        //const tokenName = response.data.name;  
        const tokenPrice = response.data.market_data.current_price.usd; 
        return tokenPrice
    }else{
        return null
    }
  } catch (error) {
    //console.error('Ошибка при получении данных токена:', error);
    return null
  }
}

async function getTokenPriceByMintAddress(mintAddress) {
  try {
    
    await Moralis.start({
        apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjIwY2I4MWY5LWE3YjMtNDQzMS04NTdjLWY4Yzk2YzRkZTQwNSIsIm9yZ0lkIjoiNDE4MjM4IiwidXNlcklkIjoiNDMwMTA1IiwidHlwZUlkIjoiMTI0OWNlNzQtZTA0Yi00ZGJmLWJiZDYtMmYwZjhiY2NlNjNlIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MzI2NTMzMjgsImV4cCI6NDg4ODQxMzMyOH0.20vLCfZ2fYs_lGNOWxVu4ClV1OmFvohVzlFNJajiPbQ",
    });

    const network = SolNetwork.MAINNET; 

    
    const response = await Moralis.SolApi.token.getTokenPrice({
      address: mintAddress,
      network,
    });

    
    const usdPrice = response.toJSON().usdPrice;
    return usdPrice;
  } catch (error) {
    console.error("Error fetching token price:");
    return null;
  }
}



async function getBinanceSolUsdtPriceBinance() {
  try {
    const response = await axios.get("https://api.binance.com/api/v3/ticker/price", {
      params: {
        symbol: "SOLUSDT", 
      },
    });
    return parseFloat(response.data.price); 
  } catch (error) {
    console.error("Ошибка при получении цены с Binance:");
    return null
  }
}


async function getMarcetCup(mintAddress){
    try{
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`, {
        method: 'GET',
        headers: {},
    });
    const data = await response.json();
    //console.log(data.pairs[0])

    return data.pairs[0].marketCap/1000000
    }catch{
        return null
    }
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






async function trackWalletTransactions() {
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

                            
                            if (detailsInSig.includes('InitializeOrder')) {
                                console.log('InitializeOrder в логах транзакции', signature);
                                mintfrom = null
                                mintto = null

                                
                                const transaction = await getTransactionBySignature(signature);
                                


                                if (transaction) {
                                    ////console.log("Данные транзакции:", transaction);
                                    for (let i = 0; i < transaction.transaction.message.instructions.length; i++) {
                                        
                                        if (transaction.transaction.message.instructions[i].data.length > 20) {
                                            rawdatafromsignature = transaction.transaction.message.instructions[i].data
                                            break; // Прерывание цикла
                                        }
                                    }
                                } else {
                                    //console.log("Транзакция не найдена.");
                                    return;
                                }

                                
                                

                                const SFMIdlItem = await getProgramIdl(programId);

                                if (SFMIdlItem) {
                                    const parser = new SolanaFMParser(SFMIdlItem, programId);
                                    const instructionParser = parser.createParser(ParserType.INSTRUCTION);

                                    if (instructionParser && checkIfInstructionParser(instructionParser)) {
                                        const ixData = rawdatafromsignature;
                                        const decodedData = instructionParser.parseInstructions(ixData);
                                        //console.log(decodedData['data']['params']['makingAmount']);
                                        //console.log(decodedData['data']['params']['takingAmount']);

                                        for (let i = 0; i < transaction.meta.preTokenBalances.length; i++) {
                                            ////console.log(transaction.meta.preTokenBalances[i].uiTokenAmount.amount)
                                            if ((transaction.meta.preTokenBalances[i].uiTokenAmount.amount >= (decodedData['data']['params']['makingAmount'] - decodedData['data']['params']['makingAmount'] * 0.1)) &&(transaction.meta.preTokenBalances[i].uiTokenAmount.amount < (Number(decodedData['data']['params']['makingAmount']) + Number(decodedData['data']['params']['makingAmount']) * 0.1))) {
                                                //console.log('1')
                                                //console.log(decodedData['data']['params']['makingAmount'])
                                                //console.log(decodedData['data']['params']['makingAmount'] - decodedData['data']['params']['makingAmount'] * 0.1)
                                                //console.log(Number(decodedData['data']['params']['makingAmount']) + Number(decodedData['data']['params']['makingAmount']) * 0.1)
                                                mintfrom = transaction.meta.preTokenBalances[i].mint;
                                                decimalfrom = transaction.meta.preTokenBalances[i].uiTokenAmount.decimals
                                                //console.log(mintfrom)
                                                try{
                                                    mintto = transaction.meta.preTokenBalances[i-1].mint;
                                                    decimalto = transaction.meta.preTokenBalances[i-1].uiTokenAmount.decimals
                                                    if (mintfrom==mintto){
                                                        mintto = null
                                                        //console.log('equals1')
                                                        
                                                    }
                                                }catch{
                                                    try{
                                                        mintto = transaction.meta.preTokenBalances[i+1].mint;
                                                        decimalto = transaction.meta.preTokenBalances[i+1].uiTokenAmount.decimals
                                                        if (mintfrom==mintto){
                                                            mintto = null
                                                            //console.log('equals2')
                                                            
                                                        }
                                                    }
                                                    catch{
                                                        //console.log('NEMOHU')
                                                    }
                                                }
                                                //console.log(mintto)
                                                if (mintfrom==mintto){
                                                    //console.log('equals3')
                                                    mintfrom = null
                                                    mintto = null
                                                }
                                                
                                            }
                                        }
                                        //console.log(mintfrom, mintto)
                                        if (!mintfrom || !mintto){
                                            //console.log("JJJJJJJJ")
                                            for (let i = 0; i < transaction.meta.postTokenBalances.length; i++) {
                                                //console.log(i)
                                                // Проверка длины данных
                                                //console.log(transaction.meta.postTokenBalances[i].uiTokenAmount.amount)
                                                if ((transaction.meta.postTokenBalances[i].uiTokenAmount.amount >= (decodedData['data']['params']['makingAmount'] - decodedData['data']['params']['makingAmount'] * 0.1)) &&(transaction.meta.postTokenBalances[i].uiTokenAmount.amount < (Number(decodedData['data']['params']['makingAmount']) + Number(decodedData['data']['params']['makingAmount']) * 0.1))) {
                                                    //console.log('HSFDNDSKFNKDSKDSDS')
                                                    //console.log(`1: ${i}`)
                                                    //console.log(decodedData['data']['params']['makingAmount'])
                                                    //console.log(decodedData['data']['params']['makingAmount'] - decodedData['data']['params']['makingAmount'] * 0.1)
                                                    //console.log(Number(decodedData['data']['params']['makingAmount']) + Number(decodedData['data']['params']['makingAmount']) * 0.1)
                                                    mintfrom = transaction.meta.postTokenBalances[i].mint;
                                                    decimalfrom = transaction.meta.postTokenBalances[i].uiTokenAmount.decimals
                                                    //console.log(mintfrom)
                                                    try{
                                                        mintto = transaction.meta.postTokenBalances[i-1].mint;
                                                        decimalto = transaction.meta.postTokenBalances[i-1].uiTokenAmount.decimals
                                                        if (mintfrom==mintto){
                                                            try{
                                                                mintto = transaction.meta.postTokenBalances[i-2].mint;
                                                                decimalto = transaction.meta.postTokenBalances[i-2].uiTokenAmount.decimals
                                                            }catch{
                                                                mintto=null
                                                            }
                                                            
                                                        }
                                                    }catch{
                                                        try{
                                                            mintto = transaction.meta.postTokenBalances[i+1].mint;
                                                            decimalto = transaction.meta.postTokenBalances[i+1].uiTokenAmount.decimals
                                                            if (mintfrom==mintto){
                                                                try{
                                                                    mintto = transaction.meta.postTokenBalances[i+2].mint;
                                                                    decimalto = transaction.meta.postTokenBalances[i+2].uiTokenAmount.decimals
                                                                }catch{
                                                                    mintto=null
                                                                }
                                                                
                                                            }
                                                        }
                                                        catch{
                                                            //console.log('NEMOHU')
                                                        }
                                                    }
                                                    //console.log(mintto)
                                                    if (mintfrom && mintto){
                                                        break
                                                    }
                                                    
                                                    
                                                }
                                            }
                                        }
                                        

                                        if ((mintfrom=='EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' || mintfrom=='Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' || mintfrom=='So11111111111111111111111111111111111111112' || mintfrom=='USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA' || mintfrom=='9qriMjPPAJTMCtfQnz7Mo9BsV2jAWTr2ff7yc3JWpump') && (mintto=='EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' || mintto=='Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' || mintto=='So11111111111111111111111111111111111111112' || mintto=='USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA' || mintfrom=='9qriMjPPAJTMCtfQnz7Mo9BsV2jAWTr2ff7yc3JWpump')){
                                            //console.log('SKIP because sol usdc usdt in sol usdc usdt')
                                        }
                                        else{

                                            if (mintfrom=='EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' || mintfrom=='Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' || mintfrom=='USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA'){
                                                inAmountinUSDT = decodedData['data']['params']['makingAmount'] / 1000000
                                                priceoftoken = 1
                                            }
                                            else{
                                                if (mintfrom=='So11111111111111111111111111111111111111112'){
                                                    priceoftoken = await getBinanceSolUsdtPriceBinance()
                                                    inAmountinUSDT = decodedData['data']['params']['makingAmount'] / 1000000000 * priceoftoken

                                                }
                                                else{
                                                    if (mintfrom=='DiSetnR7k57wmfvywJhUVjPwWfg54SdQKxQdJEBYW23B' || mintfrom=='7i5XE77hnx1a6hjWgSuYwmqdmLoDJNTU1rYA6Gqx7QiE'){
                                                        //console.log('DNA GOVNOOOOOO')
                                                        inAmountinUSDT = 0
                                                    }else{
                                                        priceoftoken = await getTokenPricebyPools(mintfrom)
                                                        //console.log(priceoftoken, '$$$$$$$$')
                                                        if (!priceoftoken){
                                                            //console.log("repeatT")
                                                            priceoftoken = await getTokenPriceByGeco(mintfrom);
                                                            //console.log(priceoftoken)
                                                            if (!priceoftoken){
                                                                //console.log("KOKOT")
                                                                priceoftoken = getTokenPriceByMintAddress(mintfrom);
                                                            }
                                                        }
                                                        
                                                        inAmountinUSDT = priceoftoken*(decodedData['data']['params']['makingAmount'] / (10 ** decimalfrom))
                                                    }
                                                }
                            
                                            }
                                            //console.log(mintfrom)
                                            //console.log(mintto)

                                            
                                            ////console.log(priceoftoken)
                                            ////console.log((decodedData['data']['params']['makingAmount'] / 1000000))

                                            
                                            console.log('############')
                                            console.log(inAmountinUSDT)

                                            if (inAmountinUSDT >= FILTERPRICE && priceoftoken >= 0.000001){
                                                console.log('GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG')
                                                //console.log('InitializeOrder в логах транзакции', signature);


                                                ////console.log(decodedData);
                                                if (test == 'DCA') {
                                                    //console.log('inAmount: ', decodedData['data']['inAmount'] / 1000000000);
                                                    //console.log('inAmountPerCycle: ', decodedData['data']['inAmountPerCycle'] / 1000000000);
                                                    //console.log('Per: ', decodedData['data']['cycleFrequency'], 'sec (', decodedData['data']['cycleFrequency'] / 60, 'min )');
                                                }
                                                else if (test == 'LIMIT') {

                                                    symf = await getTokenSymbolByMint(mintfrom);
                                                    symt = await getTokenSymbolByMint(mintto);
                                                
                                                    
                                                    //console.log(decodedData['data']['params']['makingAmount']);
                                                    //console.log(decodedData['data']['params']['makingAmount'] - decodedData['data']['params']['makingAmount'] * 0.1)
                                                    
                                                    //console.log('CA: ', transaction.transaction.message.accountKeys[0].toString());
                                                    //console.log('FROM: ', mintfrom);
                                                    //console.log('TO: ', mintto)
                                                    /*

                                                    if (mintfrom=='EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' || mintfrom=='Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'){
                                                        //console.log('asdf')
                                                        if (mintfrom=='So11111111111111111111111111111111111111112'){
                                                            makingamama = decodedData['data']['params']['takingAmount'] / 1000000000
                                                            takingamamam = decodedData['data']['params']['takingAmount'] / 1000000000
                                                        }else{
                                                            makingamama = decodedData['data']['params']['takingAmount'] / 1000000
                                                            takingamamam = decodedData['data']['params']['takingAmount'] / 1000000000
                                                        }
                                                    }
                                                    else{
                                                        if (mintto=='EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' || mintto=='Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'){
                                                            if (mintto=='So11111111111111111111111111111111111111112'){
                                                                takingamamam = decodedData['data']['params']['takingAmount'] / 1000000000
                                                                makingamama = decodedData['data']['params']['takingAmount'] / 1000000000
                                                            }else{
                                                                takingamamam = decodedData['data']['params']['takingAmount'] / 1000000
                                                                makingamama = decodedData['data']['params']['takingAmount'] / 1000000000
                                                            }
                                                        }
                                                        else{
                                                            makingamama = decodedData['data']['params']['makingAmount'] / 1000000000
                                                            takingamamam = decodedData['data']['params']['takingAmount'] / 1000000000
                                                        }
                                                    }
                                                    */
                                                    makingamama = decodedData['data']['params']['makingAmount'] / 10 ** decimalfrom
                                                    takingamamam = decodedData['data']['params']['takingAmount'] / 10 ** decimalto

                                                    
                                                    if (mintto=='EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' || mintto=='Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' || mintto=='USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA'){
                                                        marcetcupnow = await getMarcetCup(mintfrom)
                                                        tafornow = inAmountinUSDT
                                                        cuptafornow = takingamamam / priceoftoken
                                                        marcetcupfuture = Number(marcetcupnow)*Number(cuptafornow)/Number(makingamama)
                                                        noforeverprcent = takingamamam * 100 / inAmountinUSDT
                                                        if (noforeverprcent>100){
                                                            prcentaofchacge = `${(noforeverprcent - 100).toFixed(2)}`
                                                        }else if (noforeverprcent<100){
                                                            prcentaofchacge = `${(100 - Number(noforeverprcent)).toFixed(2)}`
                                                        }
                                                        else{
                                                            prcentaofchacge = `$0%`
                                                        }
                                                        cakontract = mintfrom
                                                        //console.log('usd', cuptafornow)
                                                    }else if (mintfrom=='EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' || mintfrom=='Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' || mintfrom=='USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA'){
                                                        //console.log('else')
                                                        priceoftaking = await getTokenPricebyPools(mintto)
                                                        //console.log(priceoftaking, '$$$$$$$$')
                                                        if (!priceoftaking){
                                                            //console.log("repeatT")
                                                            priceoftaking = await getTokenPriceByGeco(mintto);
                                                            //console.log(priceoftaking)
                                                            if (!priceoftaking){
                                                                //console.log("KOKOT")
                                                                priceoftaking = getTokenPriceByMintAddress(mintto);
                                                            }
                                                        }

                                                        marcetcupnow = await getMarcetCup(mintto)
                                                        takingamamaminusd = priceoftaking*takingamamam
                                                        tafornow = takingamamam * inAmountinUSDT / takingamamaminusd
                                                        marcetcupfuture = Number(marcetcupnow)*Number(takingamamam)/Number(tafornow)
                                                        noforeverprcent = takingamamam * 100 / tafornow
                                                        if (noforeverprcent>100){
                                                            prcentaofchacge = `${(noforeverprcent - 100).toFixed(2)}`
                                                        }else if (noforeverprcent<100){
                                                            prcentaofchacge = `${(100 - Number(noforeverprcent)).toFixed(2)}`
                                                        }
                                                        else{
                                                            prcentaofchacge = `$0%`
                                                        }
                                                        cakontract = mintto
                                                        //console.log(decimalfrom)
                                                        //console.log(prcentaofchacge)
                                                        
                                                    }else{
                                                        //console.log('else else elsee')
                                                        priceoftaking = await getTokenPricebyPools(mintto)
                                                        //console.log(priceoftaking, '$$$$$$$$')
                                                        if (!priceoftaking){
                                                            //console.log("repeatT")
                                                            priceoftaking = await getTokenPriceByGeco(mintto);
                                                            //console.log(priceoftaking)
                                                            if (!priceoftaking){
                                                                //console.log("KOKOT")
                                                                priceoftaking = getTokenPriceByMintAddress(mintto);
                                                            }
                                                        }

                                                        marcetcupnow = await getMarcetCup(mintto)
                                                        if (mintto=='So11111111111111111111111111111111111111112'){
                                                            const blasol = await getBinanceSolUsdtPriceBinance()
                                                            tafornow = makingamama * priceoftaking / blasol
                                                        }else{
                                                            takingamamaminusd = priceoftaking*takingamamam
                                                            tafornow = takingamamam * inAmountinUSDT / takingamamaminusd
                                                        }
                                                        marcetcupfuture = Number(marcetcupnow)*Number(takingamamam)/Number(tafornow)
                                                        noforeverprcent = takingamamam * 100 / tafornow
                                                        if (noforeverprcent>100){
                                                            prcentaofchacge = `${(noforeverprcent - 100).toFixed(2)}`
                                                        }else if (noforeverprcent<100){
                                                            prcentaofchacge = `${(100 - Number(noforeverprcent)).toFixed(2)}`
                                                        }
                                                        else{
                                                            prcentaofchacge = `$0%`
                                                        }
                                                        cakontract = mintto
                                                        //console.log(decimalfrom)
                                                        //console.log(prcentaofchacge)
                                                    }

                                                    




                                                    

                                                    //console.log('DEPOSIT: ', makingamama);
                                                    //console.log('TA: ', takingamamam);

                                                    let limitbalancemassege = ''
                                                    if (symf == 'USDC' || symf == 'USDT'|| symf == 'USDS'){
                                                        limitbalancemassege = `$${(inAmountinUSDT.toFixed(2) * 1).toLocaleString('en-US')}`
                                                    }else{
                                                        limitbalancemassege = `$${(inAmountinUSDT.toFixed(2) * 1).toLocaleString('en-US')} / ${(makingamama.toFixed(2) * 1).toLocaleString('en-US')}${symf}`
                                                    }
                                                    
                                                    const truncatedAddress = transaction.transaction.message.accountKeys[0].toString().slice(0, 18) + '...';
                                                    const message = `<b>🟩 <a href="https://solscan.io/account/${transaction.transaction.message.accountKeys[0].toString()}">${truncatedAddress}</a> made a <a href="https://solscan.io/tx/${signature}">new limit order</a></b>
                                                    \n<b><a href="https://photon-sol.tinyastro.io/en/lp/${mintfrom}">${symf}</a>➡️<a href="https://photon-sol.tinyastro.io/en/lp/${mintto}">${symt}</a></b>
                                                    \n<b>🏦 Limit Balance: ${limitbalancemassege}</b>
                                                    \n<b>📈 Taking Amount: ${(takingamamam.toFixed(2) * 1).toLocaleString('en-US')}${symt}</b>\n<b>🙊 Potencial change: (+${prcentaofchacge}%)</b>\n<b>🥸 TA for Now: ${(tafornow.toFixed(2) * 1).toLocaleString('en-US')}${symt}</b>

                                                    \n<b>🧢 Market Cap: ${marcetcupnow.toFixed(2)}M</b>\n<b>☝️ Buy Up To: ~${marcetcupfuture.toFixed(2)}M</b>
                                                    \n<b>CA: </b><code>${cakontract}</code>

                                                    `;
                                                    
                                                    //if ((prcentaofchacge <= PRCENTFILTER) &&(marcetcupnow <= MARCETCUPFILTER)){
                                                    await sendAndStoreMessage(transaction.transaction.message.accountKeys[0].toString(), message)
                                                    //}else{
                                                    //    console.log('Скип ибо не подошло')
                                                    //}
                                                    
                                                    
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    //console.log("IDL для указанной программы не найден.");
                                }
                            }
                        }
                    }else{
                        //console.log('повторка')


                    }
                }

                lastSignature = transactions[0].signature;
                ////console.log('JKKKKKKKKKKKKKKLLLLLLLLLLL', lastSignature)
            } else {
                //console.log("Нет новых транзакций.");
                await new Promise(resolve => setTimeout(resolve, 50));

            }
            
            

        } catch (error) {
            console.error("Ошибка при отслеживании транзакций:", error);
        }
    }
}





module.exports = { trackWalletTransactions };
