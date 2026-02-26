#!/bin/bash

echo "==================================================="
echo "🚀 BẮT ĐẦU CẬP NHẬT MÃ NGUỒN VÀ DATABASE"
echo "==================================================="

echo ""
echo "📥 Bước 1: Kéo mã nguồn mới nhất từ GitHub..."
git pull origin main

echo ""
echo "🏗️ Bước 2: Build lại container ứng dụng (bỏ qua cache để luôn nhận code mới nhất)..."
docker compose build --no-cache app

echo ""
echo "🔄 Bước 3: Khởi động lại hệ thống Docker..."
docker compose up -d

echo ""
echo "🗄️ Bước 4: Chạy cấu hình Database (Prisma Migrate)..."
# Chạy lệnh migrate deploy bên trong container app
docker compose exec app npx -y prisma@5.22.0 migrate deploy

echo ""
echo "==================================================="
echo "✅ HOÀN TẤT! HỆ THỐNG ĐÃ ĐƯỢC CẬP NHẬT THÀNH CÔNG."
echo "==================================================="
