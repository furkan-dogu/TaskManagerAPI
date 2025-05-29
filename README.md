# Task Manager API

Kurumsal görev yönetim sisteminin Express.js tabanlı backend API'sidir. Kullanıcı yönetimi, görev işlemleri ve Excel formatında rapor oluşturma gibi temel işlevleri içerir.


## İçindekiler

- [Kullanılan Teknolojiler](#kullanılan-teknolojiler)
- [Documentation](#documentation)
- [API Endpointleri](#api-endpointleri)
- [Proje Dosya Yapısı](#proje-dosya-yapısı)

## Canlı Demo

[Task Manager API](https://task-manager-api-virid.vercel.app/)

## Kullanılan Teknolojiler

- **Express.js** – RESTful API sunucusu
- **Mongoose** – MongoDB ODM
- **JWT** – Kimlik doğrulama
- **bcryptjs** – Şifreleme
- **multer + streamifier** – Dosya yükleme iş akışı
- **Cloudinary** – Medya depolama çözümü
- **ExcelJS** – Excel dosya üretimi
- **Swagger Autogen** – Otomatik API dokümantasyonu
- **dotenv** – Ortam değişkenleri
- **cors** – Cross-Origin Resource Sharing

### Dokümantasyon

- Swagger UI: [/api/documents/swagger](https://task-manager-api-virid.vercel.app/api/documents/swagger)
- Redoc: [/api/documents/redoc](https://task-manager-api-virid.vercel.app/api/documents/redoc)
- JSON: [/api/documents/json](https://task-manager-api-virid.vercel.app/api/documents/json)

## API Endpointleri

### Auth

- `POST /auth/register` Yeni kullanıcı oluşturur. `profileImageUrl` ile profil resmi yüklenebilir.
- `POST /auth/login` Giriş işlemi yapar, JWT token döner.
- `GET /auth/logout` Kullanıcının oturumunu kapatır.
- `GET /auth/profile` Giriş yapan kullanıcının profil bilgilerini döner. (Korumalı)
- `PUT /auth/profile` Giriş yapan kullanıcı kendi profilini günceller. (Korumalı)

### Users

- `GET /users` Tüm kullanıcıları listeler. (Sadece admin)
- `GET /users/:id` Belirli bir kullanıcıyı detaylarıyla getirir.
- `PUT /users/:id` Kullanıcıyı günceller. (Sadece admin)
- `DELETE /users/:id` Kullanıcıyı siler. (Sadece admin)

### Tasks

- `GET /tasks` Tüm görevleri listeler.
- `GET /tasks/:id` Belirli bir görevi getirir.
- `POST /tasks` Yeni görev oluşturur. (Sadece admin)
- `PUT /tasks/:id` Görevi günceller.
- `DELETE /tasks/:id` Görevi siler. (Sadece admin)
- `PUT /tasks/:id/status` Görev durumunu günceller.
- `PUT /tasks/:id/todo` Yapılacak listesi maddelerini günceller.
- `GET /tasks/dashboard-data` Admin paneli için genel görev istatistiklerini getirir.
- `GET /tasks/user-dashboard-data` Kullanıcı paneli için görev istatistiklerini getirir.

### Reports

- `GET /reports/export/tasks` Tüm görevlerin Excel raporunu indirir. (Sadece admin)
- `GET /reports/export/users` Tüm kullanıcıların Excel raporunu indirir. (Sadece admin)

## Proje Dosya Yapısı

```
Task Manager API 
│
├── src
│    ├── configs
│    │     ├── cloudinary.js
│    │     ├── dbConnection.js
│    │     └── swagger.json
│    ├── controllers
│    │     ├── auth.js              
│    │     ├── report.js     
│    │     ├── task.js     
│    │     └── user.js
│    ├── helpers    
│    │     └── sync.js 
│    ├── lib    
│    │     └── cloudinaryUpload.js 
│    ├── middlewares 
│    │     ├── permissions.js   
│    │     └── upload.js 
│    ├── models                        
│    │     ├── task.js     
│    │     └── user.js
│    └── routes                
│          ├── auth.js         
│          ├── document.js     
│          ├── report.js     
│          ├── task.js     
│          └── user.js
├── .gitignore
├── index.js
├── package-lock.json
├── package.json
├── README.md
├── swaggerAutogen.js
└── vercel.json
```