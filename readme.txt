HƯỚNG DẪN CHẠY DỰ ÁN BẰNG DOCKER & DOCKER COMPOSE
===============================================

1. YÊU CẦU
-----------
- Đã cài đặt Docker và Docker Compose trên máy.
- Nếu có sử dụng git submodule, hãy chạy:
  ```bash
  git submodule update --init --recursive
  ```

2. BUILD VÀ CHẠY BẰNG DOCKER COMPOSE
-------------------------------------
- Build toàn bộ các image:
  ```bash
  docker-compose build
  ```

- Khởi động toàn bộ hệ thống:
  ```bash
  docker-compose up -d
  ```

- Xem log một service (ví dụ gateway):
  ```bash
  docker-compose logs gateway
  ```

- Dừng toàn bộ hệ thống:
  ```bash
  docker-compose down
  ```

3. LƯU Ý
--------
- Nếu gặp lỗi port đã được sử dụng, hãy kiểm tra và dừng các container cũ hoặc đổi port trong docker-compose.yaml.
- Nếu thay đổi code hoặc Dockerfile, hãy build lại:
  ```bash
  docker-compose build
  ```

Mọi thắc mắc vui lòng liên hệ quản trị dự án. 