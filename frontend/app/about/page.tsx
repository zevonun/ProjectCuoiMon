import Link from "next/link";
import "./about.css";

const posts = [
  {
    slug: "cham-soc-da",
    title: "Routine Chăm Sóc Da Chuẩn Cho Làn Da Việt",
    image: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ltxawe5584cxf9.webp?q=80&w=1974&auto=format&fit=crop",
    desc: "Khám phá quy trình 7 bước dưỡng da chuẩn chuyên gia, giúp phục hồi và nuôi dưỡng làn da khỏe đẹp từ bên trong cùng các chiết xuất từ trà xanh và tràm trà.",
  },
  {
    slug: "tri-mun",
    title: "Giải Pháp Trị Mụn Hiệu Quả Từ Tinh Dầu Thiên Nhiên",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2070&auto=format&fit=crop",
    desc: "Mụn không còn là nỗi lo với sự kết hợp hoàn hảo từ tràm trà, rau má. Giải pháp an toàn, không để lại thâm sẹo cho làn da nhạy cảm nhất.",
  },
  {
    slug: "duong-am",
    title: "Dưỡng Ẩm Chuyên Sâu: Chìa Khóa Cho Làn Da Căng Mọng",
    image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=2000&auto=format&fit=crop",
    desc: "Đừng để làn da khô ráp lấy đi sự tự tin của bạn. Học ngay cách cấp ẩm đúng cách với Hyaluronic Acid tự nhiên và bơ hạt mỡ hữu cơ.",
  },
  {
    slug: "chong-nang",
    title: "Bảo Vệ Da Toàn Diện Trước Tác Động Của Tia UV",
    image: "https://cdn-i.vtcnews.vn/resize/th/upload/2024/06/24/chong-nang-1-17105797.jpg?q=80&w=2070&auto=format&fit=crop",
    desc: "Tại sao kem chống nắng là vật bất ly thân? Tìm hiểu cách lựa chọn kem chống nắng vật lý lành tính cho mọi loại da.",
  },
  {
    slug: "tay-trang",
    title: "Sạch Sâu Lỗ Chân Lông Với Công Nghệ Double Cleansing",
    image: "https://cdn.shopify.com/s/files/1/0738/2099/5809/files/double-cleansing-2.jpg?v=1741435422&q=80&w=2070&auto=format&fit=crop",
    desc: "Tẩy trang không chỉ là làm sạch lớp makeup mà còn là bước thải độc cho da. Tìm hiểu bí quyết tẩy trang sạch sâu mà vẫn dịu nhẹ.",
  },
  {
    slug: "serum",
    title: "Tối Ưu Hiệu Quả Dưỡng Da Với Serum Đặc Trị",
    image: "https://images-1.eucerin.com/~/media/eucerin/local/vn/cach-su-dung-serum/btshynh31311540-1.webp?la=vi-vn&h=511.111&w=713.556&q=80&w=2071&auto=format&fit=crop",
    desc: "Cách layer serum đúng cách để phát huy tối đa công dụng của Vitamin C, Niacinamide và các tinh chất thực vật quý hiếm.",
  },
];

const teamMembers = [
  {
    name: "Nguyễn Thu Thảo",
    role: "Người Sáng Lập & Chuyên Gia Da Liễu",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888&auto=format&fit=crop",
  },
  {
    name: "Trần Minh Đức",
    role: "Giám Đốc Nghiên Cứu R&D",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1887&auto=format&fit=crop",
  },
  {
    name: "Lê Mỹ Linh",
    role: "Trưởng Bộ Phận Chăm Sóc Khách Hàng",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop",
  },
];

export default function AboutPage() {
  return (
    <div className="about">
      {/* HERO SECTION */}
      <div className="about-hero">
        <div className="about-container">
          <h1>Về Aura Beauty</h1>
          <p>Khơi nguồn vẻ đẹp thuần khiết từ sự kết hợp của khoa học hiện đại và tinh hoa thảo mộc thiên nhiên.</p>
        </div>
      </div>

      <div className="about-container">
        {/* STORY SECTION */}
        <section className="about-flex">
          <div className="about-image">
            <img src="/img/Logo.png" alt="Thương hiệu Aura Beauty" />
          </div>
          <div className="about-text">
            <h2>Câu Chuyện <span>Tâm Huyết</span></h2>
            <p>
              Aura Beauty được thành lập vào năm 2019 với một sứ mệnh giản đơn nhưng mạnh mẽ: 
              <strong> "Lắng nghe làn da, thấu hiểu thiên nhiên"</strong>. 
              Chứng kiến những nỗi lo của phụ nữ Việt về làn da nhạy cảm dưới tác động của khí hậu nhiệt đới, 
              chúng tôi đã dành hàng ngàn giờ nghiên cứu để chắt lọc những tinh túy nhất từ cỏ cây Việt Nam.
            </p>
            <p>
              Tại Aura Beauty, chúng tôi từ chối các hóa chất độc hại, cam kết sử dụng 100% 
              thành phần hữu cơ và quy trình sản xuất đạt chuẩn GMP, mang lại trải nghiệm chăm sóc da 
              an toàn tuyệt đối và hiệu quả bền vững.
            </p>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="about-stats">
          <div className="stat-box">
            <h2>50.000+</h2>
            <p>Khách hàng tin chọn</p>
          </div>
          <div className="stat-box">
            <h2>120+</h2>
            <p>Điểm bán toàn quốc</p>
          </div>
          <div className="stat-box">
            <h2>100%</h2>
            <p>Thành phần an toàn</p>
          </div>
          <div className="stat-box">
            <h2>5 Năm</h2>
            <p>Kinh nghiệm chuyên môn</p>
          </div>
        </section>

        {/* VALUES SECTION */}
        <section className="about-flex reverse">
          <div className="about-image">
            <img src="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1887&auto=format&fit=crop" alt="Giá trị Aura Beauty" />
          </div>
          <div className="about-text">
            <h2>Giá Trị <span>Cốt Lõi</span></h2>
            <div className="about-features">
              <div className="feature-item">
                <span className="feature-icon">🌿</span>
                <h4>Thuần Khiết</h4>
                <p>Nguồn nguyên liệu 100% từ nông trại đạt chuẩn.</p>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🧪</span>
                <h4>Khoa Học</h4>
                <p>Công thức được kiểm nghiệm bởi chuyên gia da liễu.</p>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💚</span>
                <h4>Bền Vững</h4>
                <p>Bao bì thân thiện và nói không với thí nghiệm động vật.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TEAM SECTION */}
        <section className="about-team">
          <h2>Đội Ngũ <span>Chuyên Gia</span> của Chúng Tôi</h2>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <img src={member.image} alt={member.name} className="team-img" />
                <div className="team-info">
                  <h4>{member.name}</h4>
                  <p>{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BLOG SECTION */}
        <section className="about-blog">
          <h2>Cẩm Nang <span>Làm Đẹp</span> Từ Chuyên Gia</h2>
          <div className="blog-grid">
            {posts.map((post) => (
              <Link key={post.slug} href={`/article/${post.slug}`}>
                <div className="blog-card">
                  <img src={post.image} alt={post.title} />
                  <div className="blog-card-content">
                    <h3>{post.title}</h3>
                    <p>{post.desc}</p>
                    <span className="read-more">Xem chi tiết →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}