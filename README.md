# Dokumentasi API Amaliah

API backend pencatatan amaliah harian siswa. Semua endpoint berada di bawah `/api`, memakai JSON, dan dilindungi token JWT kecuali login.

## Konvensi

- **Base URL**: `http://127.0.0.1:3000/api` saat pengembangan. Emulator Android memakai `http://10.0.2.2:3000/api`.
- **Autentikasi**: kirim header `Authorization: Bearer <token>` di semua endpoint selain login.
- **Respons sukses**: `{ "success": true, "message": "...", "data": ... }`. Field `message` hanya ada di sebagian respons.
- **Respons gagal**: `{ "success": false, "message": "alasan" }`.
- **Tanggal**: teks `YYYY-MM-DD`, dihitung menurut WIB (Asia/Jakarta).
- **Id**: id user berupa teks UUID. Id lain (cabang, kelas, semester, item, entri) berupa angka.
- **Daftar user** memakai paginasi: `data.data` berisi baris, `data.pagination` berisi `total`, `page`, `limit`, `totalPages`.

## Kode status

| Kode | Arti |
| --- | --- |
| 200, 201 | Berhasil. 201 untuk data baru. |
| 400 | Input tidak valid atau melanggar aturan, misalnya melewati batas pengisian mundur. |
| 401 | Token tidak ada, salah, atau kedaluwarsa, atau akun tidak aktif. |
| 403 | Peran tidak diizinkan untuk endpoint ini. |
| 404 | Data tidak ada, atau milik cabang lain. Sengaja disamakan agar keberadaan data tidak bocor. |
| 409 | Bentrok dengan aturan unik di database, misalnya nama item ganda dalam satu cabang. |

## Peran dan akses

| Peran | Cakupan | Yang bisa dilakukan |
| --- | --- | --- |
| ADMIN | Semua cabang | Kelola cabang, semua user, template item, dan periode Ramadhan. Melihat semuanya. |
| ADMIN\_SEKOLAH | Cabangnya | Kelola user (guru, siswa, kepala sekolah), kelas, semester, dan item cabang. Melihat verifikasi dan rekap. |
| KEPALA\_SEKOLAH | Cabangnya | Hanya membaca verifikasi dan rekap. |
| GURU | Kelas yang diwalikan | Melihat entri siswa, memverifikasi, dan melihat rekap kelasnya. |
| SISWA | Dirinya sendiri | Mengisi form harian dan melihat riwayat. |

## Aturan penting

- **Satu akun, satu cabang.** Semua peran kecuali ADMIN terikat ke satu cabang lewat `branchId`.
- **Item per cabang.** Item dengan `branchId` kosong adalah template pusat. Admin sekolah menyalinnya ke cabang lewat `POST /amaliah-items/import-template`, lalu mengubahnya sendiri.
- **Semester per cabang.** Semester sebuah entri ditentukan dari tanggalnya, bukan dari semester yang sedang aktif.
- **Item Ramadhan** muncul otomatis di form pada tanggal yang masuk periode Ramadhan, yang diisi admin pusat.
- **Pengisian mundur** dibatasi 7 hari. Tanggal yang belum tiba ditolak.
- **Entri yang sudah diverifikasi terkunci.** Siswa tidak bisa mengubahnya.
- **Skor otomatis.** Persentase item ceklis yang dijawab ya dari seluruh ceklis di form, dihitung saat siswa menyimpan. Item angka dan teks tidak dihitung.
- **Data lintas cabang** dibalas 404, bukan 403.

## Auth

| Method | Path | Akses | Keterangan |
| --- | --- | --- | --- |
| POST | `/auth/login` | Publik | Body `{ "username", "password" }`. Token ada di `data.token`. |
| GET | `/auth/me` | Semua peran | Profil user yang sedang login. |

Endpoint ganti password ada di `auth.routes.js`. Cek method dan body-nya di sana sebelum dipakai.

## Cabang

