# Stage 1: Build
FROM node:18-alpine AS builder

# ตั้งค่า working directory ใน container
WORKDIR /app

# คัดลอกไฟล์ package.json และ package-lock.json
COPY package*.json ./

# ติดตั้ง dependencies ทั้งหมด (รวมถึง devDependencies ที่จำเป็นตอน build)
RUN npm ci

# คัดลอกซอร์สโค้ดทั้งหมด
COPY . .

# คอมไพล์ TypeScript ให้กลายเป็น JavaScript ในโฟลเดอร์ /dist
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# คัดลอกเฉพาะ package.json และ package-lock.json
COPY package*.json ./

# ติดตั้งเฉพาะ dependencies ที่ใช้ใน production เท่านั้น (ไม่รวม devDependencies)
RUN npm ci --only=production

# คัดลอกไฟล์ที่ถูก build เรียบร้อยแล้วจาก Stage 1 (builder)
COPY --from=builder /app/dist ./dist

# เปิดพอร์ต 3000
EXPOSE 3000

# รันแอปพลิเคชัน
CMD ["node", "dist/main"]
