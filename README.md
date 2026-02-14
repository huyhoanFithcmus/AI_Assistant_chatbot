# 🤖 AI 3D Virtual Assistant (Trợ lý ảo 3D thông minh)

![Project Status](https://img.shields.io/badge/Status-Development-green)
![Tech Stack](https://img.shields.io/badge/Three.js-R3F-black)
![AI Model](https://img.shields.io/badge/AI-Gemini%20Flash-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

> **Đồ án Cao học - Trường Đại học Công nghệ Thông tin (UIT - VNUHCM)** > **Tác giả:** HoanNH

## 📖 Giới thiệu

Dự án này là một **Trợ lý ảo 3D tương tác thực (Real-time Interactive 3D Avatar)** chạy trên nền tảng Web. Hệ thống kết hợp sức mạnh của **Google Gemini API** (để xử lý ngôn ngữ tự nhiên và cảm xúc) với **Three.js** (để hiển thị đồ họa 3D).

Nhân vật không chỉ trả lời câu hỏi bằng văn bản mà còn có khả năng:
* 🗣️ **Nói chuyện** (Text-to-Speech) với giọng điệu tùy chỉnh.
* 👄 **Nhép miệng** (Lip-sync) theo thời gian thực.
* 😊 **Biểu lộ cảm xúc** (Vui, buồn, ngạc nhiên...) dựa trên ngữ cảnh câu trả lời.
* 💃 **Thực hiện hành động** (Idle, cử động tay chân, thở) một cách tự nhiên.

## 🚀 Tính năng nổi bật

* **Trí tuệ nhân tạo (LLM):** Sử dụng `gemini-1.5-flash` (hoặc 2.5) với kỹ thuật *System Instruction* để trả về dữ liệu chuẩn JSON (Text + Emotion + Action).
* **3D Rendering:** Hiển thị nhân vật định dạng `.vrm` (VRM 1.0/0.0) trực tiếp trên trình duyệt.
* **Procedural Animation:** * Tự động xử lý tư thế đứng (Idle) tự nhiên, khắc phục lỗi T-Pose mặc định của VRM.
    * Mô phỏng nhịp thở và chớp mắt bằng thuật toán hình sin (Sine wave).
* **Voice Interaction:** Tích hợp Web Speech API, tùy chỉnh Pitch/Rate để tạo giọng nói phong cách Anime/Cute.
* **Giao diện (UI/UX):** Thiết kế Glassmorphism (hiệu ứng kính) hiện đại, hỗ trợ Background full màn hình và Responsive trên mobile.

## 🛠️ Công nghệ sử dụng

* **Frontend:** HTML5, CSS3, JavaScript (ES6 Modules).
* **3D Engine:** [Three.js](https://threejs.org/)
* **Model Loader:** [@pixiv/three-vrm](https://github.com/pixiv/three-vrm) (Xử lý nhân vật VRM).
* **AI Brain:** [Google Generative AI SDK](https://ai.google.dev/) (Gemini API).
* **Build Tool:** [Vite](https://vitejs.dev/).

## ⚙️ Cài đặt và Chạy dự án

### 1. Yêu cầu tiên quyết
* Node.js (phiên bản 16 trở lên).
* Một API Key từ [Google AI Studio](https://aistudio.google.com/).

### 2. Cài đặt

Clone dự án về máy:
```bash
git clone [https://github.com/username/ai-3d-assistant.git](https://github.com/username/ai-3d-assistant.git)
cd ai-3d-assistant

```

Cài đặt các thư viện (dependencies):

```bash
npm install

```

### 3. Cấu hình

Mở file `src/main.js`, tìm dòng khai báo API Key và thay thế bằng key của bạn:

```javascript
const API_KEY = "YOUR_GEMINI_API_KEY_HERE";

```

### 4. Chạy dự án

Khởi động server phát triển (Development Server):

```bash
npm run dev

```

Truy cập vào đường dẫn hiện ra trên terminal (thường là `http://localhost:5173`).

## 📂 Cấu trúc thư mục

```
ai-3d-assistant/
├── public/
│   └── AI_Assistant.vrm   # File người mẫu 3D (đặt ở đây)
├── src/
│   └── main.js            # Logic chính (Three.js + Gemini + Speech)
├── index.html             # Giao diện người dùng
├── package.json           # Khai báo thư viện
└── vite.config.js         # Cấu hình Vite

```

## 🧩 Cách hoạt động (Technical Flow)

1. **Input:** Người dùng nhập liệu qua khung chat hoặc giọng nói.
2. **Processing:** * Gửi prompt đến Gemini API.
* Gemini phân tích và trả về JSON: `{ "text": "...", "emotion": "happy" }`.


3. **Visual Output:**
* Hệ thống cập nhật `expressionManager` của nhân vật (thay đổi khuôn mặt).
* Kích hoạt Animation tương ứng.


4. **Audio Output:**
* Web Speech API đọc văn bản.
* Hàm `animate()` tính toán độ mở miệng (`aa` viseme) dựa trên trạng thái nói.



## 🐛 Các vấn đề đã xử lý (Troubleshooting)

* **Lỗi T-Pose:** Đã sử dụng kỹ thuật can thiệp trực tiếp vào xương (`humanoid.getRawBoneNode`) để ép nhân vật hạ tay và đứng tự nhiên.
* **Giọng đọc:** Đã cấu hình ưu tiên giọng nữ tiếng Anh/Việt và tăng Pitch để giọng nói dễ thương hơn.
* **VRM Version:** Hỗ trợ tốt cả VRM 0.0 và VRM 1.0.

## 🤝 Đóng góp

Dự án này phục vụ mục đích nghiên cứu và học tập. Mọi đóng góp vui lòng tạo Pull Request.

## 📜 Giấy phép

Dự án thuộc quyền sở hữu của **HoanNH (UIT)**.