Hanya ADMIN.

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/branches` | Daftar cabang. |
| POST | `/branches` | Body `{ "name", "address"? }`. |
| GET | `/branches/:id` | Detail cabang. |
| PATCH | `/branches/:id` | Ubah `name`, `address`, atau `isActive`. |
| DELETE | `/branches/:id` | Menonaktifkan cabang, tidak menghapus. |
| DELETE | `/branches/destroy/:id` | Menghapus cabang permanen jika tidak memiliki data terkait. |

## Pengguna

Akses: ADMIN dan ADMIN\_SEKOLAH. Admin sekolah hanya melihat dan mengubah user di cabangnya.

| Method | Path | Keterangan |
| --- | --- | --- |
| POST | `/users` | Membuat user. |
| GET | `/users` | Daftar user. Query: `role`, `search`, `branchId` (hanya ADMIN), `page`, `limit`. |
| GET | `/users/:id` | Detail user. |
| PATCH | `/users/:id` | Ubah user. |
| DELETE | `/users/:id` | Menonaktifkan user. Tidak bisa menonaktifkan akun sendiri. |
| DELETE | `/users/destroy/:id` | Menghapus user permanen jika tidak memiliki data terkait. Tidak bisa menghapus akun sendiri. |

Body `POST /users` (untuk akun yang dapat login; siswa dikelola melalui `/students`):

- `name`, `username` (minimal 3 karakter), `password` (minimal 8 karakter), dan `role` wajib.
- `branchId` wajib untuk peran bercabang saat ADMIN yang membuat. Untuk ADMIN\_SEKOLAH, nilainya diabaikan dan dipaksa ke cabang sendiri.
- `nip` opsional untuk GURU.
- ADMIN\_SEKOLAH hanya boleh membuat GURU dan KEPALA\_SEKOLAH.

Body `PATCH /users/:id`: `name`, `username`, `password`, `isActive`, `nis`, `nip`. Field `role` dan `branchId` hanya berlaku jika yang mengubah adalah ADMIN.

## Siswa

Siswa bukan akun login dan tidak dibuat melalui `/users`. Endpoint berikut mengelola data siswa tanpa membuat record `User`:

| Method | Path | Keterangan |
| --- | --- | --- |
| POST | `/students` | Membuat siswa dengan `name`, `nis`, `branchId`, dan `classId` opsional. |
| GET | `/students` | Daftar siswa. |
| PATCH | `/students/:id` | Mengubah data siswa. |
| DELETE | `/students/:id` | Menonaktifkan siswa. |
| DELETE | `/students/destroy/:id` | Menghapus siswa permanen jika tidak memiliki data terkait. |

## Kelas

Baca: ADMIN, ADMIN\_SEKOLAH, GURU, KEPALA\_SEKOLAH. Tulis: ADMIN dan ADMIN\_SEKOLAH. Admin sekolah hanya mengelola kelas cabangnya.

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/classes` | Daftar kelas, dibatasi cabang. |
| GET | `/classes/:id` | Detail kelas. |
| POST | `/classes` | Membuat kelas. Field: `name`, `gradeLevel`, `homeroomTeacherId`. |
| POST | `/classes/:id/students` | Memasukkan siswa ke kelas. Siswa harus satu cabang dengan kelas. |

Ubah dan hapus kelas mengikuti `classes.routes.js`.

## Semester

Semester dimiliki satu cabang. Dalam satu cabang hanya satu semester yang aktif.

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/semesters` | Daftar semester, dibatasi cabang. ADMIN boleh memakai `?branchId=`. |
| GET | `/semesters/active` | Semester aktif. |
| POST | `/semesters` | Field: `academicYear`, `term` (GANJIL atau GENAP), `startDate`, `endDate`, `isActive`. |

Ubah dan hapus semester mengikuti `semesters.routes.js`.

## Periode Ramadhan

Global untuk semua cabang. Hanya ADMIN yang menulis.

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/ramadhan-periods` | Daftar periode. |
| GET | `/ramadhan-periods/check?date=YYYY-MM-DD` | Apakah tanggal itu masuk Ramadhan. |
| POST | `/ramadhan-periods` | Field: `hijriYear`, `startDate`, `endDate`. |

## Item amaliah

Item dengan `branchId` kosong adalah template pusat. Item cabang dibuat dengan menyalin template atau menambah manual.

