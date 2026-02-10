## Cấu trúc thư mục

```
backend/
│
├── controllers/     # xử lý logic request/response
├── models/          # Mongoose schemas
├── routes/          # định nghĩa API endpoints
├── middlewares/     # auth, validate, upload, error handler
├── utils/           # helper functions
├── .env
├── server.js        # entry point
└── package.json
```

---

## Cài đặt

### 1. Clone

```bash
git clone <repo-url>
cd backend
```

### 2. Cài package

```bash
npm install
```

### 3. Tạo file .env

```
PORT=5000

MONGO_URI=mongodb+srv://username:password@grave-map.nll0iw2.mongodb.net/?appName=

CLOUDINARY_URL=cloudinary://CLOUDINARY_API_KEY:CLOUDINARY_API_SECRET@CLOUDINARY_CLOUD_NAME

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

JWT_SECRET=

```

### 4. Chạy server

```bash
node server.js
```

Server chạy tại:

```
http://localhost:5000
```

---

## Models chính

### Grave

Thông tin mộ phần

* grave (String)
* generation (Number)
* location (String)
* note (String)
* geom (GeoJSON Point)
* images (Array)
* createdAt / updatedAt

---

### Anniversary

Cache ngày kỵ

* anni_date (String – âm lịch)
* event_name (String)
* next_dates (Array)
* images (Array)
* createdAt / updatedAt

---

## API Endpoints

### Graves

| Method | Endpoint        | Mô tả         |
| ------ | --------------- | ------------- |
| GET    | /api/graves     | Lấy danh sách |
| POST   | /api/graves     | Tạo mới       |
| PUT    | /api/graves/:id | Cập nhật      |
| DELETE | /api/graves/:id | Xóa           |

### Anniversary

| Method | Endpoint        | Mô tả         |
| ------ | --------------- | ------------- |
| GET    | /api/anniversaries     | Lấy danh sách |
| POST   | /api/anniversaries     | Tạo mới       |
| PUT    | /api/anniversaries/:id | Cập nhật      |
| DELETE | /api/anniversaries/:id | Xóa           |


---

### UpcomingAnniversary

| Method | Endpoint                    | Mô tả                  |
| ------ | --------------------------- | ---------------------- |
| GET    | /api/upcoming-anniversaries | Lấy ngày kỵ 7 ngày tới |

---

## Định dạng GeoJSON

```json
{
  "type": "Point",
  "coordinates": [106.123, 10.456]
}
```

---

## Ví dụ request

### Tạo mộ mới

```bash
POST /api/graves
Content-Type: application/json

{
  "grave": "Nguyễn Văn A",
  "generation": 3,
  "location": "Khu A",
  "geom": {
    "type": "Point",
    "coordinates": [106.12, 10.45]
  }
}
```

---

## Tính năng nâng cao

* Cache ngày kỵ tự động mỗi ngày
* Upload nhiều ảnh
* Tối ưu index cho truy vấn vị trí
* Chuẩn GeoJSON để tích hợp MapLibre / Leaflet

---

## Scripts

```bash
npm run dev     # nodemon
npm start       # production
```

---

## Deploy gợi ý

* Render / Railway / VPS
* MongoDB Atlas
* Cloudinary

