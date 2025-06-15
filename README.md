# Elysia with Bun runtime

## Getting Started
To get started with this template, simply paste this command into your terminal:
```bash
bun create elysia ./elysia-example
```

## Development
To start the development server run:
```bash
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.

## API Reference

### Плагины (Plugins)
**GET /plugins**  
Возвращает список всех плагинов с сокращенными данными.  
*Ответ:*  
```json
[
  {
    "id": "uuid",
    "name": "string",
    "description": "string?",
    "stars": ["user_id"],
    "reactions": { /* JSON */ },
    "updatedAt": "DateTime"
  }
]
```

**GET /plugins/all**  
Полный список плагинов со всеми полями и релизами.  
*Ответ:* Полная структура `exteraPlugin` с вложенными `releases`.

**GET /plugins/names**  
Список названий плагинов.  
*Ответ:* `["plugin_name", ...]`

**GET /plugins/{id}**  
Полная информация о плагине.  
*Поля ответа:*  
```ts
id, name, description, releases[], 
forkOrigin{}, forkedPlugins[], stars[], 
reactions{}, createdAt, updatedAt
```

**GET /plugins/{id}/releases**  
Релизы плагина.  
*Ответ:* Массив `pluginRelease` с полями:  
```ts
id, releaseNotes, file, reactions, 
downloads, createdAt, updatedAt
```

**GET /plugins/{id}/releases/latest**  
Скачивание файла последнего релиза.  
*Заголовки:*  
`Content-Type: application/octet-stream`  
`Content-Disposition: attachment; filename="latest.plugin"`

**GET /plugins/{id}/reactions**  
Реакции на плагин.  
*Ответ:* `{ /* reaction counters */ }`

**POST /plugins**  
Создание нового плагина.  
*Тело запроса:*  
```json
{
  "name": "string (5-15 chars)",
  "description": "string? (max 300 chars)"
}
```
*Ошибки:* `STATUS_INVALID_NAME`, `STATUS_INVALID_DESCRIPTION`

**PUT /plugins/{id}**  
Обновление плагина.  
*Тело запроса (опциональные поля):*  
```json
{
  "name": "string (5-15 chars)",
  "description": "string? (max 300 chars)"
}
```

**DELETE /plugins/{id}**  
Удаление плагина и связанных релизов.

**POST /plugins/{id}/releases**  
Добавление релиза к плагину.  
*Тело запроса:*  
```json
{
  "fileReference": "string (path)",
  "releaseNotes": "string? (max 100 chars)"
}
```

**POST /plugins/{id}/star**  
Добавление/удаление звезды от пользователя.  
*Требует:* `Authentication: Bearer <token>`

---

### Релизы (Releases)
**GET /releases/{id}**  
Информация о релизе.  
*Ответ:*  
```ts
id, releaseNotes, file, reactions, 
downloads, createdAt, updatedAt, plugin{}
```

**DELETE /releases/{id}**  
Удаление релиза.

---

### Пользователи (Users)
**POST /users**  
Регистрация пользователя.  
*Тело запроса:*  
```json
{
  "email": "valid email",
  "username": "string (5-15 chars)",
  "password": "string"
}
```

**PUT /users/{id}/username**  
Смена имени пользователя.  
*Тело:* `{"newUsername": "string"}`

**PUT /users/{id}/title**  
Изменение титула.  
*Тело:* `{"newTitle": "string"}`

**PUT /users/{id}/description**  
Обновление описания.  
*Тело:* `{"newDescription": "string"}`

**PUT /users/{id}/supporter**  
Изменение статуса supporter.  
*Тело:* `{"status": boolean}`

**PUT /users/{id}/profile**  
Комплексное обновление профиля.  
*Тело:*  
```json
{
  "username?": "string",
  "description?": "string",
  "profilePicture?": "string"
}
```

**DELETE /users/{id}**  
Удаление пользователя.

---

### Особенности
1. **Валидация:**
   - Имена плагинов/пользователей: 5-15 символов
   - Описания: до 300 символов
   - Release notes: до 100 символов
   - Email: валидация формата

2. **Безопасность:**
   - Все операции изменения требуют токен аутентификации
   - Пароли хранятся хешированными (bcrypt)

3. **Аудитрия:**
   - Все действия логируются через `updateLogFile`

4. **Особенности моделей:**
   - Плагины поддерживают форки (`forkOrigin`)
   - Реакции хранятся как JSON-объекты
   - Звезды - массив ID пользователей
   - Автоматические метки времени (`createdAt`, `updatedAt`)

Для работы с файлами релизов предполагается использование ссылок на файловое хранилище (поле `file` в `pluginRelease`).