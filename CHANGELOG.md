История обновлений

Все значимые изменения в проекте Метро New International.
Формат основан на Keep a Changelog (https://keepachangelog.com/ru/1.1.0/),
версии — Semantic Versioning (https://semver.org/lang/ru/).

[Unreleased]

Планируется

    Тёмная тема (переключатель ☀/☾)

    Счётчик просмотров новостей

    Топ-5 новостей в аналитике

    AI-помощник (автозаголовки, авто-excerpt)

    Telegram-бот для публикации

[2.0.0] — 2026-11-02

Добавлено

    Многостраничная админка — каждый раздел на своей странице (news/, published/, calendar/, media/, videos/, analytics/, trash/)

    Единый стиль — admin/style.css для всех страниц

    admin/auth.js — проверка 2FA и сессии на каждой странице

    2FA через Supabase MFA — QR + код, AAL2

    Автозагрузка новостей — кнопка вкл/выкл, флаг в app_settings

    Drag-and-drop в календаре — перетаскивание новостей между днями

    Своя обложка видео — загрузка + кроппер

    Drag-and-drop сортировка видео — sort_order

    Корзина — мягкое удаление, восстановление, автоочистка 30 дней

    Аналитика — график публикаций за 30 дней

    Горячие клавиши — N/L/M/V/C/T/A, Ctrl+K, ?, Ctrl+S

Изменено

    Вход: email + пароль → проверка admins → 2FA (если включён)

    Редирект на index.html, если 2FA не пройден

    news — фильтр deleted_at is null для публичного чтения

Исправлено

    handleLogin is not defined — скрипт подключён правильно

    QRCode is not defined — QR генерируется через Supabase MFA

    policy "settings_read_all" already exists — drop policy if exists

    422 при unenroll — проверка factor.status === 'verified'

[1.2.0] — 2026-10-30

Добавлено

    Политика конфиденциальности — help/privacy/

    Условия использования — help/terms/

    Страница исправлений — help/corrections/

    LIVE-блок — прямые трансляции с таймлайном

    Вертикали — короткие видео

Изменено

    Футер — ссылки на правовые документы

    Шапка — навигация с LIVE и Вертикалями

[1.1.0] — 2026-10-28

Добавлено

    Автопубликация в Telegram — publish-news Edge Function

    Автопубликация в Discord — вебхук

    Планирование публикаций — scheduled_at, publish-scheduled

    Медиа-библиотека — загрузка, сжатие, cropper

Исправлено

    chat not found в ТГ — правильный TELEGRAM_CHANNEL_ID

    Unauthorized в cron — заголовок apikey вместо Authorization

[1.0.0] — 2026-10-26

Добавлено

    Запуск сайта — главная, Мир, Технологии, Культура, Спорт, Погода, Другое

    Минималистичный дизайн — Inter, белый фон, один акцент

    Адаптив — телефон, планшет, десктоп

    Тёмная тема — prefers-color-scheme

    Поиск — по заголовкам

    RSS/JSON — сбор новостей (в разработке)

Формат версий

    Major (X.0.0) — несовместимые изменения

    Minor (0.X.0) — новые функции, обратная совместимость

    Patch (0.0.X) — исправления, обратная совместимость

Ссылки

    Keep a Changelog: https://keepachangelog.com/ru/1.1.0/

    Semantic Versioning: https://semver.org/lang/ru/

    README.md

    SECURITY.md

    LICENSE
