from aiogram import Bot, Dispatcher, types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.types import ChatPermissions
from aiogram.utils import executor
from aiogram.types import CallbackQuery
from aiogram.dispatcher.filters import Text
from aiogram.dispatcher import FSMContext
from aiogram.contrib.fsm_storage.memory import MemoryStorage
from aiogram.dispatcher.filters.state import State, StatesGroup
from datetime import datetime, timedelta
import sqlite3
import asyncio
import pickle

global admins_ids
global GROUP_IDS
global pricanapodpisku
global sietidlaoplaty
global adressdlaoplaty
global managerusername
admins_ids = [1477094350, 1343852948]
GROUP_IDS = [-1002153392470]
pricanapodpisku = 50
sietidlaoplaty = 'USDT, USDC, SOL'
adressdlaoplaty = 'GJ84J7NjPJFtiHPcghq35feMVhF6xosuoFexBwQMBkSd'
managerusername = '@JimmyDeathless'




try:
    with open("piramida.pkl", "rb") as file:
        piramida_kategory = pickle.load(file)
except FileNotFoundError:
    piramida_kategory = []

def check_piramida_exists(user_id):
    user_id_str = str(user_id) + "|"
    return any(i.startswith(user_id_str) for i in piramida_kategory)

def add_piramida_kategory(piramida_punkt):
    piramida_kategory.append(piramida_punkt)
    print(f"Продукт '{piramida_punkt}' успешно добавлен.")
    save_piramida_file_kat()


def update_piramida_kategory(old_piramida_punkt, new_piramida_punkt):
    if old_piramida_punkt in piramida_kategory:
        piramida_index = piramida_kategory.index(old_piramida_punkt)
        piramida_kategory[piramida_index] = new_piramida_punkt
        print(f"Продукт '{old_piramida_punkt}' успешно обновлен на '{new_piramida_punkt}'.")
        save_piramida_file_kat()
    else:
        print(f"Продукт '{old_piramida_punkt}' не найден в списке.")


def remove_piramida_kategory(piramida_punkt):
    if piramida_punkt in piramida_kategory:
        piramida_kategory.remove(piramida_punkt)
        print(f"Продукт '{piramida_punkt}' успешно удален.")
        save_piramida_file_kat()
    else:
        print(f"Продукт '{piramida_punkt}' не найден в списке.")


def show_piramida_kategory():
    if piramida_kategory:
        piramida_pokaz_kat = "\n".join(piramida_punkt for piramida_punkt in piramida_kategory)
        return piramida_pokaz_kat
        for piramida_punkt in piramida_kategory:
            print(f"Продукт: {piramida_punkt}")
    else:
        print("Список продуктов пуст.")


def save_piramida_file_kat():
    with open("piramida.pkl", "wb") as file:
        pickle.dump(piramida_kategory, file)







API_TOKEN = "7622615162:AAH1z2HJqJoLK5crtj1qviY6_MfSVUfoum4"

bot = Bot(token=API_TOKEN)
storage = MemoryStorage()
dp = Dispatcher(bot, storage=storage)

class Form(StatesGroup):
    waiting_for_confirm_payments = State()

