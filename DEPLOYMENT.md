# Hướng Dẫn Triển Khai (Deployment Guide)

Tài liệu này hướng dẫn cách triển khai ứng dụng **readfilexml** lên server Linux sử dụng Docker và Docker Compose.
*This document guides you on how to deploy the **readfilexml** application to a Linux server using Docker and Docker Compose.*

## 1. Chuẩn Bị Server (Server Preparation)

### Yêu cầu (Requirements)
- Một server chạy Linux (Ubuntu, CentOS, Debian...).
- Chỉ cần cài đặt **Docker** và **Docker Compose**.
- **KHÔNG CẦN** cài đặt Node.js hay PostgreSQL trên máy chủ (chúng sẽ chạy bên trong Docker).
- *A server running Linux (Ubuntu, CentOS, Debian...).*
- *Only **Docker** and **Docker Compose** are required.*
- ***NO NEED** to install Node.js or PostgreSQL on the host machine (they will run inside Docker).*

### Cài đặt Docker (Install Docker)
Nếu chưa có Docker, bạn có thể chạy lệnh sau (Ubuntu):
*If Docker is not installed, you can run the following command (Ubuntu):*

```bash
# Cập nhật hệ thống / Update system
sudo apt-get update

# Cài đặt docker / Install docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Thêm user hiện tại vào nhóm docker (để không cần gõ sudo)
# Add current user to docker group (to avoid typing sudo)
sudo usermod -aG docker $USER
newgrp docker
```
# Cài đặt docker-compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

## 2. Tải Mã Nguồn (Get Source Code)

Bạn có thể clone từ Git hoặc copy file qua SFTP.
*You can clone from Git or copy files via SFTP.*

```bash
git clone https://github.com/thienan204/CHECKBHYT.git
cd CHECKBHYT
```

Nội dung cần thiết trên server:
*Required content on server:*
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `next.config.ts` (đã cấu hình / *configured with* `output: "standalone"`)
- `package.json`
- `public/`
- `prisma/`
- `src/` (hoặc toàn bộ source code / *or the entire source code*)

## 3. Cấu Hình Môi Trường (Environment Configuration)

Tạo file `.env` tại thư mục gốc của dự án.
*Create a `.env` file at the root of the project.*

```bash
cp .env.example .env
nano .env
```

**Nội dung mẫu `.env` cho Docker (Example `.env` content for Docker):**

```env
# Database Configuration for Docker Internal Network
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=mydb

# Database Connection String for Prisma
# Lưu ý/Note: 'db' là tên service trong docker-compose.yml / 'db' is the service name in docker-compose.yml
DATABASE_URL="postgresql://myuser:mypassword@db:5432/mydb?schema=public"

# NextAuth Configuration
NEXTAUTH_URL=http://your-domain-or-ip:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this
```

> [!IMPORTANT]
> Hãy thay đổi `your-super-secret-key-change-this` và thông tin database thành mật khẩu mạnh hơn.
> *Please change `your-super-secret-key-change-this` and database credentials to strong passwords.*

## 4. Khởi Chạy (Start Deployment)

Tại thư mục dự án, chạy lệnh sau để build và khởi động container:
*In the project directory, run the following command to build and start containers:*

```bash
docker compose up -d --build
```

- `-d`: Chạy ngầm (Detached mode).
- `--build`: Build lại image nếu có thay đổi code.

### Kiểm tra trạng thái (Check status)

```bash
docker compose ps
```
Nếu thấy cả `app` và `db` đều `Up`, nghĩa là đã chạy thành công.
*If both `app` and `db` are `Up`, it is running successfully.*

### Xem log (View logs)

```bash
# Xem log của cả 2 service / View logs of both services
docker compose logs -f

# Xem log riêng app / View logs of app only
docker compose logs -f app
```

## 5. Cập Nhật Phiên Bản Mới (Update New Version)

Khi bạn có code mới trên Git, hãy làm theo các bước sau:
*When you have new code on Git, follow these steps:*

1.  Lấy code mới về:
    *Pull new code:*
    ```bash
    git pull
    ```

2.  Build và khởi động lại:
    *Rebuild and restart:*
    ```bash
    docker compose up -d --build
    ```

3.  (Tùy chọn) Xóa image cũ để giải phóng dung lượng:
    *(Optional) Remove old images to free up space:*
    ```bash
    docker image prune -f
    ```

## 6. Migration Database (Database Migration)

Khi `app` khởi động, Prisma thường sẽ cần được chạy migration. Cách đơn giản nhất là chạy lệnh này bên trong container `app`:
*When `app` starts, Prisma usually needs to run migrations. The simplest way is to run this command inside the `app` container:*

```bash
docker compose exec app npx prisma migrate deploy
```

Hoặc nếu bạn muốn reset dữ liệu (Cẩn thận! / Caution!):
*Or if you want to reset data:*
```bash
docker compose exec app npx prisma migrate reset
```
