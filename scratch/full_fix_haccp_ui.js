const fs = require('fs');

function fullFix() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');

        // 1. Restore Calendar Logic (Fixing the truncation damage)
        const brokenCalendarPattern = /const mmDd = dateStr\.slice\(5\);[\s\S]+?if \(document\.readyState === 'loading'\)/;
        const restoredCalendarPart = `const mmDd = dateStr.slice(5);
                        const isWE = date.getDay() === 0 || date.getDay() === 6;
                        const holidayRange = zoneHolidays[currentZone] || zoneHolidays.C;
                        
                        let isVacation = false;
                        if ((dateStr >= holidayRange[0] && dateStr <= holidayRange[1]) || 
                            (dateStr >= holidayRange[2] && dateStr <= holidayRange[3]) ||
                            (dateStr >= '2026-07-04' && dateStr <= '2026-08-31') ||
                            (dateStr >= '2026-10-17' && dateStr <= '2026-11-02') ||
                            (dateStr >= '2026-12-19' && dateStr <= '2027-01-04')) {
                            isVacation = true;
                        }

                        const event = events[mmDd];
                        let cellStyle = \`height:46px; display:flex; align-items:center; justify-content:center; font-size:0.9rem; font-weight:800; border-radius:8px; position:relative; \`;
                        
                        if (event) cellStyle += \`background:var(--accent); color:white; scale:1.15; z-index:2; box-shadow:0 6px 12px var(--accent-glow); margin:0 2px;\`;
                        else if (isVacation) cellStyle += \`background:rgba(16, 185, 129, 0.15); color:var(--success); \`;
                        else if (isWE) cellStyle += \`background:var(--bg-alt); opacity:0.6; \`;
                        else cellStyle += \`background:rgba(0,0,0,0.02); color:var(--text-secondary);\`;

                        html += \`<div style="\${cellStyle}" title="\${event || (isVacation ? 'Vacances' : '')}">
                            \${d}\${event ? \`<span style="position:absolute; bottom:0px; font-size:0.55rem; width:100%; text-align:center;">\${event.split(' ')[0]}</span>\` : ''}
                        </div>\`;
                    }
                    html += \`</div></div>\`;
                }
                container.innerHTML = html;
            }
            if (document.readyState === 'loading')`;
        
        content = content.replace(brokenCalendarPattern, restoredCalendarPart);

        // 2. Fix HACCP Sidebar Icons (Remove them)
        content = content.replace(/<span class="icon">🧻<\/span> <span>Nettoyage<\/span>/g, '<span>Nettoyage</span>');
        content = content.replace(/<span class="icon"> ·<\/span> <span>Traçabilité<\/span>/g, '<span>Traçabilité</span>');
        content = content.replace(/<span class="icon">🛡️ <\/span> <span>Allergènes<\/span>/g, '<span>Allergènes</span>');
        
        // 3. Fix Button Overlap in Recipe Calc (Step 5)
        // I will find the export-actions and force a better layout
        const exportActionsStyle = `.export-actions {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.export-actions .btn {
  flex: 1;
  min-width: 140px;
  margin: 0 !important;
  position: relative !important;
  top: 0 !important;
  left: 0 !important;
}`;
        content = content.replace(/\.export-actions \{[\s\S]+?\}/, exportActionsStyle);

        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Full fix applied: Calendar restored, Sidebar cleaned, Buttons fixed.");
    } catch (err) {
        console.error("Error:", err);
    }
}

fullFix();
