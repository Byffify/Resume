# Borworn — Vite + React + TypeScript

หน้าเว็บบน Vercel ใช้ Supabase สำหรับข้อมูลและล็อกอินเจ้าของ
หน้าตาเว็บและ editor ใช้ชุดเดิม ไม่ต้องรัน API แยกหรือใช้ Cloudflare

## 1. ตั้งค่า Supabase

1. สร้างโปรเจกต์ Supabase
2. เปิด SQL Editor แล้วรัน `supabase/schema.sql` ทั้งไฟล์ เพื่อสร้างตาราง, validation, trigger และ RLS
3. ใน Authentication → Users สร้างผู้ใช้เจ้าของด้วยอีเมล/รหัสผ่านและยืนยันอีเมลของบัญชีนั้น
4. คัดลอก User ID (UUID) ของผู้ใช้ที่สร้าง
5. เปิด `supabase/set-owner.sql` แทน `REPLACE_WITH_OWNER_USER_ID` ด้วย UUID นั้น แล้วรันใน SQL Editor
6. ในการตั้งค่า Authentication ปิดการสมัครสมาชิกใหม่ หากมีคุณเป็นผู้ใช้เพียงคนเดียว
7. ตั้ง Site URL เป็นโดเมนจริงของ Vercel; หากใช้งาน email recovery ในอนาคต ให้ตั้ง redirect URLs ให้ตรงกับ flow ที่เพิ่มด้วย

`schema.sql` รันซ้ำได้โดยไม่ล้างข้อมูล การรันซ้ำไม่ได้เปลี่ยนเจ้าของ
ระบบไม่มีเจ้าของโดยอัตโนมัติ ต้องรัน `set-owner.sql` เท่านั้น
แม้เปิดสมัครสมาชิก บัญชีใหม่ก็ไม่ได้สิทธิ์ Owner
หากต้องการเปลี่ยนเจ้าของ ให้รัน `set-owner.sql` ใหม่ด้วย UUID บัญชีใหม่

กฎข้อมูล:
- ทุกคนอ่านโปรไฟล์ ผลงาน และบทความที่เผยแพร่ได้
- เฉพาะบัญชีเจ้าของอ่าน draft และเพิ่ม/แก้/ลบบทความได้
- เฉพาะเจ้าของบันทึกโปรไฟล์/ผลงานได้
- บัญชีในเบราว์เซอร์แก้ตารางกำหนดเจ้าของไม่ได้
- ID และชนิดบทความเปลี่ยนไม่ได้ วันที่เผยแพร่ครั้งแรกยังคงเดิมหลังแก้ไขหรือถอนเผยแพร่

## 2. ตั้งค่าในเครื่อง

ใช้ Node.js 22.13+ แล้วติดตั้ง:

```sh
npm install
```

คัดลอก `.env.example` เป็น `.env.local` (หากมีอยู่แล้ว ให้เติมค่าในไฟล์นั้น)
นำ Project URL และ publishable key จากหน้าตั้งค่า API ของ Supabase มาใส่:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

ใช้ legacy anon key แทน publishable key ได้ แต่ห้ามใช้ secret/service_role key
ตัวแปร `VITE_*` อยู่ใน JavaScript ที่ผู้เข้าชมอ่านได้ สิทธิ์ข้อมูลถูกบังคับด้วย RLS
ไม่ต้องใส่รหัสผ่านเจ้าของหรือ Owner ID ใน environment ของ frontend

```sh
npm run dev
```

หลังเปลี่ยน `.env.local` ต้องเริ่ม dev server ใหม่
หากยังไม่ใส่ค่า เว็บจะแสดงหน้าตั้งค่าการเชื่อมต่อ ไม่มีโหมดล็อกอินจำลอง
กด Owner หรือเข้า `/admin` แล้วใช้บัญชีที่สร้างใน Supabase เข้าสู่ระบบ
บัญชีอื่นจะเห็นข้อความไม่มีสิทธิ์ ส่วนผู้ที่ยังไม่ได้ล็อกอินจะเห็นฟอร์ม login
หน้าเว็บยังไม่มีระบบสมัครสมาชิกหรือ reset password; จัดการบัญชีผ่าน Supabase Dashboard

