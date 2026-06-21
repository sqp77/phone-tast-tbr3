import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonContent,
  IonIcon, IonButton,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
  addOutline, checkmarkCircle, timeOutline, carOutline,
  locationOutline, calendarOutline, layersOutline,
  giftOutline, documentTextOutline, chevronDownOutline,
  chevronUpOutline, ribbonOutline,
} from 'ionicons/icons';
import { MY_DONATIONS, MyDonation, STATUS_MAP } from '../data/mockData';
import './MyDonations.css';

const STEP_ICONS = [timeOutline, timeOutline, checkmarkCircle, carOutline, checkmarkCircle];

const DonationCard: React.FC<{ donation: MyDonation }> = ({ donation: d }) => {
  const [expanded, setExpanded] = useState(false);
  const st = STATUS_MAP[d.status];
  const doneCount = d.steps.filter(s => s.done).length;
  const progress = (doneCount / d.steps.length) * 100;

  return (
    <div className="don-card">
      {/* Card header */}
      <div className="don-card-top">
        <div className="don-emoji-wrap">{d.emoji}</div>
        <div className="don-card-info">
          <p className="don-type">{d.type}</p>
          <p className="don-desc">{d.description}</p>
          <div className="don-meta-row">
            <span className="don-meta">
              <IonIcon icon={locationOutline} /> {d.region}
            </span>
            <span className="don-meta">
              <IonIcon icon={layersOutline} /> {d.quantity} قطعة
            </span>
          </div>
        </div>
        <span className="don-status" style={{ color: st.color, background: st.bg }}>
          {st.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="don-progress-wrap">
        <div className="don-progress-track">
          <div className="don-progress-fill" style={{ width: `${progress}%`, background: st.color }} />
        </div>
        <span className="don-progress-pct" style={{ color: st.color }}>
          {Math.round(progress)}%
        </span>
      </div>

      {/* Expand toggle */}
      <button className="don-toggle" onClick={() => setExpanded(e => !e)}>
        <span>تتبع الطلب</span>
        <IonIcon icon={expanded ? chevronUpOutline : chevronDownOutline} />
      </button>

      {/* Timeline */}
      {expanded && (
        <div className="don-timeline">
          {d.steps.map((step, i) => (
            <div key={i} className={`timeline-row ${step.done ? 'done' : 'pending'}`}>
              <div className="timeline-line-wrap">
                <div className="timeline-dot">
                  <IonIcon icon={STEP_ICONS[i]} />
                </div>
                {i < d.steps.length - 1 && (
                  <div className={`timeline-connector ${d.steps[i + 1].done ? 'done' : ''}`} />
                )}
              </div>
              <div className="timeline-content">
                <p className="timeline-label">{step.label}</p>
                {step.date ? (
                  <p className="timeline-date">
                    <IonIcon icon={calendarOutline} /> {step.date}
                  </p>
                ) : (
                  <p className="timeline-pending">في انتظار التحديث</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer meta */}
      <div className="don-footer-meta">
        <span className="don-id"># {d.id}</span>
        <span className="don-date">
          <IonIcon icon={calendarOutline} /> {d.submittedAt}
        </span>
      </div>
    </div>
  );
};

const MyDonations: React.FC = () => {
  const history = useHistory();
  const total     = MY_DONATIONS.length;
  const delivered = MY_DONATIONS.filter(d => d.status === 'delivered').length;

  return (
    <IonPage>
      <IonHeader className="md-header">
        <IonToolbar className="md-toolbar">
          <div className="md-toolbar-inner">
            <div>
              <p className="md-toolbar-sub">سجل التبرعات</p>
              <h2 className="md-toolbar-title">تبرعاتي</h2>
            </div>
            <div className="md-toolbar-stats">
              <div className="md-mini-stat">
                <span className="md-mini-val">{total}</span>
                <span className="md-mini-label">إجمالي</span>
              </div>
              <div className="md-mini-divider" />
              <div className="md-mini-stat">
                <span className="md-mini-val" style={{ color: '#a7f3c4' }}>{delivered}</span>
                <span className="md-mini-label">مُسلَّم</span>
              </div>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="md-content" dir="rtl">

        {/* Achievement banner */}
        {delivered > 0 && (
          <div className="achievement-banner">
            <IonIcon icon={ribbonOutline} className="ach-icon" />
            <div>
              <p className="ach-title">أحسنت! 🎉</p>
              <p className="ach-sub">لقد ساهمت في توصيل {delivered} تبرع لمستحقيه</p>
            </div>
          </div>
        )}

        {/* Donations list */}
        {MY_DONATIONS.length > 0 ? (
          <div className="don-list">
            {MY_DONATIONS.map(d => (
              <DonationCard key={d.id} donation={d} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="empty-state">
            <div className="empty-icon">
              <IonIcon icon={giftOutline} />
            </div>
            <h3 className="empty-title">لم تقدم تبرعاً بعد</h3>
            <p className="empty-sub">ابدأ رحلة العطاء وساهم في مساعدة المحتاجين</p>
          </div>
        )}

        {/* CTA */}
        <div className="md-cta">
          <IonButton expand="block" className="add-don-btn" onClick={() => history.push('/donate')}>
            <IonIcon slot="start" icon={addOutline} />
            تقديم تبرع جديد
          </IonButton>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default MyDonations;
