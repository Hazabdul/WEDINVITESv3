import React from 'react';

/* ── More detailed floral sprout for the bottom of portraits ── */
function BottomFloral() {
  return (
    <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Central flower */}
      <circle cx="60" cy="25" r="4" fill="#8B5E3C" opacity="0.9" />
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <ellipse
          key={i}
          cx="60" cy="18" rx="5" ry="9"
          fill="#D4A96A" opacity="0.85"
          transform={`rotate(${angle} 60 25)`}
        />
      ))}

      {/* Left leaves/vines */}
      <path d="M55 28 Q40 25 25 32" stroke="#A0845C" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <ellipse cx="35" cy="26" rx="8" ry="4" fill="#B8956A" opacity="0.6" transform="rotate(-20 35 26)" />
      <circle cx="15" cy="32" r="2.5" fill="#C4956A" opacity="0.7" />

      {/* Right leaves/vines */}
      <path d="M65 28 Q80 25 95 32" stroke="#A0845C" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <ellipse cx="85" cy="26" rx="8" ry="4" fill="#B8956A" opacity="0.6" transform="rotate(20 85 26)" />
      <circle cx="105" cy="32" r="2.5" fill="#C4956A" opacity="0.7" />

      {/* Small buds */}
      <circle cx="50" cy="32" r="1.5" fill="#A0845C" opacity="0.5" />
      <circle cx="70" cy="32" r="1.5" fill="#A0845C" opacity="0.5" />
    </svg>
  );
}

/* ── Minimal botanical stem for background ── */
function BackgroundStem({ className }) {
  return (
    <svg
      width="60"
      height="120"
      viewBox="0 0 60 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M30 110 C30 80, 25 50, 10 20"
        stroke="#A0845C"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.2"
      />
      <path
        d="M30 110 C30 80, 35 50, 50 20"
        stroke="#A0845C"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.2"
      />
    </svg>
  );
}

/* ── CouplePortraits ── */
export function CouplePortraits({
  brideImage,
  groomImage,
  brideName = '',
  groomName = '',
  nameColor = '#5C4A2A',
}) {
  const hasBride = Boolean(brideImage);
  const hasGroom = Boolean(groomImage);
  const anyPresent = hasBride || hasGroom;

  if (!anyPresent) return null;

  return (
    <section className="couple-redesign-section">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Montserrat:wght@200;300;400&display=swap');

        @keyframes redesignFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes redesignScaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }

        .couple-redesign-section {
          width: 100%;
          background: #F5EFE0;
          padding: 0 20px 140px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .section-tagline {
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: #A0845C;
          margin-bottom: 50px;
          opacity: 0.8;
          animation: redesignFadeUp 1s ease forwards;
        }

        .portraits-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 50px;
          position: relative;
        }

        @media (max-width: 640px) {
          .couple-redesign-section { padding: 0 8px 60px; }
          .portraits-container {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            justify-content: center !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .image-vault {
            width: 140px !important;
            height: 200px !important;
            border-radius: 80px !important;
          }
          .vault-clip { border-radius: 80px !important; }
          .vault-clip::after { border-radius: 74px !important; }
          .display-name { font-size: 20px !important; }
          .role-label { font-size: 8px !important; }
          .flower-accent { transform: translateX(-50%) scale(0.7); bottom: -12px; }
          .name-signature { margin-top: 22px !important; }
        }

        .portrait-frame {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: redesignScaleIn 1.2s ease forwards;
        }

        .portrait-frame.bride { animation-delay: 0.2s; }
        .portrait-frame.groom { animation-delay: 0.4s; }

        .image-vault {
          width: 210px;
          height: 300px;
          border-radius: 100px; 
          overflow: visible; 
          position: relative;
          background: #fff;
          box-shadow: 0 20px 50px rgba(0,0,0,0.1);
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .image-vault:hover {
          transform: translateY(-8px);
        }

        .vault-clip {
          width: 100%;
          height: 100%;
          border-radius: 100px;
          overflow: hidden;
          position: relative;
          border: 1px solid rgba(160, 132, 92, 0.3);
        }

        .vault-clip img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
        }

        .vault-clip::after {
          content: '';
          position: absolute;
          inset: 8px;
          border-radius: 92px;
          border: 1px solid rgba(160, 132, 92, 0.15);
          pointer-events: none;
        }

        .flower-accent {
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          pointer-events: none;
          filter: drop-shadow(0 4px 10px rgba(0,0,0,0.1));
        }

        .name-signature {
          margin-top: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .role-label {
          font-family: 'Montserrat', sans-serif;
          font-size: 8px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #A0845C;
          font-weight: 500;
        }

        .display-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 34px;
          font-weight: 300;
          font-style: italic;
          color: #5C4A2A;
          line-height: 1;
        }

        .divider-stem {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.6;
        }

        .decorative-leaf-l { position: absolute; left: -25px; bottom: 30px; opacity: 0.2; transform: rotate(-10deg); }
        .decorative-leaf-r { position: absolute; right: -25px; bottom: 30px; opacity: 0.2; transform: rotate(10deg); }
      `}</style>

      <div className="section-tagline">The Bride & Groom</div>

      <div className="portraits-container">
        {hasBride && (
          <div className="portrait-frame bride">
            <div className="image-vault">
              <div className="vault-clip">
                <img src={brideImage} alt={brideName} />
                <BackgroundStem className="decorative-leaf-l" />
              </div>
              {/* Flower elements at bottom of image */}
              <div className="flower-accent">
                <BottomFloral />
              </div>
            </div>
            <div className="name-signature">
              <span className="role-label">The Bride</span>
              <span className="display-name" style={{ color: nameColor }}>{brideName}</span>
            </div>
          </div>
        )}

        {hasBride && hasGroom && (
          <div className="divider-stem">
            <svg width="2" height="200" viewBox="0 0 2 200" fill="none">
              <path d="M1 0V200" stroke="#A0845C" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />
              <circle cx="1" cy="100" r="4" fill="#F5EFE0" stroke="#A0845C" strokeWidth="0.5" />
            </svg>
          </div>
        )}

        {hasGroom && (
          <div className="portrait-frame groom">
            <div className="image-vault">
              <div className="vault-clip">
                <img src={groomImage} alt={groomName} />
                <BackgroundStem className="decorative-leaf-r" />
              </div>
              {/* Flower elements at bottom of image */}
              <div className="flower-accent">
                <BottomFloral />
              </div>
            </div>
            <div className="name-signature">
              <span className="role-label">The Groom</span>
              <span className="display-name" style={{ color: nameColor }}>{groomName}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default CouplePortraits;
