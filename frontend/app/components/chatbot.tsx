'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '../lib/formatPrice';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const QUICK_PROMPTS = [
  'Da dau nen dung gi?',
  'Da kho nen dung gi?',
  'Moi kho nen dung gi?',
  'Da mun nen dung gi?',
];

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
}

interface Message {
  role: 'user' | 'bot';
  text: string;
  products?: Product[];
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Xin chào ✨ Shop có thể giúp gì cho bạn?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return '/no-image.png';
    const path = imagePath;
    if (path.startsWith('/') && !path.startsWith('http')) {
      return `http://localhost:5000${path}`;
    }
    return path;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/chat`, { message: input });

      const botMsg: Message = {
        role: 'bot',
        text: res.data?.reply?.text || 'Không có phản hồi',
        products: res.data?.reply?.products || []
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'bot', text: 'Lỗi server 😢' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (loading) return;
    setInput(prompt);

    const userMsg: Message = { role: 'user', text: prompt };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/chat`, { message: prompt });

      const botMsg: Message = {
        role: 'bot',
        text: res.data?.reply?.text || 'Khong co phan hoi',
        products: res.data?.reply?.products || []
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'bot', text: 'Loi server' }]);
    } finally {
      setInput('');
      setLoading(false);
    }
  };

  return (
    <>
      {/* NÚT CHATBOT */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #5a8a2f, #8abf5f)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 22px rgba(0,0,0,0.35)',
          zIndex: 9999,
          fontSize: 26,
          transition: 'all 0.3s ease-in-out',
          animation: 'pulse 2s infinite ease-in-out, float 4s infinite ease-in-out',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = 'scale(1.2) rotate(-5deg)';
          el.style.boxShadow = '0 12px 28px rgba(0,0,0,0.5)';
          el.style.background = 'linear-gradient(135deg, #8abf5f, #c0e38b)';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = 'scale(1) rotate(0deg)';
          el.style.boxShadow = '0 8px 22px rgba(0,0,0,0.35)';
          el.style.background = 'linear-gradient(135deg, #5a8a2f, #8abf5f)';
        }}
      >
        <Link href="/">
            <Image
              src="/img/logo1.png"
              alt="Chatbot Logo"
              width={40}
              height={40}
              style={{ cursor: 'pointer' }}
            />
        </Link>
        <style jsx>{`
          @keyframes pulse {
            0% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.05) rotate(2deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            25% { transform: translateY(-4px); }
            50% { transform: translateY(0px); }
            75% { transform: translateY(4px); }
            100% { transform: translateY(0px); }
          }
        `}</style>
      </div>

      {/* CHAT BOX NHỎ GỌN */}
      <div
        style={{
          position: 'fixed',
          bottom: 90,
          right: 20,
          width: 300,
          height: open ? 420 : 0,
          opacity: open ? 1 : 0,
          transform: open ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
          transition: 'all 0.35s ease',
          pointerEvents: open ? 'auto' : 'none',
          background: '#f8fafc',
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 12px 35px rgba(0,0,0,0.35)',
          zIndex: 9998,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* HEADER */}
        <div style={{
          background: 'linear-gradient(135deg, #5a8a2f, #3f6f12)',
          color: '#fff',
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 700,
          fontSize: 15,
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/">
              <Image
                src="/img/logo1.png"
                alt="Chatbot Logo"
                width={30}
                height={30}
                style={{ cursor: 'pointer', display: 'block' }}
              />
            </Link>
            <span>Beauty Support</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: 17,
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            ✖
          </button>
        </div>

        {/* MESSAGES */}
        <div style={{ flex: 1, padding: 10, overflowY: 'auto' }}>
          {messages.length === 1 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleQuickPrompt(prompt)}
                  style={{
                    border: '1px solid #cfe0bf',
                    background: '#fff',
                    color: '#3f6f12',
                    borderRadius: 999,
                    padding: '6px 10px',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 6,
            }}>
              <div style={{
                maxWidth: '75%',
                padding: '8px 12px',
                borderRadius: 12,
                background: m.role === 'user' ? '#fff' : '#5a8a2f',
                color: m.role === 'user' ? '#000' : '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              }}>
                {m.text}
              </div>

              {m.products && m.products.length > 0 && (
                <div style={{ marginTop: 5, width: '100%' }}>
                  {m.products.map((p, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      background: '#fff',
                      borderRadius: 10,
                      padding: 6,
                      marginBottom: 5,
                      border: '1px solid #eee',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.transform = 'translateY(-2px)';
                      el.style.boxShadow = '0 4px 10px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.transform = 'translateY(0)';
                      el.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
                    }}>
                      <Image 
                        src={getImageUrl(p.image)}
                        alt={p.name}
                        width={45}
                        height={45}
                        style={{ borderRadius: 6, objectFit: 'cover' }}
                      />
                      <div style={{ marginLeft: 8, flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{p.name}</div>
                        <div style={{ color: '#3f6f12', fontWeight: 'bold' }}>
                          {formatPrice(p.price || 0)}
                        </div>
                        <a href={`/product/${p.id}`}>
                          <button style={{
                            marginTop: 3,
                            padding: '3px 8px',
                            borderRadius: 6,
                            border: 'none',
                            background: 'linear-gradient(135deg, #f4c430, #ffb347)',
                            color: '#fff',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => {
                            const el = e.currentTarget as HTMLButtonElement;
                            el.style.transform = 'scale(1.05)';
                            el.style.boxShadow = '0 3px 10px rgba(0,0,0,0.25)';
                          }}
                          onMouseLeave={e => {
                            const el = e.currentTarget as HTMLButtonElement;
                            el.style.transform = 'scale(1)';
                            el.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
                          }}>
                            Xem
                          </button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && <div style={{ fontSize: 12, color: '#999' }}>Bot đang trả lời...</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div style={{
          display: 'flex',
          padding: 8,
          borderTop: '1px solid #eee',
          background: '#eaf0e6',
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Nhập tin nhắn..."
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: 22,
              border: '1px solid #ddd',
              fontSize: 13,
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            style={{
              marginLeft: 6,
              padding: '6px 10px',
              borderRadius: 22,
              border: 'none',
              background: 'linear-gradient(135deg, #f4c430, #ffb347)',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.transform = 'scale(1.05)';
              el.style.boxShadow = '0 3px 10px rgba(0,0,0,0.25)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.transform = 'scale(1)';
              el.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
            }}
          >
            Gửi
          </button>
        </div>
      </div>
    </>
  );
}
