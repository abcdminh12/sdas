// FILE: server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();

// Render sẽ cấp PORT qua biến môi trường, nếu không có thì dùng 3000
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "gamedata.json");

// --- CẤU HÌNH ĐƯỜNG DẪN TỚI THƯ MỤC CLIENT ---
// ".." nghĩa là lùi ra 1 cấp, sau đó vào folder "Client"
// LƯU Ý: Nếu thư mục của bạn tên là "client" (chữ thường) thì sửa chữ "Client" bên dưới thành "client"
const CLIENT_PATH = __dirname;

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));

// 1. Cho phép server truy cập các file tĩnh (ảnh, css, js) trong thư mục Client
app.use(express.static(CLIENT_PATH));

// 2. Vẫn giữ dòng này để load file tĩnh trong thư mục Server (nếu cần)
app.use(express.static(__dirname));

// --- HÀM ĐỌC/GHI FILE (GIỮ NGUYÊN) ---
const readData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    try {
      console.log("⚠️ File data chưa có. Đang tạo mới gamedata.json...");
      fs.writeFileSync(DATA_FILE, "{}", "utf-8");
      console.log("✅ Đã tạo file gamedata.json thành công!");
    } catch (err) {
      console.error("❌ LỖI KHÔNG THỂ TẠO FILE DATA:", err);
      return {};
    }
    return {};
  }
  try {
    const content = fs.readFileSync(DATA_FILE, "utf-8");
    return content.trim() ? JSON.parse(content) : {};
  } catch (err) {
    console.error("❌ Lỗi đọc file data, reset data tạm thời.");
    return {};
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Lỗi lưu file:", err);
  }
};

readData();

// --- API ---

app.get("/", (req, res) => {
  // Sửa lại đường dẫn file HTML trỏ vào thư mục Client
  res.sendFile(path.join(CLIENT_PATH, "index.html"));
});

// ... Các API load/save giữ nguyên ...
app.get("/load/:userId", (req, res) => {
  const { userId } = req.params;
  const db = readData();
  if (db[userId]) {
    console.log(`[LOAD] ✅ Tìm thấy save của: ${userId}`);
    res.json({ success: true, data: db[userId] });
  } else {
    console.log(`[LOAD] 🆕 Người chơi mới: ${userId}`);
    res.json({ success: false, message: "New User" });
  }
});

app.post("/save", (req, res) => {
  const { userId, data } = req.body;
  if (!userId || !data) return res.json({ success: false });
  console.log(`[SAVE] 🔄 Đang lưu dữ liệu cho: ${userId}...`);
  const db = readData();
  db[userId] = data;
  writeData(db);
  console.log(`[SAVE] 💾 Đã lưu xong Level ${data.s.lvl}`);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Server đang chạy trên cổng: ${PORT}`);
  console.log(`📂 Client Folder: ${CLIENT_PATH}`);
  console.log(`👉 Truy cập: http://localhost:${PORT}`);
  console.log(`==================================================`);
});