## 3. Deploy บน Vercel

1. นำ repository เข้า Vercel (หรือใช้ Vercel CLI กับโฟลเดอร์นี้)
2. เลือก Framework `Vite`, Build Command `npm run build`, Output Directory `dist`
3. ตั้ง Environment Variables ทั้งสองค่าด้านบนสำหรับ Production และ Preview ที่ต้องการใช้
4. Deploy; ถ้าเปลี่ยน environment หลัง deploy ต้อง redeploy เพื่อ build ค่าลง frontend ใหม่
5. อัปเดต Site URL ใน Supabase ให้ตรงกับ URL จริง

`vercel.json` เตรียม SPA rewrite แล้ว รองรับการเปิดหรือรีเฟรช `/admin`, `/about`, `/notes/...` โดยตรง
อย่าชี้ preview deployment ไปฐานข้อมูลจริงหากจะทดลองแก้/เผยแพร่ข้อมูล

## ไฟล์หลัก

```text
src/
  main.tsx             เริ่ม React
  App.tsx              สถานะล็อกอินและการโหลดข้อมูล
  pages/Content.tsx    หน้าเว็บเดิม
  pages/Login.tsx      ฟอร์มล็อกอินเจ้าของ
  components/admin.tsx     editor
  components/profile-form.tsx  ฟอร์มโปรไฟล์/ผลงาน
  lib/supabase.ts      Supabase client
  lib/store.ts         อ่าน/บันทึกข้อมูล
  lib/validation.ts    ตรวจข้อมูลฟอร์ม
  lib/content.ts       types และโปรไฟล์เริ่มต้น
  index.css            สไตล์เดิม
supabase/
  schema.sql           ตาราง สิทธิ์ และกฎข้อมูลฝั่งฐานข้อมูล
  set-owner.sql        กำหนดเจ้าของผ่าน SQL Editor เท่านั้น
public/                รูปและ favicon
vercel.json            การ build และ routing ของ Vercel
```

## ตรวจสอบ

```sh
npm run lint
npm run build
npm test
npm run preview
```

`npm test` ทดสอบ SQL จริงด้วย PostgreSQL ในหน่วยความจำ (PGlite) โดยจำลอง role ของ Supabase
ทดสอบ RLS, validation, publish/unpublish และวันที่เผยแพร่ ไม่แตะ Supabase จริงหรือข้อมูลในเครื่อง
หลังตั้งค่าโปรเจกต์จริง ให้ทดสอบ login/save/logout และการอ่านบทความจากหน้าต่างไม่ระบุตัวตนอีกครั้ง
การทดสอบในเครื่องไม่ได้ทดสอบบริการ Supabase Auth หรือ deployment ของ Vercel

## ข้อมูลเดิมและสำรอง

ข้อมูล D1 เดิมใน `.wrangler/state` ยังเก็บไว้ ไม่มีการลบหรืออัปโหลดอัตโนมัติ
หากมีเนื้อหาเดิม ต้องย้ายเข้า Supabase ก่อนใช้งานจริง; โค้ดนี้ไม่ได้เชื่อมกับ D1 อีกต่อไป
การนำเข้าบทความเดิมควรวางแผนเก็บ UUID และ timestamp เดิม โดยทำผ่าน SQL Editor
เพราะ trigger ปกติจะตั้งวันที่สร้างและวันที่เผยแพร่ให้อัตโนมัติ

`outputs/original-source.zip` เก็บซอร์สต้นฉบับ และ `outputs/pre-supabase.zip` เก็บหลังบ้านก่อนย้าย
ดูสิทธิ์การใช้ UI ที่ `WATERMELON-LICENSE.txt` และ `vendor/`

อ้างอิง: https://supabase.com/docs/guides/database/postgres/row-level-security
และ https://vercel.com/docs/frameworks/frontend/vite
