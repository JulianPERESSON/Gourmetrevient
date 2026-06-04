const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ margin: 50 });
const stream = fs.createWriteStream('C:\\Users\\julia\\Desktop\\Business_Plan_GourmetRevient.pdf');
doc.pipe(stream);

// Add the font required for some special characters if needed, but default is fine for standard French (Helvetica supports it).

doc.fontSize(20).fillColor('#2c3e50').text('Présentation de l\'activité (Business Pitch)', { align: 'center' });
doc.fontSize(20).text('GourmetRevient', { align: 'center' }).moveDown(1.5);

doc.fontSize(16).fillColor('#2980b9').text('1. Informations concernant l\'entreprise').moveDown(0.5);
doc.fontSize(12).fillColor('#333333')
   .text('Nom commercial : GourmetRevient')
   .text('Forme juridique : Entreprise Individuelle (Personne Physique)')
   .text('Numéro SIREN : 105 247 324 (R.C.S. Toulouse)')
   .text('Fondateur et CEO : Julian Sixte Guy Peresson')
   .text('Siège social : 6 avenue du Château d\'Eau, Appartement 5, 31470 Fonsorbes').moveDown(1.5);

doc.fontSize(16).fillColor('#2980b9').text('2. Produits et services proposés').moveDown(0.5);
doc.fontSize(12).fillColor('#333333')
   .text('GourmetRevient est une plateforme logicielle (SaaS) développée sur mesure pour les professionnels des métiers de bouche (pâtissiers, boulangers, traiteurs, restaurateurs).')
   .moveDown(0.5)
   .text('Notre application permet à nos clients de :')
   .text('  • Créer et gérer une base de données d\'ingrédients centralisée.')
   .text('  • Calculer automatiquement le coût de revient et les marges commerciales de leurs recettes.')
   .text('  • Générer des fiches techniques professionnelles (format PDF) pour leurs laboratoires.')
   .moveDown(0.5)
   .text('L\'accès à ce service est commercialisé sous la forme d\'abonnements numériques (mensuels et annuels) facturés de manière récurrente.').moveDown(1.5);

doc.fontSize(16).fillColor('#2980b9').text('3. Plan d\'opérationnalisation').moveDown(0.5);
doc.fontSize(12).fillColor('#333333')
   .text('  • Segment de clientèle (Cible) : Entreprises B2B du secteur de l\'artisanat alimentaire (boulangeries, pâtisseries indépendantes) et de la restauration, cherchant à digitaliser la gestion de leurs coûts et à optimiser leur rentabilité.')
   .moveDown(0.5)
   .text('  • Distributeurs et Canaux d\'acquisition : Vente directe et 100% numérique via notre site web officiel (gourmetrevient.fr). L\'acquisition se fera par le biais de prospection sur les réseaux sociaux professionnels (Instagram, LinkedIn), du référencement naturel (SEO) et du bouche-à-oreille au sein de la communauté des artisans.')
   .moveDown(0.5)
   .text('  • Partenaires et Fournisseurs : Étant une entreprise d\'édition de logiciel SaaS, nos principaux fournisseurs sont des prestataires d\'infrastructure technique fiables et reconnus, notamment pour l\'hébergement web et base de données (Supabase, GitHub, Vercel) et pour le traitement sécurisé des paiements (Stripe). Le développement logiciel est géré en interne.')
   .moveDown(0.5)
   .text('  • Structure de coûts : Le modèle SaaS implique de faibles coûts marginaux. Les dépenses principales concernent l\'hébergement serveur, le nom de domaine, et les frais de transaction liés aux abonnements.')

doc.end();
