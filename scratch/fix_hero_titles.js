const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Replace mgmt hero title
content = content.replace(/<div class="hero-badge" data-i18n="mgmt\.hero\.badge">[^<]+<\/div>\s*<h2 data-i18n="hero\.title">[^<]+<span class="accent">recettes<\/span><br>pour la pâtisserie<\/h2>/, '<div class="hero-badge" data-i18n="mgmt.hero.badge"> Excellence Opérationnelle</div>\n        <h2 data-i18n="mgmt.hero.title">Gestion Experte & <span class="accent">Rentabilité</span></h2>');

// Replace scheduler hero title
content = content.replace(/<div class="hero-badge" style="[^"]+" data-i18n="scheduler\.hero\.badge">[^<]+<\/div>\s*<h2 data-i18n="hero\.title">[^<]+<span class="accent">recettes<\/span><br>pour la pâtisserie<\/h2>/, '<div class="hero-badge" style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6;" data-i18n="scheduler.hero.badge">🎓 Excellence Académique</div>\n        <h2 data-i18n="scheduler.hero.title">Stratégie & <span class="accent">Ordonnanceur CAP</span></h2>');

// Replace haccp hero title
content = content.replace(/<div class="hero-badge" data-i18n="haccp\.hero\.badge">[^<]+<\/div>\s*<h2 data-i18n="hero\.title">[^<]+<span class="accent">recettes<\/span><br>pour la pâtisserie<\/h2>/, '<div class="hero-badge" data-i18n="haccp.hero.badge">🛡️  Conformité & Sécurité</div>\n        <h2 data-i18n="haccp.hero.title">HACCP <span class="accent">Expert PRO</span></h2>');

fs.writeFileSync('index.html', content, 'utf8');
console.log('Fixed hero titles in index.html!');
