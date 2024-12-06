const { trackWalletTransactions } = require('./tracker.js');
const { trackWalletTransactionsChaler } = require('./chaker.js');

(async function main() {
    console.log("Запуск обоих циклов");
    
    // Запускаем оба цикла параллельно
    await Promise.all([
        trackWalletTransactions(),
        trackWalletTransactionsChaler()
    ]);
})();