| Method | Path | Akses | Keterangan |
| --- | --- | --- | --- |
| GET | `/amaliah-items` | Semua peran bercabang | Query: `branchId` (hanya ADMIN), `isRamadhan`, `isActive`. ADMIN tanpa `branchId` melihat template. |
| GET | `/amaliah-items/:id` | Sama | Detail item. |
| POST | `/amaliah-items` | ADMIN, ADMIN\_SEKOLAH | Admin sekolah selalu membuat di cabangnya. ADMIN tanpa `branchId` membuat template. |
| PATCH | `/amaliah-items/:id` | ADMIN, ADMIN\_SEKOLAH | Item tidak bisa dipindah cabang. |
| DELETE | `/amaliah-items/:id` | ADMIN, ADMIN\_SEKOLAH | Menonaktifkan item agar riwayat isian tetap utuh. |
| DELETE | `/amaliah-items/destroy/:id` | ADMIN, ADMIN\_SEKOLAH | Menghapus item permanen jika tidak dipakai pada riwayat isian. |
| POST | `/amaliah-items/import-template` | ADMIN, ADMIN\_SEKOLAH | Menyalin template ke cabang. ADMIN mengirim `{ "branchId" }`. Respons: `copied` dan `skipped`. |

Field item: `name`, `category`, `inputType` (CHECKLIST, NUMBER, TEXT, atau RADIO), `unit`, `options` (array pilihan untuk RADIO), `isRamadhan`, `isActive`, `sortOrder`.

## Form harian siswa

Hanya SISWA. Item yang tampil dan boleh diisi hanya item aktif di cabang siswa. Item Ramadhan ikut tampil pada tanggal Ramadhan.

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/entries/form?date=YYYY-MM-DD` | Form untuk tanggal itu. Tanpa `date` berarti hari ini. |
| PUT | `/entries/:date` | Menyimpan isian. Menyimpan ulang menimpa isian lama. |
| GET | `/entries` | Riwayat, urut dari yang terbaru. Query: `semesterId`, `from`, `to`. |

Respons `GET /entries/form`, field di dalam `data`:

- `date`, `isRamadhan`, `semester`, `canEdit`, `lockReason`, `notes`, `score`, `verification`.
- `items`: daftar item. Tiap item berisi `id`, `name`, `category`, `inputType`, `unit`, dan `value` (`boolValue`, `numberValue`, `textValue`, atau `null` jika belum diisi).

Body `PUT /entries/:date`:

```json
{
  "notes": "Alhamdulillah lancar",
  "details": [
    { "itemId": 13, "boolValue": true },
    { "itemId": 19, "numberValue": 5 }
  ]
}
```

Aturan nilai per `inputType`: CHECKLIST memakai `boolValue` (true atau false), NUMBER memakai `numberValue` (angka, tidak negatif), TEXT dan RADIO memakai `textValue`. Nilai RADIO harus salah satu dari `options` item. Satu item tidak boleh dikirim dua kali. Respons PUT berisi form terbaru, termasuk `score`.

## Verifikasi

Pembacaan: ADMIN, ADMIN\_SEKOLAH, KEPALA\_SEKOLAH, dan GURU. Memverifikasi dan menghapus verifikasi: GURU wali kelas saja.

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/verifications/entries` | Daftar entri. Query: `classId`, `date`, atau `from` dan `to`. Tanpa tanggal berarti hari ini. |
| GET | `/verifications/entries/:entryId` | Detail entri beserta isian dan nama item. |
| PUT | `/verifications/entries/:entryId` | Body `{ "status", "note"? }`. `status` bernilai VERIFIED atau REJECTED. `note` wajib jika REJECTED (maksimal 500 karakter). |
| DELETE | `/verifications/entries/:entryId` | Menghapus verifikasi. |

Guru hanya melihat entri siswa di kelas yang dia wali. Admin sekolah dan kepala sekolah melihat entri di cabangnya.

## Rekap semester

Akses: ADMIN, ADMIN\_SEKOLAH, KEPALA\_SEKOLAH, GURU. Hanya membaca.

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/reports/semester?semesterId=ID&classId=ID` | `semesterId` wajib, `classId` opsional. |

Satu baris per siswa: `studentId`, `nis`, `name`, `class`, `totalEntries`, `verified`, `rejected`, `checklistPercent`, `numberTotal`, `averageScore`. Semester harus milik cabang user, kecuali ADMIN.
