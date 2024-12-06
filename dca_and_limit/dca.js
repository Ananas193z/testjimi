const { getProgramIdl } = require("@solanafm/explorer-kit-idls");
const { SolanaFMParser, ParserType, checkIfInstructionParser } = require("@solanafm/explorer-kit");
const { Connection, clusterApiUrl } = require("@solana/web3.js");
const { PublicKey } = require('@solana/web3.js');
const axios = require('axios');
const Moralis = require("moralis").default;
const { SolNetwork } = require("@moralisweb3/common-sol-utils");
const sqlite3 = require('sqlite3').verbose();
const { getTokenPricebyPools } = require('./getTokenPriceByPoolKK.js');
const { sendAndStoreMessage } = require('./dcatgbot.js');

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
let mintfrom = null;
let mintto = null;
let decimalfrom;
let decimalto;
const FILTERPRICE = 10000;
const threadId = '140504';
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
let liquiditynow;
let holders;
let vol24h;
let potencialchange;
let massegeforminmax;
let secondliqui;
let etadca;
let marcetcupfuture;
let percycle;
let frequenciia;
let causer;
let zaholovok;
let dexscreeen;
let creatingdate
let perdaliaj;
let dcawalletasiarono;
let amountformes;





const knownTokens = {
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
    'So11111111111111111111111111111111111111112': 'WSOL',
};

async function getTokenSymbolByMint(mint) {
    console.log('start')
    if (mint=='Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB') {
        return 'USDT';
    }else if (mint=='EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') {
        console.log('gooo')
        return 'USDC';
    }else if (mint=='So11111111111111111111111111111111111111112') {
        return 'WSOL';
    }else{
        console.log('else')
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
    console.log(`name = ${data.result.content.metadata.name}`);
    console.log(`symbol = ${data.result.content.metadata.symbol}`);
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
    console.log(data.pairs[0])

    return data.pairs[0].marketCap/1000000
    }catch{
        return null
    }
}

async function getLiquiditi(mintAddress){
    try{
    const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/{tokenAddresses}', {
        method: 'GET',
        headers: {},
    });
    const data = await response.json();
    console.log(data.pairs[0].liquidity)

    return data.pairs[0].liquidity/1000000
    }catch{
        return null
    }

}

