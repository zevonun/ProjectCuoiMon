import Link from "next/link";

const posts = [
  {
    slug: "cham-soc-da",
    title: "Routine chăm sóc da chuẩn",
    image: "/img/thuong_hieu.webp",
    desc: "Hướng dẫn chăm sóc da từ thiên nhiên...",
  },
  {
    slug: "tri-mun",
    title: "Cách trị mụn hiệu quả",
    image: "/img/blog2.jpg",
    desc: "Giải pháp trị mụn đơn giản...",
  },
  {
    slug: "duong-am",
    title: "Dưỡng ẩm đúng cách",
    image: "/img/blog3.jpg",
    desc: "Cách giữ ẩm cho da...",
  },
  {
    slug: "chong-nang",
    title: "Tại sao phải chống nắng",
    image: "/img/blog4.jpg",
    desc: "Kem chống nắng quan trọng...",
  },
  {
    slug: "tay-trang",
    title: "Tẩy trang đúng cách",
    image: "/img/blog5.jpg",
    desc: "Sai lầm khi tẩy trang...",
  },
  {
    slug: "serum",
    title: "Cách dùng serum",
    image: "/img/blog6.jpg",
    desc: "Serum dùng thế nào...",
  },
  {
    slug: "tay-da-chet",
    title: "Tẩy da chết đúng cách",
    image: "/img/blog7.jpg",
    desc: "Giúp da sáng và mịn hơn...",
  },
  {
    slug: "cham-soc-da-dau",
    title: "Chăm sóc da dầu hiệu quả",
    image: "/img/blog8.jpg",
    desc: "Kiểm soát dầu và mụn...",
  },
  {
    slug: "cham-soc-da-kho",
    title: "Chăm sóc da khô",
    image: "/img/blog9.jpg",
    desc: "Giữ ẩm và phục hồi da...",
  },
];
export default function AboutPage() {
  return (
    <div className="about">

      {/* HERO */}
      <div className="about-hero">
        <h1>Về Aura Beauty</h1>
        <p>Mỹ phẩm thiên nhiên - An toàn - Hiệu quả</p>
      </div>

      {/* CONTENT */}
      <div className="about-content">
        <div className="about-left">
          <img src="/img/thuong_hieu.webp" />
        </div>

        <div className="about-right">
          <h2>Câu chuyện của chúng tôi</h2>
          <p>
           Aura Beauty ra đời với mong muốn mang đến những sản phẩm mỹ phẩm thiên nhiên an toàn, lành tính và phù hợp với làn da của người Việt. Chúng tôi 
           tin rằng vẻ đẹp bền vững không chỉ đến từ bên ngoài mà còn bắt nguồn từ sự chăm sóc đúng cách và những thành phần thuần khiết
             từ thiên nhiên.
          </p>

          <h3>Sứ mệnh</h3>
          <p>Giúp bạn có làn da khỏe đẹp tự nhiên.</p>

          <h3>Giá trị</h3>
          <ul>
            <li>🌿 Thành phần thiên nhiên</li>
            <li>💚 An toàn cho da</li>
            <li>✨ Hiệu quả lâu dài</li>
          </ul>
        </div>
      </div>

      {/* STATS */}
      <div className="about-stats">
        <div>
          <h2>10.000+</h2>
          <p>Khách hàng</p>
        </div>
        <div>
          <h2>50+</h2>
          <p>Sản phẩm</p>
        </div>
        <div>
          <h2>5 năm</h2>
          <p>Kinh nghiệm</p>
        </div>
      </div>

      {/* 🔥 BLOG SECTION */}
      <div className="about-blog">
        <h2>Bài viết nổi bật</h2>

        <div className="blog-grid">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <div className="blog-card">
                <img src={post.image} />
                <h3>{post.title}</h3>
                <p>{post.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}