def init_db():
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY,
            removal_date DATE
        )
    """)
    conn.commit()
    conn.close()


async def user_exists(user_iddd):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("SELECT user_id FROM users WHERE user_id = ?", (user_iddd,))
    return cursor.fetchone() is not None    

def add_user_to_db(user_id, removal_date):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("INSERT OR REPLACE INTO users (user_id, removal_date) VALUES (?, ?)",
                   (user_id, removal_date))
    conn.commit()
    conn.close()

def remove_user_from_db(user_id):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE user_id = ?", (user_id,))
    conn.commit()
    conn.close()


def get_users_to_remove():
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    today = datetime.now().date()
    cursor.execute("SELECT user_id FROM users WHERE removal_date <= ?", (today,))
    users = cursor.fetchall()
    conn.close()
    return users

def get_users_to_napom():
    today = datetime.now().date()
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("SELECT user_id, removal_date FROM users")
    users = cursor.fetchall()
    conn.close()

    users_to_napom = []

    for user_id, removal_date_from_db in users:
        removal_date_formated = datetime.strptime(removal_date_from_db, "%Y-%m-%d").date()
        napom_date = removal_date_formated - timedelta(days=3)

        if today < removal_date_formated and today >= napom_date:
            users_to_napom.append(user_id)

    return users_to_napom

def get_removel_date(user_id_now):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("SELECT removal_date FROM users WHERE user_id = ?", (user_id_now,))
    usersperson = cursor.fetchone()
    conn.close()

    removal_date_from_db = usersperson[0]
    removal_date_formated = datetime.strptime(removal_date_from_db, "%Y-%m-%d").date()
    return removal_date_formated


async def create_invite_link(chat_id):
    try:
        expire_date = datetime.now() + timedelta(hours=24)
        invite_link = await bot.create_chat_invite_link(
            chat_id=chat_id,
            expire_date=int(expire_date.timestamp()),
            member_limit=1  # Одноразовая ссылка
        )
        return invite_link.invite_link
    except Exception as e:
        print(f"Ошибка при создании ссылки для чата {chat_id}: {e}")
        return None

async def check_and_remove_users():
    while True:
        today = datetime.now().date()
        
        print("Проверка пользователей для напоминания...")
        users_to_napom = get_users_to_napom()

        if users_to_napom:
            for user_id_for_napom in users_to_napom:
                removal_date_formated = get_removel_date(user_id_for_napom)
                dnej = (removal_date_formated-today).days
                messagefordays = ''
                if dnej == 1:
                    messagefordays = "завтра"
                if dnej == 2:
                    messagefordays = "через 2 дня"
                if dnej == 3:
                    messagefordays = "через 3 дня"
                    
                setkeyboard = InlineKeyboardMarkup(row_width=3) 
                button_prodlit = InlineKeyboardButton(text="Продлить подписку", callback_data="button_1mouth")
                setkeyboard.row(button_prodlit)
                try:
                    await bot.send_message(user_id_for_napom, f'Ваша подписка истекает <b>{messagefordays}</b> ⏳\nОна действительна до <b>{removal_date_formated}</b> ✅\nЦена на подписку\n\n1 месяц - <b>{pricanapodpisku}$</b>', reply_markup=setkeyboard, parse_mode='HTML')
                except:
                    pass
                



        print("Проверка пользователей для удаления...")
        users_to_remove = get_users_to_remove()

        if users_to_remove:
            for user_id_tuple in users_to_remove:
                user_id = user_id_tuple[0]
                for chat_id in GROUP_IDS:
                    try:
                        await bot.kick_chat_member(chat_id, user_id)
                        print(f"Пользователь {user_id} удалён из группы {chat_id}.")
                    except Exception as e:
                        print(f"Ошибка при удалении пользователя {user_id} из группы {chat_id}: {e}")
                remove_user_from_db(user_id)

                button_1mouth = InlineKeyboardButton(text="Оформить подписку", callback_data="button_1mouth")
                setkeyboard.row(button_1mouth)
                try:
                    await bot.send_message(user_id, f'Ваша подписка истекла ❌\nЦена на подписку\n\n1 месяц - <b>{pricanapodpisku}$</b>', reply_markup=setkeyboard, parse_mode='HTML')
                except:
                    pass

    
        print("Ожидание 24 часа...")
        await asyncio.sleep(24 * 60 * 60)



print('OK')




@dp.message_handler(commands=["start"])
async def start(message: types.Message):
    user_id_now = message.from_user.id   
    setkeyboard = InlineKeyboardMarkup(row_width=3) 

    if user_id_now in admins_ids:
        await message.answer(f"Чтобы войти в личный кабинет нажмите /admin_kabnet")
    else:
        if check_piramida_exists(user_id_now):
            await message.answer(f"Ваш запрос уже обработке, ожидайте потверждение")
        else:
            if await user_exists(user_id_now):

                today = datetime.now().date()
                

                conn = sqlite3.connect("users.db")
                cursor = conn.cursor()
                cursor.execute("SELECT removal_date FROM users WHERE user_id = ?", (user_id_now,))
                usersperson = cursor.fetchone()
                conn.close()

                removal_date_from_db = usersperson[0]
                removal_date_formated = datetime.strptime(removal_date_from_db, "%Y-%m-%d").date()
                napom_date = removal_date_formated - timedelta(days=3)


                if today <= removal_date_formated and today >= napom_date:
                    button_prodlit = InlineKeyboardButton(text="Продлить подписку", callback_data="button_1mouth")
                    setkeyboard.row(button_prodlit)
                    await message.answer(f"Твоя подписка действительна до <b>{removal_date_from_db}</b> ✅\nЦена на подписку\n\n1 месяц - <b>{pricanapodpisku}$</b>", reply_markup=setkeyboard, parse_mode='HTML')
                else:
                    await message.answer(f"Твоя подписка действительна до <b>{removal_date_from_db}</b> ✅", parse_mode='HTML')
            else:
                button_1mouth = InlineKeyboardButton(text="Оформить подписку", callback_data="button_1mouth")
                setkeyboard.row(button_1mouth)
                await message.answer(f"Приветствую тебя в нашем боте\nЦена на подписку\n\n1 месяц - <b>{pricanapodpisku}$</b>", reply_markup=setkeyboard, parse_mode='HTML')





@dp.callback_query_handler(Text(equals="button_1mouth"))
async def handle_button_1mouth(callback_query: CallbackQuery):
    user_id_now = callback_query.from_user.id
    if check_piramida_exists(user_id_now):
        await callback_query.message.answer(f"Ваш запрос уже обработке, ожидайте потверждение")
    else:
        await callback_query.message.edit_text(f'К оплате: <b>{pricanapodpisku}$</b>\nСети: {sietidlaoplaty}\nАдрес для оплаты: <code>{adressdlaoplaty}</code>\n\nПосле оплаты пришлите <b>хеш транзакции</b> или <b>ссылку на solscan</b>:\n<i>(Внимательно сконтролируйте то что вы отправите, ибо в противном случае ваш запрос будет отклонен)</i>', parse_mode='HTML')
        await Form.waiting_for_confirm_payments.set()





@dp.message_handler(state=Form.waiting_for_confirm_payments)
async def process_name(message: types.Message, state: FSMContext):
    user_id_now = message.from_user.id
    hashconfirm = message.text

    if check_piramida_exists(user_id_now):
        await message.answer(f"Ваш запрос уже обработке, ожидайте потверждение")
    else:
        if str(hashconfirm) == '/start':
            await state.finish()
            await message.answer(f'К оплате: <b>{pricanapodpisku}$</b>\nСети: {sietidlaoplaty}\nАдрес для оплаты: <code>{adressdlaoplaty}</code>\n\nПосле оплаты пришлите <b>хеш транзакции</b> или <b>ссылку на solscan</b>:\n<i>(Внимательно сконтролируйте то что вы отправите, ибо в противном случае ваш запрос будет отклонен)</i>', parse_mode='HTML')
            await Form.waiting_for_confirm_payments.set()
        else:
            if check_piramida_exists(user_id_now):
                await message.answer(f"Ваш запрос уже обработке, ожидайте потверждение")
            else:
                try:
                    username = await bot.get_chat(user_id_now)
                    tgname = username.username
                except:
                    tgname = 'NoneUserName'
                add_piramida_kategory(f'{user_id_now}|{hashconfirm}|{tgname}')

                for admid in admins_ids:
                    try:
                        await bot.send_message(admid, f'На вашу приватку оформили подписку, проверте её\nВойдите в ваш кабинет /admin_kabnet')
                    except:
                        pass

                await message.answer(f"Ваш запрос отправлен на проверку, ожидайте потверждение\nЕсли вы отправили не то что нужно напишите нашему менеджеру:\n{managerusername}")

            print(hashconfirm)


            await state.finish()
















@dp.message_handler(commands=["admin_kabnet"])
async def admin_kabnet(message: types.Message):
    user_id_now = message.from_user.id   
    if user_id_now in admins_ids:

        setkeyboard = InlineKeyboardMarkup(row_width=3) 

        if piramida_kategory:
            for i in piramida_kategory:
                parts = i.split("|")

                us_id = parts[0]
                conf = parts[1]
                tgname = parts[2]
                if tgname == 'NoneUserName':
                    tgname = us_id

                button_order = InlineKeyboardButton(text=f'@{tgname}', callback_data="button_order|"+str(us_id))
                setkeyboard.row(button_order)

            await message.answer("Добро пожаловать в ваш личный кабинет\nВот список подписок на проверку:", reply_markup=setkeyboard)
        else:
            await message.answer("Добро пожаловать в ваш личный кабинет\nСписок пуст")


    else:
        pass

@dp.callback_query_handler(lambda callback_query: callback_query.data.startswith("button_order"))
async def handle_order(callback_query: types.CallbackQuery):
    user_id_now = callback_query.from_user.id
    setkeyboard = InlineKeyboardMarkup(row_width=3) 

    parts = callback_query.data.split("|")
    client_id = parts[1]
    
    for i in piramida_kategory:
        parts2 = i.split("|")
        if str(client_id) == str(parts2[0]):
            confhash = parts2[1]
            tgname = parts2[2]
            if tgname == 'NoneUserName':
                tgname = client_id

    button_confyes = InlineKeyboardButton(text='Да ✅', callback_data="button_confyes|"+str(client_id))
    button_confno = InlineKeyboardButton(text='Нет ❌', callback_data="button_confno|"+str(client_id))
    button_backadm = InlineKeyboardButton(text='Назад ⬅️', callback_data="button_backadm")
    setkeyboard.row(button_confyes, button_confno)
    setkeyboard.row(button_backadm)

    await callback_query.message.edit_text(f"Запрос от:  @{tgname}\nСумма: <b>{pricanapodpisku}$</b>\nАдрес <b>НА</b> который должно прийти: \n{adressdlaoplaty}\n\nПотверждение оплаты:\n<code>{confhash}</code>\n\nОплата прошла?", reply_markup=setkeyboard, parse_mode='HTML')






@dp.callback_query_handler(lambda callback_query: callback_query.data.startswith("button_confyes"))
async def handle_order(callback_query: types.CallbackQuery):
    user_id_now = callback_query.from_user.id
    setkeyboard = InlineKeyboardMarkup(row_width=3) 

    parts = callback_query.data.split("|")
    client_id = parts[1]
    for i in piramida_kategory:
        parts2 = i.split("|")
        if str(client_id) == str(parts2[0]):
            confhash = parts2[1]
            tgname = parts2[2]

    if await user_exists(client_id):
        conn = sqlite3.connect("users.db")
        cursor = conn.cursor()
        cursor.execute("SELECT removal_date FROM users WHERE user_id = ?", (client_id,))
        usersperson = cursor.fetchone()
        print('##########################')
        print(usersperson)
        conn.close()

        if usersperson:
            print("PRODLIT")
            removal_date_from_db = usersperson[0]
            removal_date_formated = datetime.strptime(removal_date_from_db, "%Y-%m-%d").date()
            removal_date = removal_date_formated + timedelta(days=30)
            sendingdate = removal_date
            addingdbdate = removal_date

        else:
            removal_date = datetime.now() + timedelta(days=30)
            sendingdate = removal_date.date()
            addingdbdate = removal_date.date()
    else:
        print("OFORMIT")
        removal_date = datetime.now() + timedelta(days=30)
        sendingdate = removal_date.date()
        addingdbdate = removal_date.date()


    linkslist = ''

    for chat_id in GROUP_IDS:
        await bot.unban_chat_member(chat_id=chat_id, user_id=client_id)
        invite_link = await create_invite_link(chat_id)
        if invite_link:
            linkslist = linkslist + f'{invite_link}\n'
    try:
        await bot.send_message(client_id, f"Ваша подписка действует до <b>{sendingdate}</b> ✅\n\nНажмите на ссылку чтобы перейти в приватку: \n{linkslist}", parse_mode='HTML')
    except:
        pass
    await callback_query.message.edit_text(f"Вы одобрили подписку пользывателю <code>@{tgname}</code> ✅", parse_mode='HTML')

    add_user_to_db(client_id, addingdbdate)

    remove_piramida_kategory(f'{client_id}|{confhash}|{tgname}')

    permissions = ChatPermissions(
        can_send_messages=True,
        can_send_media_messages=True,
        can_send_polls=False,
        can_add_web_page_previews=True,
        can_change_info=False,
        can_invite_users=False,
        can_pin_messages=False,
        can_send_stickers=True,  
        can_send_gifs=True,
        can_send_other_messages = True  
    )


    for chat_id in GROUP_IDS:
        try:
            await bot.restrict_chat_member(chat_id, client_id, permissions)
        except:
            pass




    setkeyboard = InlineKeyboardMarkup(row_width=3) 

    if piramida_kategory:
        for i in piramida_kategory:
            parts = i.split("|")

            us_id = parts[0]
            conf = parts[1]
            tgname = parts[2]

            button_order = InlineKeyboardButton(text=f'@{tgname}', callback_data="button_order|"+str(us_id))
            setkeyboard.row(button_order)

        await callback_query.message.answer("Добро пожаловать в ваш личный кабинет\nВот список подписок на проверку:", reply_markup=setkeyboard)
    else:
        await callback_query.message.answer("Добро пожаловать в ваш личный кабинет\nСписок пуст")







@dp.callback_query_handler(lambda callback_query: callback_query.data.startswith("button_confno"))
async def handle_order(callback_query: types.CallbackQuery):
    user_id_now = callback_query.from_user.id
    parts = callback_query.data.split("|")
    client_id = parts[1]
    for i in piramida_kategory:
        parts2 = i.split("|")
        if str(client_id) == str(parts2[0]):
            confhash = parts2[1]
            tgname = parts2[2]


    await callback_query.message.edit_text(f"Вы отклонили подписку пользывателю <code>@{tgname}</code> ❌", parse_mode='HTML')
    try:
        await bot.send_message(client_id, f"Ваш запрос был отклонен ❌\nОплата не прошла, попробуйте ещё раз /start\nЕсли это ошибка то напишите нашему менеджеру:\n{managerusername}")
    except:
        pass
    remove_piramida_kategory(f'{client_id}|{confhash}|{tgname}')


    setkeyboard = InlineKeyboardMarkup(row_width=3) 

    if piramida_kategory:
        for i in piramida_kategory:
            parts = i.split("|")

            us_id = parts[0]
            conf = parts[1]
            tgname = parts[2]

            button_order = InlineKeyboardButton(text=f'@{tgname}', callback_data="button_order|"+str(us_id))
            setkeyboard.row(button_order)

        await callback_query.message.answer("Добро пожаловать в ваш личный кабинет\nВот список подписок на проверку:", reply_markup=setkeyboard)
    else:
        await callback_query.message.answer("Добро пожаловать в ваш личный кабинет\nСписок пуст")









@dp.callback_query_handler(Text(equals="button_backadm"))
async def handle_button_backadm(callback_query: CallbackQuery):
    user_id_now = callback_query.from_user.id
    setkeyboard = InlineKeyboardMarkup(row_width=3) 

    if piramida_kategory:
        for i in piramida_kategory:
            parts = i.split("|")

            us_id = parts[0]
            conf = parts[1]
            tgname = parts[2]

            button_order = InlineKeyboardButton(text=f'@{tgname}', callback_data="button_order|"+str(us_id))
            setkeyboard.row(button_order)

        await callback_query.message.edit_text("Добро пожаловать в ваш личный кабинет\nВот список подписок на проверку:", reply_markup=setkeyboard)
    else:
        await callback_query.message.edit_text("Добро пожаловать в ваш личный кабинет\nСписок пуст")


















'''# Обработчик ответа "да"
@dp.message_handler(lambda message: message.text.lower() == "да")
async def send_invite(message: types.Message):
    user_id = message.from_user.id
    removal_date = datetime.now() + timedelta(days=30)

    for chat_id in GROUP_IDS:
        invite_link = await create_invite_link(chat_id)
        if invite_link:
            await message.reply(f"Ваша одноразовая ссылка для группы: {invite_link}")
        else:
            await message.reply("Не удалось создать ссылку. Попробуйте позже.")
    add_user_to_db(user_id, removal_date.date())
'''
# Запуск
if __name__ == "__main__":
    init_db()
    loop = asyncio.get_event_loop()
    loop.create_task(check_and_remove_users())  # Запуск фоновой задачи
    executor.start_polling(dp, skip_updates=True)