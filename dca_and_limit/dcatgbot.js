const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = '7552116695:AAFE__wLsyvJ0aRAJMvidcMONFv-LZVCak8';
const bot = new TelegramBot(token, {polling: true});
const chatId = '-1002153392470';


const sqlite3 = require('sqlite3').verbose();


async function sendAndStoreMessage(singerWallet, message, options) {
    return new Promise((resolve, reject) => {
        bot.sendMessage(chatId, message, options).then((sentMessage) => {
            const messageId = sentMessage.message_id;

            const db = new sqlite3.Database('./dcausers.db', (err) => {
                if (err) {
                    console.error('Ошибка подключения к базе данных:', err.message);
                    reject(err);
                    return;
                }

                db.run(`
                    INSERT INTO users (singerwallet, message_id, status, content) VALUES (?, ?, ?, ?)
                `, [singerWallet, messageId, 'открыт', message], (err) => {
                    db.close();
                    if (err) {
                        console.error('Ошибка при добавлении записи:', err.message);
                        reject(err);
                    } else {
                        resolve(messageId);
                    }
                });
            });
        }).catch((error) => {
            console.error('Error sending message:', error);
            reject(error);
        });
    });
}




async function sendAndUpdateMessage(singerWallet, messageId, timestampoffinish, statuswhoclose) {
  try {
    const db = new sqlite3.Database('./dcausers.db');

    const currentText = await new Promise((resolve, reject) => {
      db.get('SELECT content FROM users WHERE singerwallet = ?', [singerWallet], (err, row) => {
        if (err) {
          console.error('Ошибка при чтении данных из базы:', err.message);
          reject(err);
        } else if (!row) {
          reject(new Error('Запись не найдена в базе данных.'));
        } else {
          resolve(row.content);
        }
      });
    });

    db.close();

    const additionalText = `<b>Finished : ${timestampoffinish}</b>`;
    const updatedText = `${currentText}\n${additionalText}`;
    let newMessage = ''

    if (statuswhoclose==1){
        newMessage = '<b>🟥 DCA закончилась</b>';
    }else{
        newMessage = '<b>🟥 DCA закрыта Пользывателем/Пограмой</b>';
    }

    const sentMessage = await bot.sendMessage(chatId, newMessage, {
      reply_to_message_id: messageId,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });

    await bot.editMessageText(updatedText, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });

    console.log('Сообщение успешно обновлено.');

    await new Promise((resolve, reject) => {
      const db = new sqlite3.Database('./dcausers.db');
      db.run('DELETE FROM users WHERE singerwallet = ?', [singerWallet], function (err) {
        db.close();
        if (err) {
          console.error('Ошибка при удалении записи из базы:', err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });

  } catch (error) {
    console.error('Ошибка в функции sendAndUpdateMessage:', error.message);
  }
}


module.exports = { sendAndStoreMessage, sendAndUpdateMessage };
