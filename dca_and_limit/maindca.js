const { dcatrackWalletTransactions } = require('./dca.js');
const { dcatrackWalletTransactionsChaler } = require('./dcat.js');

(async function main() {
    console.log("Запуск обоих циклов");
    
    // Запускаем оба цикла параллельно
    await Promise.all([
        dcatrackWalletTransactions(),
        dcatrackWalletTransactionsChaler()
    ]);
})();