async function getDexScreen(mintAddress){
    try{
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`, {
        method: 'GET',
        headers: {},
    });
    const data = await response.json();
    //console.log(data)

    return data
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





async function dcatrackWalletTransactions() {
    let lastSignature = null;
    console.log(`Отслеживаем транзакции для адреса: ${programId}`);
    
    while (true) {
        try {
            const transactions = await getTransactionsForWallet(programId, lastSignature);
            //console.log(transactions)
            
            if (transactions.length > 0) {
                for (let tx of transactions.reverse()) {  
                    const signature = tx.signature;
                    const txDetails = await getTransactionDetails(signature);

                    if (signature!=lastSignature){
                        

                        if (txDetails && txDetails.logMessages && txDetails.logMessages[28]) {
                            const detailsInSig = txDetails.logMessages[28];  

                            
                            if (detailsInSig.includes('OpenDcaV2')) {
                                console.log('InitializeOrder в логах транзакции', signature);
                                mintfrom = null
                                mintto = null

                                
                                const transaction = await getTransactionBySignature(signature);
                                


                                if (transaction) {
                                    //console.log("Данные транзакции:", transaction);
                                    for (let i = 0; i < transaction.transaction.message.instructions.length; i++) {
                                        if (transaction.transaction.message.instructions[i].data.length > 20) {
                                            rawdatafromsignature = transaction.transaction.message.instructions[i].data
                                            break;
                                        }
                                    }
                                } else {
                                    console.log("Транзакция не найдена.");
                                    return;
                                }

                                
                                

                                const SFMIdlItem = await getProgramIdl(programId);

                                if (SFMIdlItem) {
                                    const parser = new SolanaFMParser(SFMIdlItem, programId);
                                    const instructionParser = parser.createParser(ParserType.INSTRUCTION);

                                    if (instructionParser && checkIfInstructionParser(instructionParser)) {
                                        const ixData = rawdatafromsignature;
                                        const decodedData = instructionParser.parseInstructions(ixData);
                                        console.log(decodedData);


                                        for (let i = 0; i < transaction.meta.preTokenBalances.length; i++) {
                                            //console.log(transaction.meta.preTokenBalances[i].uiTokenAmount.amount)
                                            if ((transaction.meta.preTokenBalances[i].uiTokenAmount.amount >= (decodedData['data']['inAmount'] - decodedData['data']['inAmount'] * 0.1)) &&(transaction.meta.preTokenBalances[i].uiTokenAmount.amount < (Number(decodedData['data']['inAmount']) + Number(decodedData['data']['inAmount']) * 0.1))) {
                                                console.log('1')
                                                console.log(decodedData['data']['inAmount'])
                                                console.log(decodedData['data']['inAmount'] - decodedData['data']['inAmount'] * 0.1)
                                                console.log(Number(decodedData['data']['inAmount']) + Number(decodedData['data']['inAmount']) * 0.1)
                                                mintfrom = transaction.meta.preTokenBalances[i].mint;
                                                decimalfrom = transaction.meta.preTokenBalances[i].uiTokenAmount.decimals
                                                dcawalletasiarono = transaction.meta.preTokenBalances[i].owner
                                                console.log(mintfrom)
                                                try{
                                                    mintto = transaction.meta.preTokenBalances[i-1].mint;
                                                    decimalto = transaction.meta.preTokenBalances[i-1].uiTokenAmount.decimals
                                                    if (mintfrom==mintto){
                                                        try{
                                                            mintto = transaction.meta.preTokenBalances[i-2].mint;
                                                            decimalto = transaction.meta.preTokenBalances[i-2].uiTokenAmount.decimals
                                                        }catch{
                                                            mintto=null
                                                        }
                                                        
                                                    }
                                                }catch{
                                                    try{
                                                        mintto = transaction.meta.preTokenBalances[i+1].mint;
                                                        decimalto = transaction.meta.preTokenBalances[i+1].uiTokenAmount.decimals
                                                        if (mintfrom==mintto){
                                                            try{
                                                                mintto = transaction.meta.preTokenBalances[i+2].mint;
                                                                decimalto = transaction.meta.preTokenBalances[i+2].uiTokenAmount.decimals
                                                            }catch{
                                                                mintto=null
                                                            }
                                                            
                                                        }
                                                    }
                                                    catch{
                                                        console.log('NEMOHU')
                                                    }
                                                }
                                                console.log(mintto)
                                                if (mintfrom==mintto){
                                                    console.log('equals3')
                                                    mintfrom = null
                                                    mintto = null
                                                }
                                                
                                            }
                                        }

                                        
                                        console.log("JJJJJJJJ")
                                        for (let i = 0; i < transaction.meta.postTokenBalances.length; i++) {
                                            console.log(i)
                                            console.log(transaction.meta.postTokenBalances[i].uiTokenAmount.amount)
                                            if ((transaction.meta.postTokenBalances[i].uiTokenAmount.amount >= (decodedData['data']['inAmount'] - decodedData['data']['inAmount'] * 0.1)) &&(transaction.meta.postTokenBalances[i].uiTokenAmount.amount < (Number(decodedData['data']['inAmount']) + Number(decodedData['data']['inAmount']) * 0.1))) {
                                                console.log('HSFDNDSKFNKDSKDSDS')
                                                console.log(`1: ${i}`)
                                                console.log(decodedData['data']['inAmount'])
                                                console.log(decodedData['data']['inAmount'] - decodedData['data']['inAmount'] * 0.1)
                                                console.log(Number(decodedData['data']['inAmount']) + Number(decodedData['data']['inAmount']) * 0.1)
                                                mintfrom = transaction.meta.postTokenBalances[i].mint;
                                                decimalfrom = transaction.meta.postTokenBalances[i].uiTokenAmount.decimals
                                                dcawalletasiarono = transaction.meta.postTokenBalances[i].owner

                                                console.log(mintfrom)
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
                                                        console.log('NEMOHU')
                                                    }
                                                }
                                                console.log(mintto)
                                                if (mintfrom && mintto){
                                                    break
                                                }
                                                
                                                
                                            }
                                        
                                        }
                                        console.log('JJKKKKKKKKKKKKKKKKKKKKKKKKKK')
                                        console.log(mintfrom)
                                        console.log(mintto)

                                        if ((mintfrom=='EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' || mintfrom=='Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' || mintfrom=='So11111111111111111111111111111111111111112' || mintfrom=='USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA' || mintfrom=='9qriMjPPAJTMCtfQnz7Mo9BsV2jAWTr2ff7yc3JWpump') && (mintto=='EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' || mintto=='Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' || mintto=='So11111111111111111111111111111111111111112' || mintto=='USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA' || mintfrom=='9qriMjPPAJTMCtfQnz7Mo9BsV2jAWTr2ff7yc3JWpump')){
                                            console.log('SKIP because sol usdc usdt in sol usdc usdt')
                                        }
                                        else{

                                            if (mintfrom=='EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' || mintfrom=='Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' || mintfrom=='USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA'){
                                                inAmountinUSDT = decodedData['data']['inAmount'] / 1000000
                                                priceoftoken = 1
                                            }
                                            else{
                                                if (mintfrom=='So11111111111111111111111111111111111111112'){
                                                    priceoftoken = await getBinanceSolUsdtPriceBinance()
                                                    inAmountinUSDT = decodedData['data']['inAmount'] / 1000000000 * priceoftoken

                                                }
                                                else{
                                                    if (mintfrom=='DiSetnR7k57wmfvywJhUVjPwWfg54SdQKxQdJEBYW23B' || mintfrom=='7i5XE77hnx1a6hjWgSuYwmqdmLoDJNTU1rYA6Gqx7QiE'){
                                                        console.log('DNA GOVNOOOOOO')
                                                        inAmountinUSDT = 0
                                                    }else{
                                                        priceoftoken = await getTokenPricebyPools(mintfrom)
                                                        console.log(priceoftoken, '$$$$$$$$')
                                                        if (!priceoftoken){
                                                            console.log("repeatT")
                                                            priceoftoken = await getTokenPriceByGeco(mintfrom);
                                                            console.log(priceoftoken)
                                                            if (!priceoftoken){
                                                                console.log("KOKOT")
                                                                priceoftoken = getTokenPriceByMintAddress(mintfrom);
                                                            }
                                                        }
                                                        
                                                        inAmountinUSDT = priceoftoken*(decodedData['data']['inAmount'] / (10 ** decimalfrom))
                                                    }
                                                }
                            
                                            }
                                            console.log(mintfrom)
                                            console.log(mintto)

                                            
                                            //console.log(priceoftoken)
                                            //console.log((decodedData['data']['inAmount'] / 1000000))

                                            
                                            console.log('############')
                                            console.log(inAmountinUSDT)

                                            if (inAmountinUSDT >= FILTERPRICE){
                                                console.log('GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG')
                                                console.log('InitializeOrder в логах транзакции', signature);


                                                //console.log(decodedData);

                                                if (test == 'DCввDCAA') {
                                                    symf = await getTokenSymbolByMint(mintfrom);
                                                    symt = await getTokenSymbolByMint(mintto);

                                                    makingamama = decodedData['data']['inAmount'] / 10 ** decimalfrom
                                                    percycle = decodedData['data']['inAmountPerCycle'] / 10 ** decimalfrom
                                                    frequenciia =  decodedData['data']['cycleFrequency']

                                                    console.log('inAmount: ', makingamama);
                                                    console.log('inAmountPerCycle: ', percycle);
                                                    console.log('Per: ', frequenciia, 'sec (', frequenciia / 60, 'min )');
                                                }
                                                else if (test == 'DCA') {

                                                    symf = await getTokenSymbolByMint(mintfrom);
                                                    symt = await getTokenSymbolByMint(mintto);

                                                    makingamama = decodedData['data']['inAmount'] / 10 ** decimalfrom
                                                    percycle = decodedData['data']['inAmountPerCycle'] / 10 ** decimalfrom
                                                    frequenciia =  decodedData['data']['cycleFrequency']

                                                    console.log('inAmount: ', makingamama);
                                                    console.log('inAmountPerCycle: ', percycle);
                                                    console.log('Per: ', frequenciia, 'sec (', frequenciia / 60, 'min )');


                                                    
                                                    if (mintfrom=='EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' || mintfrom=='Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' || mintfrom=='USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA' || mintfrom=='So11111111111111111111111111111111111111112'){
                                                        console.log('else')
                                                        if (mintfrom=='So11111111111111111111111111111111111111112'){
                                                            priceoftaking = priceoftoken
                                                            amountformes = `${makingamama.toFixed(0)} ${symf} ($${(makingamama*priceoftaking).toFixed(0)})`
                                                        }else{
                                                            priceoftaking = 1
                                                            amountformes = `${makingamama.toFixed(0)} ${symf}`
                                                        }

                                                        zaholovok = `<b><a href="https://solscan.io/account/${dcawalletasiarono}">$${(inAmountinUSDT/1000).toFixed(2)}K buying ${symt} 🟩</a></b>`
                                                        dexscreeen = await getDexScreen(mintto)
                                                        console.log(dexscreeen.pairs[0].volume)
                                                        marcetcupnow = dexscreeen.pairs[0].marketCap/1000000
                                                        liquiditynow = dexscreeen.pairs[0].liquidity.usd
                                                        //console.log(dexscreeen.pairs[0])
                                                        etadca = (makingamama / percycle) * (frequenciia / 60)
                                                        secondliqui = Number.parseInt(liquiditynow) + Number.parseInt(inAmountinUSDT)
                                                        potencialchange = (1 - (liquiditynow/secondliqui * 1)) * 100

                                                        causer = mintto
                                                        
     
                                                        if ((decodedData['data']['minOutAmount'] != 0) && (decodedData['data']['maxOutAmount'] != 0)){
                                                            massegeforminmax = `<b>Min buy price: <code>${decodedData['data']['minOutAmount']}</code> ${symf} per ${symt}\nMax buy price: <code>${decodedData['data']['maxOutAmount']}</code> ${symf} per ${symt}</b>`
                                                        }else if (decodedData['data']['minOutAmount'] != 0) {
                                                            massegeforminmax = `<b>Min buy price: <code>${decodedData['data']['minOutAmount']}</code> ${symf} per ${symt}</b>`
                                                        }else if (decodedData['data']['maxOutAmount'] != 0){
                                                            massegeforminmax = `<b>Max buy price: <code>${decodedData['data']['maxOutAmount']}</code> ${symf} per ${symt}</b>`
                                                        }else{
                                                            massegeforminmax = ``
                                                        }
                                                        creatingdate = await getTransactionTimestamp(signature)
                                                        perdaliaj = priceoftaking * percycle


                                                        let limitbalancemassege = ''
                                                    
                                                        limitbalancemassege = `$${(inAmountinUSDT.toFixed(2) * 1).toLocaleString('en-US')}`
                                                        
                                                        
                                                        //const truncatedAddress = transaction.transaction.message.accountKeys[0].toString().slice(0, 18) + '...';
                                                        const message = `${zaholovok}
                                                        \n<b>MCAP: $${marcetcupnow.toFixed(2)}M\nLiquidity: $${(liquiditynow/1000000).toFixed(2)}M\nETA: ${etadca.toFixed(0)} minutes\nPotential price change: +${potencialchange.toFixed(2)}%</b>
                                                        \n<b>CA: <code>${causer}</code></b>
                                                        \n<b>User: <code>${transaction.transaction.message.accountKeys[0].toString()}</code></b>
                                                        \n<b>Amount: ${amountformes}\nFrequency: $<code>${perdaliaj.toFixed(0)}</code> every ${frequenciia} seconds</b>
                                                        \n<b>Created: ${creatingdate}</b>

                                                        `;

                                                        const options = {
                                                            message_thread_id: threadId,
                                                            parse_mode: 'HTML',
                                                            disable_web_page_preview: true,
                                                            reply_markup: {
                                                                inline_keyboard: [
                                                                    [
                                                                        { text: "Dexscreener", url: `https://dexscreener.com/solana/${causer}` },
                                                                        { text: "Photon", url: `https://photon-sol.tinyastro.io/en/lp/${causer}` },
                                                                        
                                                                    ],
                                                                    [
                                                                        { text: "Jup", url: `https://jup.ag/swap/SOL-${causer}` },
                                                                        { text: "BullX", url: `https://bullx.io/terminal?chainId=1399811149&address=${causer}`},
                                                                    ],
                                                                ]
                                                            }
                                                        };
                                                        

                                                        await sendAndStoreMessage(transaction.transaction.message.accountKeys[0].toString(), message, options)



                                                        
                                                        
                                                    }else if (mintto=='EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' || mintto=='Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' || mintto=='USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA' || mintto=='So11111111111111111111111111111111111111112'){
                                                        console.log('else')
                                                        if (mintfrom=='So11111111111111111111111111111111111111112'){
                                                            priceoftaking = priceoftoken
                                                            amountformes = `${makingamama.toFixed(0)} ${symf} ($${(makingamama*priceoftaking).toFixed(0)})`
                                                        }else{
                                                            priceoftaking = 1
                                                            amountformes = `${makingamama.toFixed(0)} ${symf}`
                                                        }

                                                        zaholovok = `<b><a href="https://solscan.io/account/${dcawalletasiarono}">$${(inAmountinUSDT/1000).toFixed(2)}K selling ${symf} 🟥</a></b>`
                                                        dexscreeen = await getDexScreen(mintfrom)
                                                        console.log(dexscreeen.pairs[0].volume)
                                                        marcetcupnow = dexscreeen.pairs[0].marketCap/1000000
                                                        liquiditynow = dexscreeen.pairs[0].liquidity.usd
                                                        console.log(dexscreeen.pairs[0])
                                                        etadca = (makingamama / percycle) * (frequenciia / 60)
                                                        secondliqui = Number.parseInt(liquiditynow) + Number.parseInt(inAmountinUSDT)
                                                        potencialchange = (1 - (liquiditynow/secondliqui * 1)) * 100

                                                        causer = mintfrom
                                                        
     
                                                        if ((decodedData['data']['minOutAmount'] != 0) && (decodedData['data']['maxOutAmount'] != 0)){
                                                            massegeforminmax = `<b>Min buy price: <code>${decodedData['data']['minOutAmount']}</code> ${symt} per ${symt}\nMax buy price: <code>${decodedData['data']['maxOutAmount']}</code> ${symf} per ${symt}</b>`
                                                        }else if (decodedData['data']['minOutAmount'] != 0) {
                                                            massegeforminmax = `<b>Min buy price: <code>${decodedData['data']['minOutAmount']}</code> ${symt} per ${symt}</b>`
                                                        }else if (decodedData['data']['maxOutAmount'] != 0){
                                                            massegeforminmax = `<b>Max buy price: <code>${decodedData['data']['maxOutAmount']}</code> ${symt} per ${symt}</b>`
                                                        }else{
                                                            massegeforminmax = ``
                                                        }
                                                        creatingdate = await getTransactionTimestamp(signature)
                                                        perdaliaj = priceoftaking * percycle


                                                        let limitbalancemassege = ''
                                                    
                                                        limitbalancemassege = `$${(inAmountinUSDT.toFixed(2) * 1).toLocaleString('en-US')}`
                                                        
                                                        
                                                        //const truncatedAddress = transaction.transaction.message.accountKeys[0].toString().slice(0, 18) + '...';
                                                        const message = `${zaholovok}
                                                        \n<b>MCAP: $${marcetcupnow.toFixed(2)}M\nLiquidity: $${(liquiditynow/1000000).toFixed(2)}M\nETA: ${etadca.toFixed(0)} minutes\nPotential price change: +${potencialchange.toFixed(2)}%</b>
                                                        \n<b>CA: <code>${causer}</code></b>
                                                        \n<b>User: <code>${transaction.transaction.message.accountKeys[0].toString()}</code></b>
                                                        \n<b>Amount: ${amountformes}\nFrequency: $<code>${perdaliaj.toFixed(0)}</code> every ${frequenciia} seconds</b>
                                                        \n<b>Created: ${creatingdate}</b>

                                                        `;

                                                        const options = {
                                                            message_thread_id: threadId,
                                                            parse_mode: 'HTML',
                                                            disable_web_page_preview: true,
                                                            reply_markup: {
                                                                inline_keyboard: [
                                                                    [
                                                                        { text: "Dexscreener", url: `https://dexscreener.com/solana/${causer}` },
                                                                        { text: "Photon", url: `https://photon-sol.tinyastro.io/en/lp/${causer}` },
                                                                        { text: "Jup", url: `https://jup.ag/swap/${causer}-SOL` }
                                                                    ],
                                                                ]
                                                            }
                                                        };                                                        

                                                        await sendAndStoreMessage(transaction.transaction.message.accountKeys[0].toString(), message, options)


                                                        
                                                        
                                                    }else{
                                                        console.log('lololololol')
                                                    }



                                                    



                                                    




                                                    

                                                    

                                                    
                                                    
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    console.log("IDL для указанной программы не найден.");
                                }
                            }else{
                                //console.log("No OpenDcaV2")
                            }
                        }
                    }else{
                        //console.log('ARORO')
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




module.exports = { dcatrackWalletTransactions };

