import os
import json
from flask import Flask, request, Response, stream_with_context, jsonify
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv
import urllib.parse # Добавляем для декодирования URL

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

# --- Groq Клиент ---
try:
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if not groq_api_key:
        print("Ошибка: Переменная окружения GROQ_API_KEY не найдена!")
    client = Groq(api_key=groq_api_key)
    print("Клиент Groq успешно инициализирован.")
except Exception as e:
    print(f"Ошибка при инициализации клиента Groq: {e}")
    client = None

# --- Маршрут API для чата (ИЗМЕНЕН МЕТОД И ПОЛУЧЕНИЕ ДАННЫХ) ---
# Меняем methods=['POST'] на methods=['GET']
@app.route('/api/chat', methods=['GET'])
def chat_handler():
    if not client:
         return jsonify({"error": "Клиент Groq не инициализирован."}), 503

    # --- Получаем данные из query параметра 'data' ---
    raw_data_param = request.args.get('data')
    if not raw_data_param:
         return jsonify({"error": "Query параметр 'data' не найден в GET запросе"}), 400

    try:
        # Декодируем URL-кодированную строку JSON (на всякий случай, хотя EventSource обычно не кодирует так сильно)
        # decoded_data_param = urllib.parse.unquote(raw_data_param) # Можно раскомментировать, если будут проблемы с кодировкой
        # Парсим JSON строку
        data = json.loads(raw_data_param)
        print(f"Получены данные из GET запроса: {data}") # Для отладки
    except json.JSONDecodeError:
        print(f"Ошибка декодирования JSON из параметра 'data': {raw_data_param}")
        return jsonify({"error": "Неверный формат JSON в query параметре 'data'"}), 400
    except Exception as e:
        print(f"Неизвестная ошибка при обработке 'data': {e}")
        return jsonify({"error": f"Ошибка обработки входных данных: {e}"}), 400
    # --- Конец получения данных ---

    user_message = data.get('message')
    history = data.get('history', [])
    model = data.get('model', 'llama-3.3-70b-versatile')
    temperature = float(data.get('temperature', 1.0))
    # Убедимся, что используем правильное имя параметра для Groq Python SDK
    # В твоем изначальном примере было 'max_completion_tokens', но в create() часто используется 'max_tokens'
    # Проверь документацию Groq SDK или попробуй оба варианта, если не уверенен
    max_tokens_param = data.get('maxTokens') or data.get('max_tokens') # Ищем оба варианта для гибкости
    max_tokens = int(max_tokens_param) if max_tokens_param else 8192 # Дефолтное значение, если не пришло

    top_p = float(data.get('topP') or data.get('top_p', 0.95)) # Ищем оба варианта

    if not user_message:
        return jsonify({"error": "Параметр 'message' обязателен"}), 400

    messages_for_groq = history + [{"role": "user", "content": user_message}]

    print(f"Запрос к Groq: Модель={model}, Температура={temperature}, Токены={max_tokens}, TopP={top_p}")
    # print(f"Сообщения: {messages_for_groq}") # Раскомментируй для отладки

    try:
        def generate_stream():
            stream = client.chat.completions.create(
                model=model,
                messages=messages_for_groq,
                temperature=temperature,
                max_tokens=max_tokens, # Убедись, что параметр называется именно так
                top_p=top_p,
                stream=True,
                stop=None,
            )
            try:
                for chunk in stream:
                    content = chunk.choices[0].delta.content
                    if content:
                        yield f"data: {json.dumps({'chunk': content})}\n\n"
                    finish_reason = chunk.choices[0].finish_reason
                    if finish_reason:
                         print(f"Стрим завершен. Причина: {finish_reason}")
                         # Можно послать событие о причине завершения, если нужно фронтенду
                         # yield f"event: finish\ndata: {json.dumps({'reason': finish_reason})}\n\n"

                # Сигнал о завершении потока
                yield f"event: end\ndata: {{}}\n\n"
                print("Событие 'end' отправлено клиенту.")
            except Exception as e_stream:
                print(f"Ошибка во время стриминга: {e_stream}")
                try:
                    # Пытаемся отправить ошибку клиенту через SSE, если возможно
                    yield f"event: error\ndata: {json.dumps({'error': f'Ошибка обработки потока Groq: {e_stream}'})}\n\n"
                except Exception as e_yield:
                     print(f"Не удалось отправить ошибку стриминга клиенту: {e_yield}")


        return Response(stream_with_context(generate_stream()), mimetype='text/event-stream')

    except Exception as e:
        print(f"Ошибка при обращении к API Groq или настройке стрима: {e}")
        # В случае GET запроса, мы не можем вернуть JSON ошибку обычным способом,
        # т.к. браузер ожидает text/event-stream. Лучше логировать и, возможно,
        # отправить специальное событие SSE с ошибкой, если стрим уже начался.
        # Если ошибка произошла *до* начала стрима, как здесь, вернуть 500 сложнее.
        # Можно попытаться вернуть текстовую ошибку, но EventSource может её проигнорировать.
        # Лучший вариант - залогировать и вернуть пустой ответ или ошибку 500,
        # фронтенд должен обработать событие onerror у EventSource.
        # Flask вернет 500 по умолчанию, если здесь возникнет исключение.
        # Для явности:
        return Response(f"data: {json.dumps({'error': f'Ошибка сервера при подготовке ответа Groq: {e}'})}\n\nevent: error\ndata: {{}}\n\n", status=500, mimetype='text/event-stream')


# --- Маршрут для проверки статуса (остается GET) ---
@app.route('/api/status', methods=['GET'])
def status():
     status_info = {
        "groq_client_initialized": client is not None,
        "message": "Backend is running and configured for GET requests on /api/chat"
     }
     return jsonify(status_info)

# --- Запуск сервера ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)