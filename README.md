# Firechat - AI Chat Interface

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

Это современный, интерактивный веб-интерфейс для общения с моделями ИИ через API Groq. Проект построен с использованием React (+Vite) для фронтенда и Python (+Flask) для бэкенда, обеспечивая быстрый стриминг ответов и удобный пользовательский опыт.

## ✨ Ключевые особенности

*   🚀 **Сверхбыстрый интерфейс:** Сборка на Vite и использование современных веб-технологий.
*   ⚡ **Потоковая передача ответов (SSE):** Ответы от AI появляются в реальном времени, как при печати.
*   🎨 **Современный темный дизайн:** Плавный и приятный интерфейс.
*   📜 **Поддержка Markdown:** Ответы форматируются с использованием Markdown (списки, жирный текст, ссылки и т.д.).
*   💻 **Подсветка синтаксиса кода:** Блоки кода автоматически распознаются и подсвечиваются для удобства чтения.
*   📋 **Кнопка "Копировать код":** Легко копируйте фрагменты кода из ответов AI.
*   🤔 **Раскрываемые "Мысли AI":** Блоки `<think>`, если они присутствуют в ответе модели, аккуратно сворачиваются и могут быть раскрыты для просмотра "хода мыслей" AI.
*   ⚙️ **Настраиваемые параметры AI:** Возможность выбирать модель Groq и настраивать температуру, Top P и максимальное количество токенов ответа через интерфейс.
*   🗑️ **Очистка чата:** Простая кнопка для сброса текущего диалога.
*   🐍 **Разделение Frontend/Backend:** Четкая архитектура с React-приложением и Python API.

## 🛠️ Стек

*   **Фронтенд:**
    *   React (v18+)
    *   Vite
    *   JavaScript (ES6+) / JSX
    *   CSS3 (с кастомными переменными)
    *   `react-markdown` (для рендеринга Markdown)
    *   `react-syntax-highlighter` (для подсветки кода)
    *   `react-icons` (для иконок)
    *   `EventSource` API (для Server-Sent Events)
*   **Бэкенд:**
    *   Python 3.x
    *   Flask (веб-фреймворк)
    *   `groq` (официальный Python-клиент Groq)
    *   `python-dotenv` (для управления переменными окружения)
    *   `flask-cors` (для обработки CORS)
*   **API:**
    *   Groq Cloud API


## 🚀 Установка и запуск

**Предварительные требования:**

*   Node.js и npm (или yarn/pnpm)
*   Python 3.7+ и pip
*   Git

**1. Клонирование репозитория:**

```bash
git clone https://github.com/Firecoding0/firechat-ai/edit/main/README.md
cd firechat
```

**2. Настройка Бэкенда (папка `backend`):**

```bash
cd backend

# Создайте и активируйте виртуальное окружение (рекомендуется)
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

# Создайте файл .env в папке backend/
# Откройте его и добавьте ваш Groq API ключ:
# GROQ_API_KEY=gsk_ВАШ_КЛЮЧ_ОТ_GROQ_API

python app.py
```

Бэкенд должен запуститься по адресу `http://localhost:5000`.

**3. Настройка Фронтенда (папка `frontend`):**

Откройте *новый терминал*.

```bash
cd ../frontend

npm install

npm run dev
```

Фронтенд должен запуститься по адресу `http://localhost:5173` (или другому порту, указанному Vite).

**4. Использование:**

Откройте в браузере адрес фронтенда (например, `http://localhost:5173`). Вы должны увидеть интерфейс Firechat, готовый к работе!

## ⚙️ Конфигурация

Единственная необходимая конфигурация - это ваш **Groq API ключ**.

*   Получите ключ на [Groq Cloud](https://console.groq.com/keys).
*   Создайте файл `.env` в корневой папке `backend`.
*   Добавьте строку `GROQ_API_KEY=gsk_ВАШ_КЛЮЧ_ОТ_GROQ_API` в файл `.env`, заменив `gsk_ВАШ_КЛЮЧ_ОТ_GROQ_API` на ваш реальный ключ.
*   **Никогда не публикуйте и не коммитьте ваш `.env` файл или API-ключ.**

## 📄 Лицензия

Этот проект распространяется под лицензией **GNU General Public License v3.0**. Подробности смотрите в файле [LICENSE](https://www.gnu.org/licenses/gpl-3.0.ru.html)

## ✍️ Автор

**Firecoding**

## 📞 Контакты

*   **TikTok:** [@firecoding](https://www.tiktok.com/@firecoding)
*   **Telegram:** [@codeapostol](https://t.me/codeapostol)

---
