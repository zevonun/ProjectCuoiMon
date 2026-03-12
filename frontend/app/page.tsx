import styles from "./page.module.css";
import ProductSlider from "./components/ProductSlider";
import HomeBanner from "./components/HomeBanner";

export default function Home() {
  return (
    <>
      <HomeBanner />

      <div className={styles.mainContent}>
        <ProductSlider
          title="Sản phẩm mới"
          iconUrl="/img/icon-san-pham-moi-ra-mat.png"
          apiUrl="/api/product/new"
        />

        <ProductSlider
          title="Sản phẩm bán chạy nhất"
          iconUrl="/img/ban-chay.jpg"
          apiUrl="/api/product/hot"
        />
      </div>

      {/* ================== CHUYỆN CỦA CỎ ================== */}
      <section className={styles.homeAbouts}>
        <div className={styles.aboutImage}>
          <img src="/img/banner-about.webp" alt="Chuyện của cỏ" />
        </div>

        <div className={styles.aboutContent}>
          <h2>CHUYỆN CỦA CỎ</h2>

          <h3>
            Tôi bắt đầu Ước mơ Xanh của mình, nghiên cứu những sản phẩm thuần tuý,
            tối giản, chỉ tập trung vào mục đích sử dụng của chính nó.
          </h3>

          <p>
            Nghĩa là nước giặt thì chỉ cần giặt sạch, chứ không cần phải nhiều bọt.
            Nghĩa là dưỡng da dưỡng tóc thì để da tóc khoẻ từ gốc chứ không cần
            cảm giác giả mướt tay từ silicon. Tôi từ chối mọi sản phẩm chứa hạt vi
            nhựa, chỉ dùng cafe xay mịn và muối biển để tẩy tế bào chết. Tôi không
            dùng những hoá chất tẩy rửa mà thay bằng xà bông dầu dừa và quả bồ
            hòn xưa cũ...
          </p>

          <a href="/ve-chung-toi" className={styles.aboutButton}>
            XEM THÊM
          </a>

          <div className={styles.aboutHighlight}>
            <div className={styles.highlightItem}>
              <img src="/img/nhamay2.webp" alt="Nhà máy sản xuất" />
              <h4>
                Nhà máy sản xuất Cỏ Mềm sản xuất mỹ phẩm theo tiêu chuẩn cGMP
              </h4>
            </div>

            <div className={styles.highlightItem}>
              <img src="/img/thuong_hieu.webp" alt="Giải thưởng" />
              <h4>
                Giải Thưởng “THƯƠNG HIỆU TRUYỀN CẢM HỨNG” CHÂU Á APEA 2021
                Gọi Tên Cỏ Mềm
              </h4>
            </div>
          </div>
        </div>
      </section>

      {/* ================== MINH BẠCH NGUYÊN LIỆU ================== */}
      <section className={styles.homeResources}>
  <div className={styles.homeResourcesInner}>
    
    <div className={styles.resourcesLeft}>
      <h3>100% Minh bạch nguyên liệu</h3>
      <p>Sản phẩm an LÀNH - Con người chân THẬT</p>
      <a href="/nguyen-lieu" className={styles.resourcesButton}>
        XEM THÊM
      </a>
    </div>

    <div className={styles.resourcesRight}>
      <div className={`${styles.card} ${styles.top}`}>
        <img src="/img/banner-home-1.webp" alt="Lá bạc hà" />
        <h4>LÁ BẠC HÀ</h4>
        <p>
          Lá Bạc hà được sử dụng trong các sản phẩm mỹ phẩm như:
          cao dược liệu để gội đầu, lá tắm cho trẻ em, nước súc miệng...
        </p>
      </div>

      <div className={`${styles.card} ${styles.bottom}`}>
        <img src="/img/cam_m_m.webp" alt="Tinh dầu cam ngọt" />
        <h4>TINH DẦU CAM NGỌT</h4>
        <p>
          Tinh dầu Cam ngọt được sử dụng trong mỹ phẩm như một thành phần
          làm thơm, giải tỏa căng thẳng...
        </p>
      </div>

      <div className={`${styles.card} ${styles.top}`}>
        <img src="/img/dau-qua-bo_m.webp" alt="Dầu quả bơ" />
        <h4>DẦU QUẢ BƠ</h4>
        <p>
          Được chiết từ thịt quả bơ chín ngay sau khi thu hoạch
          bằng phương pháp ép lạnh.
        </p>
      </div>

      <div className={`${styles.card} ${styles.bottom}`}>
        <img src="/img/dau-dua_89_m.webp" alt="Dầu dừa" />
        <h4>DẦU DỪA</h4>
        <p>
          Dầu dừa được chiết xuất từ phần cùi trắng của quả dừa,
          có thể được tìm thấy trong nhiều loại mỹ phẩm.
        </p>
      </div>
    </div>

  </div>
</section>
    </>
  );
}