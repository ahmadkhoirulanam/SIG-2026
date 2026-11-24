/* WebGIS Kualitas Udara & Kendaraan Kota Semarang */
(function () {
    "use strict";

    var fmt = function (n) { return n.toLocaleString("id-ID"); };

    function kategori(ispu) {
        for (var i = 0; i < kategoriISPU.length; i++) {
            if (ispu <= kategoriISPU[i].max) return kategoriISPU[i];
        }
        return kategoriISPU[kategoriISPU.length - 1];
    }

    // Lengkapi data turunan
    dataKecamatan.forEach(function (d) {
        d.total = d.motor + d.mobil;
        d.kat = kategori(d.ispu);
    });

    var n = dataKecamatan.length;
    var totalKendaraan = dataKecamatan.reduce(function (s, d) { return s + d.total; }, 0);
    var rataISPU = Math.round(dataKecamatan.reduce(function (s, d) { return s + d.ispu; }, 0) / n);

    // Korelasi Pearson & regresi linear (x = kendaraan ribu, y = ISPU)
    var xs = dataKecamatan.map(function (d) { return d.total / 1000; });
    var ys = dataKecamatan.map(function (d) { return d.ispu; });
    var mx = xs.reduce(function (a, b) { return a + b; }) / n;
    var my = ys.reduce(function (a, b) { return a + b; }) / n;
    var sxy = 0, sxx = 0, syy = 0;
    for (var i = 0; i < n; i++) {
        sxy += (xs[i] - mx) * (ys[i] - my);
        sxx += (xs[i] - mx) * (xs[i] - mx);
        syy += (ys[i] - my) * (ys[i] - my);
    }
    var r = sxy / Math.sqrt(sxx * syy);
    var slope = sxy / sxx;
    var intercept = my - slope * mx;

    function tafsirR(r) {
        var a = Math.abs(r);
        var kekuatan = a < 0.2 ? "sangat lemah" : a < 0.4 ? "lemah" : a < 0.6 ? "sedang" : a < 0.8 ? "kuat" : "sangat kuat";
        return "Korelasi " + (r >= 0 ? "positif " : "negatif ") + kekuatan;
    }

    // ---------- Statistik ringkas (diisi sebelum counter-up berjalan) ----------
    function setText(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }
    setText("stat-kecamatan", n);
    setText("stat-kendaraan", Math.round(totalKendaraan / 1000));
    setText("stat-ispu", rataISPU);
    setText("stat-korelasi", Math.round(r * 100));
    setText("korelasi-r", r.toFixed(3));
    setText("korelasi-r2", (r * r).toFixed(3));
    setText("korelasi-tafsir", tafsirR(r));
    setText("regresi-persamaan", "ISPU = " + intercept.toFixed(2) + " + " + slope.toFixed(3) + " × (kendaraan dalam ribu)");
    setText("sumber-data", SUMBER_DATA);
    setText("tahun-data", TAHUN_DATA);

    var tertinggi = dataKecamatan.slice().sort(function (a, b) { return b.ispu - a.ispu; })[0];
    var terpadat = dataKecamatan.slice().sort(function (a, b) { return b.total - a.total; })[0];
    setText("ispu-tertinggi", tertinggi.nama + " (ISPU " + tertinggi.ispu + ")");
    setText("kendaraan-tertinggi", terpadat.nama + " (" + fmt(terpadat.total) + " unit)");

    // ---------- Dropdown kecamatan ----------
    var urutNama = dataKecamatan.slice().sort(function (a, b) { return a.nama.localeCompare(b.nama); });
    var select = document.getElementById("pilih-kecamatan");
    if (select) {
        urutNama.forEach(function (d) {
            var o = document.createElement("option");
            o.value = d.nama; o.textContent = d.nama;
            select.appendChild(o);
        });
    }

    // ---------- Legenda ISPU ----------
    var legendaEl = document.getElementById("legenda-ispu");
    if (legendaEl) {
        legendaEl.innerHTML = kategoriISPU.map(function (k) {
            var rentang = k.max > 1000 ? "> 300" : k.min + " – " + k.max;
            return '<div class="ispu-row"><span class="ispu-swatch" style="background:' + k.warna + '"></span>' +
                '<strong>' + k.label + '</strong><span class="ml-auto text-muted">' + rentang + '</span></div>';
        }).join("");
    }

    // ---------- Tabel data ----------
    var tbody = document.getElementById("tabel-data");
    if (tbody) {
        tbody.innerHTML = dataKecamatan.slice().sort(function (a, b) { return b.ispu - a.ispu; }).map(function (d, i) {
            return "<tr><td>" + (i + 1) + "</td><td>" + d.nama + "</td><td class='text-right'>" + fmt(d.motor) +
                "</td><td class='text-right'>" + fmt(d.mobil) + "</td><td class='text-right font-weight-bold'>" + fmt(d.total) +
                "</td><td class='text-center'>" + d.ispu + "</td><td class='text-center'><span class='badge-ispu' style='background:" +
                d.kat.warna + ";color:" + d.kat.teks + "'>" + d.kat.label + "</span></td><td class='text-center'>" + d.polutan + "</td></tr>";
        }).join("");
    }

    // ---------- Peta Leaflet ----------
    var peta, markers = {}, modeLayer = "ispu";
    var maxTotal = Math.max.apply(null, dataKecamatan.map(function (d) { return d.total; }));

    function warnaKendaraan(total) {
        var t = total / maxTotal; // 0..1 -> kuning muda ke merah tua
        if (t > 0.8) return "#7F1D1D";
        if (t > 0.6) return "#B91C1C";
        if (t > 0.4) return "#EA580C";
        if (t > 0.2) return "#F59E0B";
        return "#FDE68A";
    }

    function gayaMarker(d) {
        return {
            radius: 8 + 22 * Math.sqrt(d.total / maxTotal),
            fillColor: modeLayer === "ispu" ? d.kat.warna : warnaKendaraan(d.total),
            color: "#ffffff", weight: 2, fillOpacity: 0.85
        };
    }

    function popupHTML(d) {
        return '<div class="popup-gis"><h6 class="mb-2">Kec. ' + d.nama + '</h6>' +
            '<div><i class="fa fa-wind mr-1"></i> ISPU: <b>' + d.ispu + '</b> ' +
            '<span class="badge-ispu" style="background:' + d.kat.warna + ';color:' + d.kat.teks + '">' + d.kat.label + '</span></div>' +
            '<div><i class="fa fa-smog mr-1"></i> Polutan dominan: <b>' + d.polutan + '</b></div>' +
            '<div><i class="fa fa-motorcycle mr-1"></i> Sepeda motor: <b>' + fmt(d.motor) + '</b></div>' +
            '<div><i class="fa fa-car mr-1"></i> Mobil: <b>' + fmt(d.mobil) + '</b></div>' +
            '<div><i class="fa fa-car-side mr-1"></i> Total kendaraan: <b>' + fmt(d.total) + '</b></div></div>';
    }

    function tampilDetail(d) {
        var el = document.getElementById("detail-kecamatan");
        if (!el) return;
        el.innerHTML = '<h5 class="mb-3">Kec. ' + d.nama + '</h5>' +
            '<div class="detail-ispu mb-3" style="background:' + d.kat.warna + ';color:' + d.kat.teks + '">' +
            '<span class="display-4 font-weight-bold">' + d.ispu + '</span><div>ISPU · ' + d.kat.label + '</div></div>' +
            '<p class="mb-1"><i class="fa fa-smog text-primary mr-2"></i>Polutan dominan: <b>' + d.polutan + '</b></p>' +
            '<p class="mb-1"><i class="fa fa-motorcycle text-primary mr-2"></i>Sepeda motor: <b>' + fmt(d.motor) + '</b></p>' +
            '<p class="mb-1"><i class="fa fa-car text-primary mr-2"></i>Mobil: <b>' + fmt(d.mobil) + '</b></p>' +
            '<p class="mb-0"><i class="fa fa-car-side text-primary mr-2"></i>Total: <b>' + fmt(d.total) + '</b> unit</p>';
    }

    function fokusKecamatan(nama) {
        var d = dataKecamatan.filter(function (x) { return x.nama === nama; })[0];
        if (!d || !peta) return;
        peta.setView([d.lat, d.lng], 13);
        markers[nama].openPopup();
        tampilDetail(d);
    }

    function perbaruiLegendaPeta() {
        var el = document.getElementById("legenda-peta");
        if (!el) return;
        if (modeLayer === "ispu") {
            el.innerHTML = "<b>Kategori ISPU</b>" + kategoriISPU.map(function (k) {
                return '<div><span class="ispu-swatch" style="background:' + k.warna + '"></span>' + k.label + '</div>';
            }).join("") + '<small class="text-muted d-block mt-1">Ukuran lingkaran = jumlah kendaraan</small>';
        } else {
            var kelas = [["#7F1D1D", "> 80%"], ["#B91C1C", "60–80%"], ["#EA580C", "40–60%"], ["#F59E0B", "20–40%"], ["#FDE68A", "< 20%"]];
            el.innerHTML = "<b>Kepadatan Kendaraan</b><small class='d-block text-muted'>(% dari nilai tertinggi)</small>" + kelas.map(function (k) {
                return '<div><span class="ispu-swatch" style="background:' + k[0] + '"></span>' + k[1] + '</div>';
            }).join("");
        }
    }

    if (window.L && document.getElementById("peta")) {
        peta = L.map("peta", { scrollWheelZoom: false }).setView([-7.01, 110.40], 12);
        var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 18, attribution: "&copy; OpenStreetMap contributors"
        }).addTo(peta);
        var citra = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
            maxZoom: 18, attribution: "Tiles &copy; Esri"
        });
        L.control.layers({ "OpenStreetMap": osm, "Citra Satelit": citra }).addTo(peta);
        L.control.scale({ imperial: false }).addTo(peta);

        dataKecamatan.forEach(function (d) {
            var m = L.circleMarker([d.lat, d.lng], gayaMarker(d))
                .bindPopup(popupHTML(d))
                .bindTooltip(d.nama, { direction: "top", offset: [0, -8] })
                .on("click", function () { tampilDetail(d); })
                .addTo(peta);
            markers[d.nama] = m;
        });
        perbaruiLegendaPeta();

        $(".btn-layer").on("click", function () {
            modeLayer = $(this).data("layer");
            $(".btn-layer").removeClass("active");
            $(this).addClass("active");
            dataKecamatan.forEach(function (d) { markers[d.nama].setStyle(gayaMarker(d)); });
            perbaruiLegendaPeta();
        });
    }

    $("#form-cari").on("submit", function (e) {
        e.preventDefault();
        var nama = $("#pilih-kecamatan").val();
        if (!nama) return;
        document.getElementById("peta-section").scrollIntoView({ behavior: "smooth" });
        setTimeout(function () { fokusKecamatan(nama); }, 600);
    });
    $(document).on("change", "#pilih-kecamatan", function () {
        if (this.value) fokusKecamatan(this.value);
    });

    // ---------- Grafik Chart.js ----------
    if (window.Chart) {
        Chart.defaults.font.family = "'Open Sans', sans-serif";
        Chart.defaults.color = "#555";

        var urutTotal = dataKecamatan.slice().sort(function (a, b) { return b.total - a.total; });

        new Chart(document.getElementById("grafik-kendaraan"), {
            type: "bar",
            data: {
                labels: urutTotal.map(function (d) { return d.nama; }),
                datasets: [
                    { label: "Sepeda Motor", data: urutTotal.map(function (d) { return d.motor; }), backgroundColor: "#0F766E", stack: "k" },
                    { label: "Mobil", data: urutTotal.map(function (d) { return d.mobil; }), backgroundColor: "#EA580C", stack: "k" }
                ]
            },
            options: {
                maintainAspectRatio: false,
                indexAxis: "y",
                scales: { x: { stacked: true, ticks: { callback: function (v) { return (v / 1000) + " rb"; } } }, y: { stacked: true } },
                plugins: { tooltip: { callbacks: { label: function (c) { return c.dataset.label + ": " + fmt(c.raw); } } } }
            }
        });

        var urutIspu = dataKecamatan.slice().sort(function (a, b) { return b.ispu - a.ispu; });
        new Chart(document.getElementById("grafik-ispu"), {
            type: "bar",
            data: {
                labels: urutIspu.map(function (d) { return d.nama; }),
                datasets: [{
                    label: "ISPU",
                    data: urutIspu.map(function (d) { return d.ispu; }),
                    backgroundColor: urutIspu.map(function (d) { return d.kat.warna; })
                }]
            },
            options: {
                maintainAspectRatio: false,
                indexAxis: "y",
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (c) { return "ISPU " + c.raw + " (" + urutIspu[c.dataIndex].kat.label + ")"; } } } },
                scales: { x: { beginAtZero: true, suggestedMax: 120 } }
            }
        });

        var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
        new Chart(document.getElementById("grafik-korelasi"), {
            type: "scatter",
            data: {
                datasets: [
                    {
                        label: "Kecamatan",
                        data: dataKecamatan.map(function (d) { return { x: d.total / 1000, y: d.ispu, nama: d.nama }; }),
                        backgroundColor: dataKecamatan.map(function (d) { return d.kat.warna; }),
                        pointRadius: 7, pointHoverRadius: 9
                    },
                    {
                        type: "line", label: "Garis regresi",
                        data: [{ x: minX, y: intercept + slope * minX }, { x: maxX, y: intercept + slope * maxX }],
                        borderColor: "#EA580C", borderWidth: 2, borderDash: [6, 4], pointRadius: 0, fill: false
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: "Jumlah kendaraan (ribu unit)" } },
                    y: { title: { display: true, text: "ISPU" } }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (c) {
                                if (c.datasetIndex === 1) return "Regresi";
                                return c.raw.nama + ": " + fmt(Math.round(c.raw.x * 1000)) + " kendaraan, ISPU " + c.raw.y;
                            }
                        }
                    }
                }
            }
        });

        new Chart(document.getElementById("grafik-tren"), {
            data: {
                labels: dataTren.tahun,
                datasets: [
                    { type: "bar", label: "Kendaraan (ribu unit)", data: dataTren.kendaraan, backgroundColor: "rgba(15,118,110,.75)", yAxisID: "y" },
                    { type: "line", label: "Rata-rata ISPU", data: dataTren.ispu, borderColor: "#EA580C", backgroundColor: "#EA580C", tension: .3, yAxisID: "y1" }
                ]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    y: { position: "left", title: { display: true, text: "Kendaraan (ribu)" } },
                    y1: { position: "right", grid: { drawOnChartArea: false }, title: { display: true, text: "ISPU" }, suggestedMin: 0 }
                }
            }
        });
    }
})();

// Navigasi halus untuk link anchor + penanda menu aktif
(function ($) {
    $('a[href^="#"]').not('.back-to-top, [data-toggle]').on("click", function (e) {
        var target = $(this.getAttribute("href"));
        if (!target.length) return;
        e.preventDefault();
        $("html, body").animate({ scrollTop: target.offset().top - 80 }, 800, "easeInOutExpo");
        $(".navbar-collapse").collapse("hide");
    });
    $(window).on("scroll", function () {
        var pos = $(this).scrollTop() + 120;
        $(".navbar-nav .nav-link").each(function () {
            var sec = $(this.getAttribute("href"));
            if (sec.length && sec.offset().top <= pos && sec.offset().top + sec.outerHeight() > pos) {
                $(".navbar-nav .nav-link").removeClass("active");
                $(this).addClass("active");
            }
        });
    });
})(jQuery);
