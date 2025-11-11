import "./AboutUs.css"

function AboutUs() {


  return (
    <div className="about-page">
      <div className="about-header">
        <h1>Tentang Kami</h1>
        <p>Mengenal Tarumenyan lebih dekat</p>
      </div>

      <section className="about-story">
        <div className="about-container">
          <div className="about-content">
            <h2>Cerita Kami</h2>
            <p>Tarumenyan adalah sebuah brand fotografi dan videografi yang berdiri sejak tahun 2022. Tarumenyan
 terinspirasi dari bahasa Sanskerta, menggabungkan makna mendalam dari kata "taru" (pohon) dan
 "menyan" (dupa). Nama ini mencerminkan esensi kehidupan, pertumbuhan, dan aroma spiritual yang
 hadir dalam setiap karya yang dihasilkan. Layaknya pohon yang tumbuh tinggi dan kokoh, Tarumenyan
 berkembang menjadi entitas seni visual yang kaya akan cerita. Setiap foto dan video yang dihasilkan
 dianggap sebagai daun yang berkisah, menciptakan hutan cerita yang menggugah imajinasi dan
 membawa kita lebih dekat pada refleksi batin. 
</p>
          </div>
          <div className="about-image">
            <img src="/Logo Green.png" alt="Tarumenyan Logo" className="logo-image" />
          </div>
        </div>
      </section>

      <section className="about-mission">
        <div className="mission-container">
          <div className="mission-item">
            <h3>Tarumenyan Booth</h3>
            <p> Tarumenyan Photobooth adalah layanan foto instan yang hadir untuk
 memeriahkan setiap momen spesial kalian. Mulai beroperasi sejak Januari
 2025, kami berkomitmen untuk memberikan pengalaman berfoto yang tak
 terlupakan. Dengan desain booth yang unik dan aesthetic, kami siap
 menyesuaikan dengan tema acara kalian, mulai dari pernikahan, ulang tahun,
 hingga acara perusahaan. Setiap jepretan akan menjadi kenangan indah yang
 dapat di simpan selamanya.</p>
          </div>
          <div className="mission-item">
            <h3>Tarumenyan Grad</h3>
            <p>Tarumenyan Graduation menawarkan sesi foto
 kelulusan yang tidak hanya mengabadikan momen, tetapi juga menjadikan
 perjalanan kalian selama ini menjadi sebuah saksi bisu. Dengan latar
 belakang menawan dan sentuhan kreatif, setiap jepretan menangkap
 kebahagiaan dan pencapaian kalian. Biarkan kami menjadikan hari spesial ini
 kenangan abadi yang akan selalu kalian banggakan</p>
          </div>
          <div className="mission-item">
            <h3>Tarumenyan Gift</h3>
            <p>Tarumenyan.gift adalah destinasi terbaru untuk pasangan yang ingin
 menambahkan sentuhan personal pada pernikahan mereka. Sebagai bagian
 dari Tarumenyan kami menawarkan hantaran dan seserahan dengan desain
 aesthetic dan berkualitas. Setiap detail diperhatikan, dari pemilihan bahan
 hingga finishing, agar hantaran kalian menjadi pusat perhatian. Dengan
 fleksibilitas tema dan warna, kami siap mewujudkan visi pernikahan impian
 kalian</p>
          </div>
        </div>
      </section>

      <section className="studio-section">
        <div className="studio-container">
          <div className="studio-content">
            <h2>PT. Tarumenyan Karya Indonesia</h2>
            <p>
            Berada di bawah naungan <strong>PT. Tarumenyan Karya Indonesia</strong> , kami hadir untuk mengabadikan momen-momen
 berharga dalam hidup kalian dengan berbagai layanan istimewa. Mulai dari dokumentasi wedding yang akan
 menangkap setiap detail cinta, hingga photobooth yang siap menambah keseruan dari setiap  acara! Tak
 hanya itu, kami juga menyediakan dokumentasi graduation untuk merayakan pencapaian akademis dengan
 cara yang tak terlupakan, serta layanan penyewaan hantaran/seserahan yang elegan dan berkualitas.
 Bergabunglah bersama kami dan buat setiap momen menjadi kenangan yang abadi!
            </p>
          </div>
            <div className="jam-operasional">
              <h4>Jam Operasional</h4>
              <div className="operation-hours">
                <h5>Senin - Jumat  </h5>
                  <p> 9:00 - 17:00 </p>
                <h5>Sabtu :  </h5>
                <p>10:00 - 4:00</p>
                <h5>Minggu : </h5>
                <p>Dapat melakukan konsultasi via WhatsApp</p>
              </div>
            </div>
          </div>          
      </section>

      <section className="cta-section">
        <div className="cta-container">
          <h2>Siap Bekerja Sama dengan Kami?</h2>
          <p> Jika ada pertanyaan atau
          butuh bantuan lebih lanjut, jangan ragu untuk menghubungi kami.</p>
          <a 
            href="https://wa.me/6281236559230" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="cta-button"
            style={{ textDecoration: 'none' }}
          >
            Hubungi Kami
          </a>
        </div>
      </section>
    </div>
  )
}

export default AboutUs
