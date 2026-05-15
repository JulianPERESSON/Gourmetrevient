const fs = require('fs');

function integrateRGPD() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');

        // 1. Ensure the script is included
        if (!content.includes('rgpd-banner.js')) {
            content = content.replace('</body>', '  <script src="rgpd-banner.js?v=1.0.0"></script>\n</body>');
        }

        // 2. Add RGPD CSS
        const rgpdCSS = `
/* --- RGPD Cookie Banner --- */
#rgpdBanner {
  position: fixed;
  bottom: 24px;
  left: 24px;
  right: 24px;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 1.5rem 2rem;
  z-index: 20000;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  transform: translateY(150%);
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

#rgpdBanner.rgpd-visible { transform: translateY(0); }
#rgpdBanner.rgpd-hiding { transform: translateY(150%); }

.rgpd-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.rgpd-left {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.rgpd-icon { font-size: 2rem; }

.rgpd-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rgpd-text strong {
  color: #ffffff;
  font-size: 1.1rem;
  font-family: var(--font-display);
}

.rgpd-text span {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.4;
}

.rgpd-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 700;
  font-size: 0.85rem;
}

.rgpd-actions {
  display: flex;
  gap: 12px;
}

.rgpd-btn-primary {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}

.rgpd-btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
}

.rgpd-pref-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

@media (max-width: 768px) {
  .rgpd-inner { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
  .rgpd-actions { width: 100%; flex-direction: column; }
  .rgpd-btn-primary, .rgpd-btn-secondary { width: 100%; }
}
`;
        content = content.replace('</style>', rgpdCSS + '\n</style>');

        fs.writeFileSync('index.html', content, 'utf8');
        console.log("RGPD Banner integrated into index.html.");
    } catch (err) {
        console.error("Error:", err);
    }
}

integrateRGPD();
