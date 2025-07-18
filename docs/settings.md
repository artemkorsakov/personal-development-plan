# 📌 Настройки системы

## 🌐 Язык интерфейса

**Локализация** определяется автоматически на основе:  
`Общие настройки Obsidian → Язык`.  
Поддерживаемые языки:

- **English** (по умолчанию)
- **Русский**

_Примечание:_ Все тексты внутри плагина (уведомления, названия кнопок) будут переведены согласно выбранному языку.

## ⚙️ Общие настройки

### 📂 Путь к папке задач

- **Что это?**  
  Указывает, где хранятся файлы задач в вашем хранилище Obsidian.

- **Рекомендуемые значения:**  
    - `PersonalDevelopmentPlan` – папка по умолчанию  
    - `Projects/Tasks` – пример альтернативного пути

- **Важно:**
	- Поддерживает вложенные папки (например `Area/Development`)
	- Чувствителен к регистру на Linux/macOS
	- Не требует завершающего слеша

### 🔢 Максимум активных задач

- **Что это?**  
  Лимит одновременно выполняемых задач (со статусом "В работе").

- **Как работает?**  
  При попытке добавить новую задачу сверх лимита:  
  → Показывает предупреждение:  
  `"Слишком много задач в работе! Верните часть из них в очередь."`

- **Рекомендуемые значения:**  
  `3-5 задач` – оптимально для фокусировки.  
  `1-10` – допустимый диапазон.

- **Зачем нужно?**  
  Психологически обоснованное ограничение для:
	- Снижения стресса и риска выгорания
	- Повышения эффективности обучения
	- Улучшения концентрации на приоритетах

### 📅 Начало отсчёта статистики

- **Что это?**  
  Дата, с которой система начинает собирать аналитику по вашей продуктивности.

- **Как используется?**
	1. Рассчитывает **среднюю скорость выполнения задач**
	2. Строит **прогнозы** для будущих задач
	3. Формирует **персональные рекомендации**

- **Пример:**  
  Если вы обычно завершаете 5 задач в неделю, система предложит:  
  → Реалистичные сроки для новых задач  
  → Предупредит о перегрузке

- **По умолчанию:**  
  Дата установки плагина (можно изменить вручную).

## 📚 Типы материалов

### 🏷️ Стандартные типы

Предустановленные варианты (можно редактировать/отключать):

- Книга
- Статья
- Видео
- Подкаст
- Курс

### ⚡ Возможности:

1. **Редактирование:**
	- Изменение названия типа (например, переименовать "Видео" → "Лекция")
	- Включение/отключение отображения в интерфейсе (чекбокс)

2. **Гибкий порядок:**  
   Перетаскивайте типы в нужной последовательности — так они будут отображаться в списках.

3. **Чеклисты:**  
   Для каждого типа можно задать шаблонные пункты, которые автоматически добавляются при создании задачи.

   _Пример для типа "Курс":_
	- Пройти модуль 1
	- Выполнить практическое задание
	- Сделать заметки

### ➕ Добавление своего типа

1. Нажмите `+ Новый тип`
2. Заполните параметры:
	- **Название** (например, "Вебинар")
	- **Чеклист** (опционально)
3. Настройте видимость и порядок.

## 📂 Разделы

### 🗂️ Базовая функциональность

- **Создание неограниченного числа разделов**  
  Примеры:
	- "Программирование"
	- "Иностранные языки"
	- "Личное развитие"

- **Гибкая сортировка:**  
  Перетаскивайте разделы в нужной последовательности.

- **Использование:**  
  Разделы помогают группировать задачи по темам для удобного планирования.

## 🔄 Периодические задачи

### 📅 Поддерживаемые периоды

| Период        | Автовключение | Примеры задач                                    |
|---------------|---------------|--------------------------------------------------|
| Ежедневно     | ✅             | Утренний ритуал, Чтение 10 страниц               |
| Еженедельно   | ✅             | Обзор целей, Уборка рабочего пространства        |
| Ежемесячно    | ✅             | Анализ прогресса, Планирование следующего месяца |
| Ежеквартально | ✅             | Ревизия навыков, Обновление резюме               |
| Ежегодно      | ✅             | Глобальные цели, Подведение итогов года          |

### 🛠️ Управление задачами

- **Добавление:**  
  Кнопка `+ Добавить задачу` под каждым периодом.

- **Удаление:**  
  Нажмите `×` рядом с ненужной задачей.

- **Особенности:**
	- Задачи можно редактировать в любой момент
	- Поддержка markdown-форматирования в описаниях

## 💡 Советы по использованию

1. **Для новичков:**  
   Начните с 3-4 активных задач.

2. **Чеклисты материалов:**  
   Заранее настройте шаблоны для часто используемых типов — это сэкономит время.

3. **Периодические задачи:**  
   Используйте для формирования привычек (например, ежедневное повторение слов).

4. **Разделы:**  
   Создавайте тематические группы для сложных проектов (например, "Изучение Scala → Подпроект: Cats Effect").
