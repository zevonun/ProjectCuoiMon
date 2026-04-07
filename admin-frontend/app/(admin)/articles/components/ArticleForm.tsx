'use client';

import React, { useState } from 'react';
import ImageUpload from '../../../../components/ImageUpload';
import styles from './ArticleForm.module.css';

export interface ArticleData {
  title_vi: string;
  keyword?: string;
  alt?: string;
  image?: string;
  short_description_vi?: string;
  content_vi: string;
  num?: number | '';
}

interface ArticleFormProps {
  onSubmit: (data: ArticleData) => void;
  initialData?: ArticleData;
}

const ArticleForm: React.FC<ArticleFormProps> = ({ onSubmit, initialData }) => {
  const [form, setForm] = useState<ArticleData>(() => ({
    title_vi: initialData?.title_vi ?? '',
    keyword: initialData?.keyword ?? '',
    alt: initialData?.alt ?? '',
    image: initialData?.image ?? '',
    short_description_vi: initialData?.short_description_vi ?? '',
    content_vi: initialData?.content_vi ?? '',
    num: initialData?.num ?? '',
  }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'num' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title_vi || !form.content_vi) {
      alert('Tiêu đề và nội dung là bắt buộc');
      return;
    }

    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Tiêu đề bài viết (Việt Nam)</label>
        <input
          name="title_vi"
          value={form.title_vi}
          onChange={handleChange}
          className={styles.input}
          placeholder="Nhập tiêu đề bài viết"
          required
        />
      </div>

      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Keyword SEO</label>
          <input
            name="keyword"
            value={form.keyword}
            onChange={handleChange}
            className={styles.input}
            placeholder="Nhập keyword bài viết"
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Thứ tự hiển thị</label>
          <input
            type="number"
            name="num"
            value={form.num}
            onChange={handleChange}
            className={styles.input}
            placeholder="Ví dụ: 1, 2, 3..."
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Hình ảnh đại diện (Thumbnail)</label>
        <ImageUpload
          type="articles"
          value={form.image}
          onChange={(url) => setForm(prev => ({ ...prev, image: url }))}
        />
        <input
          name="alt"
          value={form.alt}
          onChange={handleChange}
          className={styles.input}
          style={{ marginTop: '8px' }}
          placeholder="Mô tả hình ảnh (alt tag)"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Mô tả ngắn</label>
        <textarea
          name="short_description_vi"
          value={form.short_description_vi}
          onChange={handleChange}
          className={styles.textarea}
          style={{ minHeight: '80px' }}
          placeholder="Nhập đoạn mô tả ngắn cho bài viết..."
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Nội dung bài viết</label>
        <textarea
          name="content_vi"
          value={form.content_vi}
          onChange={handleChange}
          className={styles.textarea}
          style={{ minHeight: '300px' }}
          placeholder="Nhập nội dung bài viết (có thể dùng HTML)..."
          required
        />
      </div>

      <button type="submit" className={styles.submitBtn}>
        Lưu bài viết
      </button>
    </form>
  );
};

export default ArticleForm;
