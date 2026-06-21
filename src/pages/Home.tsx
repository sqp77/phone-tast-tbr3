import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonContent,
  IonIcon, IonBadge, IonButton, IonRefresher, IonRefresherContent,
  IonSkeletonText,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
  notificationsOutline, flameOutline, timeOutline,
  checkmarkCircle, carOutline, searchOutline,
  heartOutline, trendingUpOutline, chevronForwardOutline,
  peopleOutline, locationOutline, giftOutline,
} from 'ionicons/icons';
import { STATS, CATEGORIES, URGENT_NEEDS, RECENT_DONATIONS, STATUS_MAP } from '../data/mockData';
import './Home.css';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'صباح الخير';
  if (h < 17) return 'مساء الخير';
  return 'مساء النور';
};

const STATUS_ICONS: Record<string, string> = {
  submitted:  timeOutline,
  reviewing:  timeOutline,
  accepted:   checkmarkCircle,
  in_transit: carOutline,
  delivered:  checkmarkCircle,
};

const Home: React.FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const handleRefresh = (e: CustomEvent) => {
    setTimeout(() => e.detail.complete(), 1200);
  };

  return (
    <IonPage>
      <IonHeader className="home-header">
        <IonToolbar className="home-toolbar">
          <div className="home-toolbar-inner">
            <div className="home-greeting">
              <p className="home-greeting-sub">{getGreeting()} 👋</p>
              <h1 className="home-greeting-title">منصة التبرعات</h1>
            </div>
            <button className="notif-btn" aria-label="الإشعارات">
              <IonIcon icon={notificationsOutline} />
              <span className="notif-dot" />
            </button>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="home-content" dir="rtl">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* ── Hero banner ── */}
        <div className="hero-banner">
          <div className="hero-text">
            <h2 className="hero-title">كل تبرع<br />يصنع فرقاً</h2>
            <p className="hero-sub">ساهم في مساعدة المحتاجين في المنطقة الشرقية</p>
            <IonButton className="hero-btn" onClick={() => history.push('/donate')}>
              <IonIcon slot="start" icon={giftOutline} />
              تبرع الآن
            </IonButton>
          </div>
          <div className="hero-art">
            <div className="hero-circle c1" />
            <div className="hero-circle c2" />
            <div className="hero-emoji">❤️</div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="stats-row">
          {STATS.map((s, i) => (
            <div className="stat-card" key={i} style={{ '--stat-color': s.color, '--stat-bg': s.bg } as React.CSSProperties}>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Categories ── */}
        <div className="section-header-row">
          <h3 className="section-title">
            <IonIcon icon={searchOutline} />
            تصفح حسب النوع
          </h3>
        </div>
        <div className="categories-scroll">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              className="category-chip"
              onClick={() => history.push('/donate')}
            >
              <span className="cat-emoji">{c.emoji}</span>
              <span className="cat-label">{c.label}</span>
            </button>
          ))}
        </div>

        {/* ── Urgent needs ── */}
        <div className="section-header-row">
          <h3 className="section-title urgent">
            <IonIcon icon={flameOutline} />
            احتياجات عاجلة
          </h3>
          <button className="see-all-btn">عرض الكل</button>
        </div>

        <div className="urgent-scroll">
          {URGENT_NEEDS.map(n => (
            <div key={n.id} className={`urgent-card ${n.urgent ? 'is-urgent' : ''}`}>
              {n.urgent && (
                <div className="urgent-ribbon">
                  <IonIcon icon={flameOutline} />
                  عاجل
                </div>
              )}
              <div className="urgent-emoji">{n.emoji}</div>
              <p className="urgent-title">{n.title}</p>
              <div className="urgent-meta">
                <span className="urgent-city">
                  <IonIcon icon={locationOutline} />
                  {n.city}
                </span>
                <span className="urgent-days">
                  <IonIcon icon={timeOutline} />
                  {n.daysLeft} أيام
                </span>
              </div>
              <IonButton
                expand="block"
                size="small"
                className="urgent-btn"
                onClick={() => history.push('/donate')}
              >
                تبرع الآن
              </IonButton>
            </div>
          ))}
        </div>

        {/* ── Recent donations ── */}
        <div className="section-header-row">
          <h3 className="section-title">
            <IonIcon icon={trendingUpOutline} />
            آخر التبرعات
          </h3>
        </div>

        <div className="recent-list">
          {RECENT_DONATIONS.map(d => {
            const st = STATUS_MAP[d.status];
            return (
              <div key={d.id} className="recent-card">
                <div className="recent-avatar" style={{ background: d.color }}>
                  {d.initials}
                </div>
                <div className="recent-info">
                  <p className="recent-name">{d.name}</p>
                  <p className="recent-meta">
                    {d.type} &bull; {d.city}
                  </p>
                </div>
                <div className="recent-right">
                  <span
                    className="status-badge"
                    style={{ color: st.color, background: st.bg }}
                  >
                    <IonIcon icon={STATUS_ICONS[d.status]} />
                    {st.label}
                  </span>
                  <span className="recent-ago">{d.ago}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Impact ── */}
        <div className="impact-banner">
          <div className="impact-icon">
            <IonIcon icon={peopleOutline} />
          </div>
          <div>
            <p className="impact-title">أثّرت في 389 عائلة</p>
            <p className="impact-sub">مجتمعنا يصنع الفرق يومياً</p>
          </div>
          <IonIcon icon={chevronForwardOutline} className="impact-arrow" />
        </div>

        <div className="home-footer">
          <IonIcon icon={heartOutline} />
          <p>منصة التبرعات — المنطقة الشرقية</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
