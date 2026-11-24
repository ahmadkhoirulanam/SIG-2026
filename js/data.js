/*
 * DATA STUDI KASUS — Kualitas Udara & Jumlah Kendaraan Kota Semarang
 * ------------------------------------------------------------------
 * PERHATIAN: angka di bawah ini adalah DATA CONTOH (ilustrasi) agar
 * tampilan dapat berjalan. Ganti dengan data penelitian Anda, misalnya:
 *   - ISPU / konsentrasi PM2.5, PM10, NO2, CO : DLH Kota Semarang / KLHK (ISPU)
 *   - Jumlah kendaraan bermotor            : BPS Kota Semarang / Samsat / Bapenda Jateng
 * Koordinat (lat, lng) adalah titik perkiraan pusat kecamatan.
 */
var SUMBER_DATA = "Data contoh (ilustrasi) — ganti dengan data DLH & BPS Kota Semarang";
var TAHUN_DATA = 2024;

var dataKecamatan = [
    { nama: "Semarang Tengah",  lat: -6.9790, lng: 110.4170, motor: 78000,  mobil: 17000, ispu: 102, polutan: "PM2.5" },
    { nama: "Semarang Utara",   lat: -6.9600, lng: 110.4100, motor: 121000, mobil: 29000, ispu: 98,  polutan: "PM10"  },
    { nama: "Semarang Timur",   lat: -6.9760, lng: 110.4330, motor: 86000,  mobil: 19000, ispu: 88,  polutan: "PM2.5" },
    { nama: "Semarang Selatan", lat: -6.9930, lng: 110.4250, motor: 83000,  mobil: 19000, ispu: 86,  polutan: "PM2.5" },
    { nama: "Semarang Barat",   lat: -6.9800, lng: 110.3850, motor: 166000, mobil: 39000, ispu: 95,  polutan: "PM2.5" },
    { nama: "Gayamsari",        lat: -6.9850, lng: 110.4500, motor: 81000,  mobil: 17000, ispu: 84,  polutan: "PM10"  },
    { nama: "Candisari",        lat: -7.0070, lng: 110.4250, motor: 73000,  mobil: 17000, ispu: 72,  polutan: "PM2.5" },
    { nama: "Gajahmungkur",     lat: -7.0100, lng: 110.4050, motor: 58000,  mobil: 14000, ispu: 66,  polutan: "PM2.5" },
    { nama: "Pedurungan",       lat: -7.0000, lng: 110.4750, motor: 199000, mobil: 46000, ispu: 92,  polutan: "PM2.5" },
    { nama: "Genuk",            lat: -6.9600, lng: 110.4800, motor: 108000, mobil: 22000, ispu: 105, polutan: "PM10"  },
    { nama: "Tembalang",        lat: -7.0550, lng: 110.4400, motor: 172000, mobil: 38000, ispu: 78,  polutan: "PM2.5" },
    { nama: "Banyumanik",       lat: -7.0650, lng: 110.4150, motor: 145000, mobil: 35000, ispu: 70,  polutan: "PM2.5" },
    { nama: "Gunungpati",       lat: -7.0900, lng: 110.3700, motor: 71000,  mobil: 14000, ispu: 48,  polutan: "O3"    },
    { nama: "Mijen",            lat: -7.0500, lng: 110.3100, motor: 58000,  mobil: 12000, ispu: 45,  polutan: "O3"    },
    { nama: "Ngaliyan",         lat: -7.0000, lng: 110.3400, motor: 115000, mobil: 25000, ispu: 74,  polutan: "PM2.5" },
    { nama: "Tugu",             lat: -6.9850, lng: 110.3200, motor: 28000,  mobil: 7000,  ispu: 62,  polutan: "PM10"  }
];

// Tren tahunan tingkat kota (data contoh)
var dataTren = {
    tahun:     [2019, 2020, 2021, 2022, 2023, 2024],
    kendaraan: [1680, 1610, 1705, 1802, 1905, 1984],   // ribu unit
    ispu:      [74,   61,   68,   76,   81,   80]       // rata-rata ISPU tahunan
};

// Kategori ISPU (Permen LHK No. P.14/2020)
var kategoriISPU = [
    { min: 0,   max: 50,  label: "Baik",               warna: "#16A34A", teks: "#fff" },
    { min: 51,  max: 100, label: "Sedang",             warna: "#2563EB", teks: "#fff" },
    { min: 101, max: 200, label: "Tidak Sehat",        warna: "#EAB308", teks: "#1f2937" },
    { min: 201, max: 300, label: "Sangat Tidak Sehat", warna: "#DC2626", teks: "#fff" },
    { min: 301, max: 9999, label: "Berbahaya",         warna: "#111827", teks: "#fff" }
];
