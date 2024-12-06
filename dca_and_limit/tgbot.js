const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();

const token = '7795851139:AAG3rETU4PK_beXij-o9LICO0uM5KHfxbVY';
const bot = new TelegramBot(token, { polling: true });
const chatId = '-1002153392470';
const threadId = 140507; // Убедитесь, что это число, а не строка

async function sendAndStoreMessage(singerWallet, message) {
    return new Promise((resolve, reject) => {
        bot.sendMessage(chatId, message, {
            message_thread_id: threadId,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
        }).then((sentMessage) => {
            const messageId = sentMessage.message_id;

            const db = new sqlite3.Database('./users.db', (err) => {
                if (err) {
                    console.error('Ошибка подключения к базе данных:', err.message);
                    reject(err);
                    return;
                }

                db.run(
                    `INSERT INTO users (singerwallet, message_id, status) VALUES (?, ?, ?)`,
                    [singerWallet, messageId, 'открыт'],
                    (err) => {
                        db.close();
                        if (err) {
                            console.error('Ошибка при добавлении записи:', err.message);
                            reject(err);
                        } else {
                            resolve(messageId);
                        }
                    }
                );
            });
        }).catch((error) => {
            console.error('Ошибка при отправке сообщения:', error.message);
            reject(error);
        });
    });
}

async function sendAndRemoveMessage(singerWallet, messageId) {
    return new Promise((resolve, reject) => {
        const message = '🟥 Лимитка закрыта';

        bot.sendMessage(chatId, message, {
            reply_to_message_id: messageId,
            parse_mode: 'HTML',
        }).then(() => {
            const db = new sqlite3.Database('./users.db', (err) => {
                if (err) {
                    console.error('Ошибка подключения к базе данных:', err.message);
                    reject(err);
                    return;
                }

                db.run(
                    `DELETE FROM users WHERE singerwallet = ?`,
                    [singerWallet],
                    function (err) {
                        db.close();
                        if (err) {
                            console.error('Ошибка при удалении записи:', err.message);
                            reject(err);
                        } else if (this.changes === 0) {
                            console.warn('Запись не найдена или уже удалена');
                            resolve(); 
                        } else {
                            resolve();
                        }
                    }
                );
            });
        }).catch((error) => {
            console.error('Ошибка при отправке сообщения:', error.message);
            reject(error);
        });
    });
}

module.exports = { sendAndStoreMessage, sendAndRemoveMessage };
