import Link from "next/link";

const posts = [
  {
    slug: "cham-soc-da",
    title: "Routine chăm sóc da chuẩn",
    image: "/img/blog1.jpg",
    desc: "Hướng dẫn chăm sóc da từ thiên nhiên...",
    content: `
Chăm sóc da đúng cách giúp da khỏe và đẹp.

✔ Làm sạch da
✔ Toner cân bằng
✔ Serum dưỡng
✔ Kem dưỡng

👉 Kiên trì mỗi ngày.
    `,
  },
  {
    slug: "tri-mun",
    title: "Cách trị mụn hiệu quả",
    image: "/img/blog2.jpg",
    desc: "Giải pháp trị mụn đơn giản...",
    content: `
Mụn do dầu, vi khuẩn và nội tiết.

✔ Rửa mặt đúng
✔ Không nặn mụn
✔ Dùng sản phẩm phù hợp
    `,
  },
  {
    slug: "duong-am",
    title: "Dưỡng ẩm đúng cách",
    image: "/img/blog3.jpg",
    desc: "Cách giữ ẩm cho da...",
    content: `
Dưỡng ẩm giúp da mềm mịn.

✔ Da dầu vẫn cần dưỡng
✔ Chọn sản phẩm phù hợp
    `,
  },
  {
    slug: "chong-nang",
    title: "Tại sao phải chống nắng",
    image: "/img/blog4.jpg",
    desc: "Kem chống nắng quan trọng...",
    content: `
Chống nắng giúp ngừa lão hóa.

✔ Bôi trước 15 phút
✔ Bôi lại sau 2h
    `,
  },
  {
    slug: "tay-trang",
    title: "Tẩy trang đúng cách",
    image: "/img/blog5.jpg",
    desc: "Sai lầm khi tẩy trang...",
    content: `
Tẩy trang giúp da sạch sâu.

✔ Luôn tẩy trang mỗi tối
✔ Dùng đúng sản phẩm
    `,
  },
  {
    slug: "serum",
    title: "Cách dùng serum",
    image: "/img/blog6.jpg",
    desc: "Serum dùng thế nào...",
    content: `
Serum dưỡng sâu.

✔ Dùng sau toner
✔ Trước kem dưỡng
    `,
  },
  {
    slug: "tay-da-chet",
    title: "Tẩy da chết đúng cách",
    image: "/img/blog7.jpg",
    desc: "Giúp da sáng và mịn hơn...",
    content: `
Tẩy da chết giúp da sáng hơn.

✔ 1-2 lần/tuần
✔ Không lạm dụng
    `,
  },
  {
    slug: "cham-soc-da-dau",
    title: "Chăm sóc da dầu hiệu quả",
    image: "/img/blog8.jpg",
    desc: "Kiểm soát dầu và mụn...",
    content: `
Da dầu cần kiểm soát bã nhờn.

✔ Dùng gel nhẹ
✔ Rửa mặt đúng cách
    `,
  },
  {
    slug: "cham-soc-da-kho",
    title: "Chăm sóc da khô",
    image: "/img/blog9.jpg",
    desc: "Giữ ẩm và phục hồi da...",
    content: `
Da khô cần cấp ẩm mạnh.

✔ Dùng kem dưỡng dày
✔ Uống đủ nước
    `,
  },
];

export default function AboutDetail({ params }: any) {
  const post = posts.find((p) => p.slug === params.slug);

  if (!post) return <div>Không tìm thấy bài viết</div>;

  return (
    <div className="blog-detail">
      <img src={post.image} className="detail-img" />

      <h1>{post.title}</h1>
      <p>{post.desc}</p>

      <div className="detail-content">{post.content}</div>

      <Link href="/about">← Quay lại</Link>
    </div>
  );
}