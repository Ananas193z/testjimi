const { LIQUIDITY_STATE_LAYOUT_V4 } = require("@raydium-io/raydium-sdk");
const { Connection, PublicKey } = require("@solana/web3.js");
const axios = require("axios");

const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=a329a7d4-0fb2-478b-9289-970b1632e80f");
const RAYDIUM_AMM_PROGRAM_ID = new PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8");
const solMint = new PublicKey("So11111111111111111111111111111111111111112");

async function getBinanceSolUsdtPrice() {
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

async function getTokenPricebyPools(tokenMintAddress) {
  try {
    const tokenMint = new PublicKey(tokenMintAddress);

    const [marketAccount] = await connection.getProgramAccounts(
      RAYDIUM_AMM_PROGRAM_ID,
      {
        filters: [
          { dataSize: LIQUIDITY_STATE_LAYOUT_V4.span },
          {
            memcmp: {
              offset: LIQUIDITY_STATE_LAYOUT_V4.offsetOf("baseMint"),
              bytes: solMint.toBase58(),
            },
          },
          {
            memcmp: {
              offset: LIQUIDITY_STATE_LAYOUT_V4.offsetOf("quoteMint"),
              bytes: tokenMint.toBase58(),
            },
          },
        ],
      }
    );

    if (!marketAccount) {
      throw new Error("Пул для данного токена не найден.");
    }

    const marketData = LIQUIDITY_STATE_LAYOUT_V4.decode(marketAccount.account.data);
    const { baseVault, quoteVault } = marketData;

    const tokenPoolAddress = new PublicKey(quoteVault.toBase58());
    const solPoolAddress = new PublicKey(baseVault.toBase58());

    async function getTokenBalance(tokenAddress) {
      const tokenBalance = await connection.getTokenAccountBalance(tokenAddress);
      return tokenBalance.value.amount;
    }

    async function getSolBalance(solAddress) {
      const solBalance = await connection.getBalance(solAddress);
      return solBalance / 1_000_000_000; 
    }

    let tokenBalance = await getTokenBalance(tokenPoolAddress);
    let solBalance = await getSolBalance(solPoolAddress);

    tokenBalance = tokenBalance / 1_000_000; 

    let priceOfToken = solBalance / tokenBalance;

    let solToUsdtPrice = await getBinanceSolUsdtPrice();

    let priceInUsd = priceOfToken * solToUsdtPrice;

    return priceInUsd;
  } catch (error) {
    return null;
  }
}

module.exports = { getTokenPricebyPools };
