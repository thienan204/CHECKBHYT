#!/bin/bash

echo "==================================================="
echo "🚀 BẮT ĐẦU CẬP NHẬT MÃ NGUỒN VÀ DATABASE"
echo "==================================================="

echo ""
echo "📥 Bước 1: Kéo mã nguồn mới nhất từ GitHub (Tự động xử lý xung đột)..."
# Tự động sao lưu an toàn file .env (chứa cấu hình database mật)
if [ -f .env ]; then
  cp .env .env.backup
fi

# Ép đồng bộ mã nguồn 100% giống với Github (Bỏ qua mọi sửa đổi lặt vặt trên server gây nghẽn lệnh pull)
git fetch origin main
git reset --hard origin/main

# Đắp lại file .env vào hệ thống sau khi reset
if [ -f .env.backup ]; then
  mv .env.backup .env
fi
echo ""
echo "🏗️ Bước 2: Build lại hệ thống với Code và Môi trường mới..."
docker compose build --no-cache app

echo ""
echo "🔄 Bước 3: Khởi động lại Server..."
docker compose up -d

echo ""
echo "🗄️ Bước 4: Chạy cấu hình Database (Đẩy cấu trúc bảng mới vào DB)..."
# Ép cấu trúc mới vào CSDL và bỏ qua rác generate do trong build đã có. (Chạy trên container MỚI NHẤT sau khi khởi động)
docker compose exec app npx -y prisma@5.22.0 db push --skip-generate

echo ""
echo "==================================================="
echo "✅ HOÀN TẤT! HỆ THỐNG ĐÃ ĐƯỢC CẬP NHẬT THÀNH CÔNG."
echo "==================================================="


