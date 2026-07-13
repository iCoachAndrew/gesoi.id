import { LogIn, Users, ShoppingBag, BarChart3, PenSquare, ImageIcon, Info } from "lucide-react";

const Section = ({ icon: Icon, num, title, children, testId }) => (
  <section className="rounded-2xl bg-white border border-[#0B1F3A]/10 p-8" data-testid={testId}>
    <div className="flex items-center gap-3 mb-5">
      <span className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
        <Icon size={17} className="text-emerald-700" />
      </span>
      <h2 className="font-serif-display text-2xl text-[#0B1F3A]">
        <span className="italic text-[#B45309] mr-2">{num}.</span>
        {title}
      </h2>
    </div>
    <div className="space-y-3 text-sm text-[#4B5563] font-light leading-relaxed">{children}</div>
  </section>
);

const Li = ({ label, children }) => (
  <li className="flex gap-2">
    <span className="text-[#B45309] shrink-0">•</span>
    <span>
      {label && <strong className="font-semibold text-[#0B1F3A]">{label}: </strong>}
      {children}
    </span>
  </li>
);

const Code = ({ children }) => (
  <code className="px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#0B1F3A] text-xs">{children}</code>
);

export default function AdminHelp() {
  return (
    <main className="max-w-4xl mx-auto px-6 lg:px-10 py-10 space-y-6" data-testid="admin-help">
      <div className="mb-2">
        <h1 className="font-serif-display text-4xl text-[#0B1F3A]">Panduan Penggunaan Dasbor Admin</h1>
        <p className="text-sm text-[#6B7280] font-light mt-2">
          Penjelasan cara menggunakan setiap fungsi di halaman admin website GESOI, langkah demi langkah.
        </p>
      </div>

      <Section icon={LogIn} num="1" title="Masuk (Login)" testId="help-login">
        <ul className="space-y-2">
          <Li>Buka halaman <Code>/admin/login</Code> atau klik tautan "Portal Admin" di footer website.</Li>
          <Li>Masukkan email dan kata sandi admin, lalu tekan tombol masuk.</Li>
          <Li label="Keamanan">salah kata sandi 5 kali berturut-turut akan mengunci login sementara. Tombol Keluar ada di pojok kanan atas.</Li>
        </ul>
      </Section>

      <Section icon={Users} num="2" title="Tab: Data Pendaftar" testId="help-pendaftar">
        <p>Menampilkan semua orang yang mengisi formulir "Bergabung" di landing page.</p>
        <ul className="space-y-2">
          <Li label="Kartu statistik">jumlah total pendaftar dan rincian per minat (Relawan, Mitra, Donatur, Founding Circle).</Li>
          <Li label="Filter">klik tombol kategori untuk menyaring tabel.</Li>
          <Li label="Export CSV">unduh seluruh data pendaftar untuk dibuka di Excel/Google Sheets. Lakukan berkala sebagai cadangan.</Li>
        </ul>
      </Section>

      <Section icon={ShoppingBag} num="3" title="Tab: Pembelian Publikasi" testId="help-pembelian">
        <p>Menampilkan semua pemesan yang menekan "Beli Akses" pada publikasi ilmiah.</p>
        <ul className="space-y-2">
          <Li label="Ubah status">setiap baris punya menu status: Baru (belum ditindaklanjuti), Dihubungi (tim sudah kontak), Selesai (pembayaran & akses tuntas).</Li>
          <Li label="Export CSV">unduh seluruh data pesanan.</Li>
          <Li label="Penting">pembayaran belum terhubung payment gateway (prototipe). Tim perlu menghubungi pembeli secara manual via email/WhatsApp.</Li>
        </ul>
      </Section>

      <Section icon={BarChart3} num="4" title="Tab: Analitik" testId="help-analitik">
        <p>
          Statistik pengunjung website. Data tersimpan di database sendiri, anonim, dan hanya terekam dari pengunjung
          yang menekan "Terima" pada banner cookie.
        </p>
        <ul className="space-y-2">
          <Li label="Rentang waktu">7 / 30 / 90 hari.</Li>
          <Li label="5 kartu metrik">Total Kunjungan, Pengunjung Unik, Klik Bergabung, Form Terkirim, Klik Beli Akses.</Li>
          <Li label="Grafik tren harian">garis biru tua = kunjungan, garis emas = pengunjung unik.</Li>
          <Li label="Panel">Perangkat (desktop vs mobile), Bahasa (ID vs EN), Sumber Kunjungan (langsung, Instagram, Google, dsb.).</Li>
          <Li label="Cara membaca">jika Klik Bergabung tinggi tapi Form Terkirim rendah, banyak yang tertarik namun tidak menyelesaikan formulir; pertimbangkan memperkuat ajakan.</Li>
        </ul>
      </Section>

      <Section icon={PenSquare} num="5" title="Tab: Editor Website (CMS)" testId="help-editor">
        <p>Tempat mengubah SEMUA isi landing page tanpa menyentuh kode. Perubahan langsung tampil begitu disimpan.</p>
        <p className="font-semibold text-[#0B1F3A]">Cara kerja umum:</p>
        <ul className="space-y-2">
          <Li>Pilih bahasa konten (ID / EN), keduanya diedit terpisah.</Li>
          <Li>Pilih section di menu kiri (Hero, 01 Urgensi, 02 Ekosistem, dst.).</Li>
          <Li>Ubah isinya, lalu tekan <strong className="font-semibold text-[#0B1F3A]">Simpan Perubahan</strong>.</Li>
        </ul>
        <p className="font-semibold text-[#0B1F3A] pt-2">Jenis kolom:</p>
        <ul className="space-y-2">
          <Li label="Gambar/Foto">tempel URL atau unggah file dari komputer (ada pengatur skala). URL file lama bisa disalin dari Galeri Media.</Li>
          <Li label="Ikon">pilih dari daftar, atau "Ikon kustom (unggahan)" untuk gambar sendiri.</Li>
          <Li label="Tata Letak / Template">Ekosistem (Orbit / Grid), Pilar Misi (Baris Editorial / Grid Kartu dengan Gambar), Program (Kartu Ikon / Kartu dengan Gambar), Peta Jalan (Garis Waktu / Garis Waktu dengan Foto). Setiap item punya kolom gambar sendiri.</Li>
          <Li label="Daftar Item">tambah, hapus, dan edit konten berulang (pilar, program, berita, tokoh, dsb.).</Li>
        </ul>
        <p className="font-semibold text-[#0B1F3A] pt-2">Berita (07 Kabar/News):</p>
        <ul className="space-y-2">
          <Li>Tautan kosong = kartu membuka halaman detail internal dengan artikel lengkap + tombol Bagikan ke WhatsApp. Tautan diisi = membuka link eksternal.</Li>
          <Li label="Format Isi Artikel">baris kosong = paragraf baru; <Code>## Judul Bagian</Code> = sub-judul; <Code>**teks**</Code> = tebal; URL gambar pada baris tersendiri = gambar di tengah artikel.</Li>
        </ul>
        <p className="pt-2">
          <strong className="font-semibold text-red-600">Tombol Reset:</strong> mengembalikan SELURUH konten ke bawaan
          awal dan menghapus semua perubahan CMS. Gunakan hanya jika benar-benar perlu.
        </p>
      </Section>

      <Section icon={ImageIcon} num="6" title="Tab: Galeri Media" testId="help-media">
        <ul className="space-y-2">
          <Li label="Unggah File">tambah gambar (JPG/PNG/GIF/WebP) atau video (MP4/WebM/MOV) langsung dari halaman ini.</Li>
          <Li label="Filter">Semua / Gambar / Video.</Li>
          <Li label="Salin URL">untuk ditempel di kolom gambar/video mana pun di Editor Website.</Li>
          <Li label="Hapus">hati-hati: jika file masih dipakai di website, gambarnya akan hilang dari halaman.</Li>
        </ul>
      </Section>

      <Section icon={Info} num="7" title="Hal Penting Lainnya" testId="help-lainnya">
        <ul className="space-y-2">
          <Li label="CMS vs Kode">perubahan lewat Editor Website langsung aktif tanpa deploy ulang. Perubahan kode (fitur baru) perlu deploy ulang.</Li>
          <Li label="Aturan konten">jangan gunakan karakter em-dash dalam teks; gunakan koma, titik dua, atau tanda hubung.</Li>
          <Li label="Form terkunci">pengunjung yang sudah mendaftar melihat pesan "Anda telah mendaftar pada (tanggal)" pada kunjungan berikutnya di perangkat yang sama. Teksnya bisa diubah di section "10 Ajakan & Form".</Li>
        </ul>
      </Section>
    </main>
  );
}
