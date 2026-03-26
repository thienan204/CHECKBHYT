#!/bin/bash

echo "==================================================="
echo "🚀 BẮT ĐẦU CẬP NHẬT MÃ NGUỒN VÀ DATABASE"
echo "==================================================="

echo ""
echo "📥 Bước 1: Kéo mã nguồn mới nhất từ GitHub..."
git pull origin main

echo ""
echo "🗄️ Bước 2: Chạy cấu hình Database (Đẩy bảng mới vào DB)..."
# Chạy db push để cấu trúc Database luôn được cập nhật mà không cần file migration
docker compose exec app npx -y prisma@5.22.0 db push

echo ""
echo "🏗️ Bước 3: Cài đặt thư viện mới và Build lại hệ thống..."
docker compose build --no-cache app

echo ""
echo "🔄 Bước 4: Khởi động lại Server..."
docker compose up -d

echo ""
echo "==================================================="
echo "✅ HOÀN TẤT! HỆ THỐNG ĐÃ ĐƯỢC CẬP NHẬT THÀNH CÔNG."
echo "==================================================="