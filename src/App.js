import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { Users, MapPin, CheckCircle, ArrowRight, Shield, Mail, Phone, User, ExternalLink } from 'lucide-react';

// --- Firebase 配置 ---
const firebaseConfig = {
  apiKey: "AIzaSyA_v24FVezUZao4kxVc4z6rTPCPrQvFOmE",
  authDomain: "pluwfun-app.firebaseapp.com",
  projectId: "pluwfun-app",
  storageBucket: "pluwfun-app.firebasestorage.app",
  messagingSenderId: "485713277437",
  appId: "1:485713277437:web:6f91c10690828573236994",
  measurementId: "G-E5F6N3471P"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const App = () => {
  const [page, setPage] = useState('landing');
  const [registrations, setRegistrations] = useState([]);
  const [formData, setFormData] = useState({ 
    name: '', email: '', phone: '', position: '', storeName: '', note: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    signInAnonymously(auth).catch(err => console.error(err));
    const q = query(collection(db, 'registrations'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRegistrations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'registrations'), { ...formData, timestamp: new Date().toISOString() });
      alert('🎉 報名成功！期待您的蒞臨。');
      setPage('landing');
    } catch (err) { alert('提交失敗，請檢查網路連線'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div style={styles.wrapper}>
      {/* 導覽列：極簡比例優化 */}
      <nav style={styles.nav}>
        <div style={styles.navLeft} onClick={() => setPage('landing')}>
          <img src="/logo.png" alt="PLUWFUN" style={styles.navLogo} />
          <div style={styles.brandTitle}>PLUW<span style={{color: '#00C7FF'}}>FUN</span></div>
        </div>
        <div style={styles.navRight}>
          <button onClick={() => setPage('register')} style={styles.navButton}>JOIN</button>
          <Shield size={14} style={styles.adminIcon} onClick={() => setPage('admin')} />
        </div>
      </nav>

      {/* --- 前台首頁 --- */}
      {page === 'landing' && (
        <div style={styles.container}>
          <header style={styles.heroHeader}>
            <div style={styles.badge}>2026 DIGITAL SUMMIT</div>
            <h1 style={styles.heroTitle}>
              角板山 <span style={styles.gradientText}>藝文聯展</span><br/>
              <span style={styles.outlineText}>開幕活動</span>
            </h1>
            <p style={styles.heroSub}>
              解鎖無限數位潛力。與 PLUWFUN 共創年輕、創意、活力的數位未來。
            </p>
          </header>

          {/* 大圖區域：自動適應比例 */}
          <section style={styles.bannerFrame}>
            <img 
              src="/banner.jpg" 
              alt="Event Banner" 
              style={styles.bannerImg} 
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1600"; }}
            />
            <div style={styles.bannerOverlay}></div>
          </section>

          {/* 📍 聯展地圖區：手機版美學優化 */}
          <section style={styles.mapSection}>
            <div style={styles.sectionHeader}>
              <div style={styles.kicker}>LOCATION</div>
              <h2 style={styles.sectionTitle}>聯展地圖位置</h2>
            </div>
            <div style={styles.mapGrid}>
              <LocationCard 
                name="雪霧鬧繪本策展：林業故事館" 
                address="開幕會場" 
                link="https://www.google.com/maps/search/?api=1&query=雪霧鬧林業故事館" 
              />
              <LocationCard 
                name="米安咖啡：即石所在藝術展" 
                address="桃園市復興區（藝文展點）" 
                link="https://www.google.com/maps/search/?api=1&query=米安咖啡" 
              />
              <LocationCard 
                name="PLUWFUN 未來設計所" 
                address="桃園市復興區忠孝路86號" 
                link="https://www.google.com/maps/search/?api=1&query=桃園市復興區忠孝路86號" 
              />
            </div>
          </section>

          {/* 特色介紹 */}
          <section style={styles.featureGrid}>
            <FeatureItem icon={<Users size={20} color="#00C7FF"/>} title="頂尖交流" desc="跨界腦力激盪，與主理人共創未來。" />
            <FeatureItem icon={<MapPin size={20} color="#FF5630"/>} title="優質場域" desc="靈感碰撞空間，極致感官體驗。" />
          </section>
        </div>
      )}

      {/* --- 報名表單 --- */}
      {page === 'register' && (
        <div style={styles.formView}>
          <div style={styles.formCard}>
            <h2 style={styles.formHeading}>RSVP</h2>
            <form onSubmit={handleRegister} style={styles.form}>
              <div style={styles.inputWrap}><User size={16} color="#444"/><input style={styles.input} placeholder="姓名" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
              <div style={styles.inputWrap}><Phone size={16} color="#444"/><input style={styles.input} placeholder="電話" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required /></div>
              <input style={styles.simpleInput} placeholder="長官職務 / 店家名稱" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
              <button type="submit" style={styles.submitButton}>{isSubmitting ? '處理中...' : '確認提交'}</button>
            </form>
          </div>
        </div>
      )}

      {/* --- 管理後台 --- */}
      {page === 'admin' && (
        <div style={styles.adminLayout}>
          <div style={styles.adminHeader}>
            <h2 style={{fontSize: '18px'}}>報名清單 ({registrations.length})</h2>
            <button onClick={() => setPage('landing')} style={styles.exitBtn}>關閉</button>
          </div>
          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr><th style={styles.th}>姓名</th><th style={styles.th}>單位/職務</th><th style={styles.th}>日期</th></tr>
              </thead>
              <tbody>
                {registrations.map(r => (
                  <tr key={r.id} style={styles.tr}>
                    <td style={styles.td}>{r.name}</td>
                    <td style={styles.td}>{r.position || '無'}</td>
                    <td style={styles.td}>{new Date(r.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// 輔助組件
const LocationCard = ({ name, address, link }) => (
  <div style={styles.mapCard} onClick={() => window.open(link, '_blank')}>
    <div style={styles.mapIcon}><MapPin size={18} color="#00C7FF" /></div>
    <div style={styles.mapInfo}>
      <h4 style={styles.mapName}>{name}</h4>
      <p style={styles.mapAddr}>{address}</p>
    </div>
    <ExternalLink size={14} color="#333" />
  </div>
);

const FeatureItem = ({icon, title, desc}) => (
  <div style={styles.fCard}>
    <div style={styles.fIcon}>{icon}</div>
    <h3 style={styles.fTitle}>{title}</h3>
    <p style={styles.fDesc}>{desc}</p>
  </div>
);

// --- 🎨 視覺美學樣式表 ---
const styles = {
  wrapper: { backgroundColor: '#020408', color: '#FFF', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  
  // 導覽列：縮小比例增加精緻度
  nav: { height: '60px', padding: '0 6%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'fixed', top: 0, width: '100%', backgroundColor: 'rgba(2, 4, 8, 0.85)', backdropFilter: 'blur(15px)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 1000 },
  navLeft: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  navLogo: { height: '24px', width: 'auto' },
  brandTitle: { fontSize: '13px', fontWeight: '900', letterSpacing: '2px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '15px' },
  navButton: { background: '#fff', color: '#000', border: 'none', padding: '6px 16px', borderRadius: '4px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' },
  adminIcon: { opacity: 0.1, cursor: 'pointer' },

  // Hero 區塊：字級自動縮放
  container: { paddingTop: '100px', paddingBottom: '60px', maxWidth: '1200px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px' },
  heroHeader: { textAlign: 'center', marginBottom: '50px' },
  badge: { display: 'inline-block', padding: '4px 12px', border: '1px solid #222', borderRadius: '20px', fontSize: '10px', color: '#666', letterSpacing: '2px', marginBottom: '16px' },
  heroTitle: { fontSize: 'clamp(34px, 10vw, 72px)', fontWeight: '900', lineHeight: 1.1, marginBottom: '20px', letterSpacing: '-1px' },
  gradientText: { background: 'linear-gradient(90deg, #00C7FF, #0052CC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  outlineText: { WebkitTextStroke: '1px rgba(255,255,255,0.2)', color: 'transparent' },
  heroSub: { color: '#8F9BBA', fontSize: '16px', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto' },

  // Banner：圓角與投影
  bannerFrame: { width: '100%', borderRadius: '16px', overflow: 'hidden', position: 'relative', marginBottom: '60px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' },
  bannerImg: { width: '100%', height: 'auto', display: 'block', minHeight: '200px', objectFit: 'cover' },
  bannerOverlay: { position: 'absolute', bottom: 0, width: '100%', height: '40%', background: 'linear-gradient(to top, #020408, transparent)' },

  // 地圖列表：手機版優先排版
  mapSection: { marginBottom: '60px' },
  sectionHeader: { marginBottom: '20px' },
  kicker: { color: '#00C7FF', fontSize: '10px', fontWeight: 'bold', letterSpacing: '2px' },
  sectionTitle: { fontSize: '22px', fontWeight: '800' },
  mapGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  mapCard: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' },
  mapIcon: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(0,199,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  mapName: { fontSize: '14px', fontWeight: 'bold', marginBottom: '2px' },
  mapAddr: { fontSize: '11px', color: '#666' },

  // 特色卡片
  featureGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  fCard: { padding: '24px 16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' },
  fIcon: { marginBottom: '12px' },
  fTitle: { fontSize: '15px', fontWeight: 'bold', marginBottom: '6px' },
  fDesc: { color: '#8F9BBA', fontSize: '12px', lineHeight: 1.5 },

  // 表單頁面
  formView: { paddingTop: '140px', padding: '0 24px' },
  formCard: { maxWidth: '450px', margin: '0 auto', background: '#0a0c10', padding: '35px', borderRadius: '24px', border: '1px solid #1a1d23' },
  formHeading: { fontSize: '32px', fontWeight: '900', textAlign: 'center', marginBottom: '30px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  inputWrap: { display: 'flex', alignItems: 'center', gap: '12px', background: '#020408', borderRadius: '8px', padding: '0 15px', border: '1px solid #1a1d23' },
  input: { background: 'transparent', border: 'none', padding: '14px 0', color: '#fff', width: '100%', outline: 'none', fontSize: '14px' },
  simpleInput: { background: '#020408', border: '1px solid #1a1d23', padding: '14px', borderRadius: '8px', color: '#fff', outline: 'none', fontSize: '14px' },
  submitButton: { padding: '16px', backgroundColor: '#00C7FF', color: '#000', fontWeight: 'bold', borderRadius: '8px', border: 'none', cursor: 'pointer', marginTop: '10px' },

  // 管理後台
  adminLayout: { padding: '80px 6%' },
  adminHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  exitBtn: { background: 'transparent', border: '1px solid #333', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '12px' },
  tableCard: { backgroundColor: '#0a0c10', borderRadius: '12px', border: '1px solid #1a1d23', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', fontSize: '11px', color: '#444', borderBottom: '1px solid #1a1d23' },
  td: { padding: '12px', fontSize: '13px', borderBottom: '1px solid #0a0c10' }
};

export default App;