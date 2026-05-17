// blog-data.js - Centralisation des articles du blog GourmetRevient

const blogArticles = [
  {
    id: "cout-de-revient-guide",
    title: "Calculer son coût de revient en pâtisserie : le guide ultime",
    category: "Rentabilité",
    excerpt: "Le calcul du prix de revient est le fondement de toute pâtisserie rentable. Découvrez notre méthode pas à pas avec un exemple d'éclair au chocolat.",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800",
    date: "12 Mai 2026",
    readTime: "8 min",
    author: "Julian Peresson",
    url: "article-cout-de-revient-guide.html",
    tags: ["coût de revient", "marge", "pricing", "rentabilité", "éclair au chocolat"]
  },
  {
    id: "haccp-releves-temperature",
    title: "HACCP en pâtisserie : digitaliser ses relevés pour gagner du temps",
    category: "Hygiène & HACCP",
    excerpt: "Fini les classeurs papier encombrants ! Découvrez comment digitaliser vos relevés de température et sécuriser vos contrôles sanitaires.",
    image: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800",
    date: "08 Mai 2026",
    readTime: "6 min",
    author: "Julian Peresson",
    url: "article-haccp-releves-temperature.html",
    tags: ["HACCP", "hygiène", "relevés", "température", "réglementation"]
  },
  {
    id: "fixer-prix-vente-patisserie",
    title: "Comment fixer le prix de vente de ses pâtisseries sans perdre d'argent",
    category: "Rentabilité",
    excerpt: "Découvrez les 3 erreurs classiques sur le pricing, le calcul du coefficient multiplicateur et l'impact réel de vos charges sur une tarte aux fraises.",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800",
    date: "02 Mai 2026",
    readTime: "7 min",
    author: "Julian Peresson",
    url: "article-fixer-prix-vente-patisserie.html",
    tags: ["prix de vente", "pricing", "rentabilité", "coefficient", "tarte aux fraises"]
  },
  {
    id: "cout-revient-macaron",
    title: "Coût de revient d'un macaron : calcul détaillé et prix de vente conseillé",
    category: "Rentabilité",
    excerpt: "Un guide ultra-spécifique avec le calcul réel ingrédient par ingrédient pour 30 macarons et des conseils pour maximiser vos gains.",
    image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800",
    date: "28 Avril 2026",
    readTime: "9 min",
    author: "Julian Peresson",
    url: "article-cout-revient-macaron.html",
    tags: ["macaron", "coût de revient", "matière première", "calcul", "rentabilité"]
  },
  {
    id: "allergenes-inco-patisserie",
    title: "Les 14 allergènes obligatoires en pâtisserie — guide INCO complet 2024",
    category: "Hygiène & HACCP",
    excerpt: "Tout savoir sur les 14 allergènes obligatoires, l'affichage réglementaire et les sanctions en vigueur pour protéger vos clients sereinement.",
    image: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800",
    date: "22 Avril 2026",
    readTime: "6 min",
    author: "Julian Peresson",
    url: "article-allergenes-inco-patisserie.html",
    tags: ["allergènes", "INCO", "hygiène", "réglementation", "sécurité"]
  },
  {
    id: "ouvrir-patisserie-artisanale",
    title: "Ouvrir sa pâtisserie artisanale en 2026 : les étapes clés",
    category: "Gestion",
    excerpt: "Du business plan au choix des équipements en passant par la réglementation : le guide complet pour lancer votre projet en 2026.",
    image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800",
    date: "15 Avril 2026",
    readTime: "10 min",
    author: "Julian Peresson",
    url: "article-ouvrir-patisserie-artisanale.html",
    tags: ["création", "gestion", "business plan", "équipement", "financement"]
  },
  {
    id: "gerer-stock-patisserie",
    title: "Gérer ses stocks en pâtisserie artisanale : méthode et outils",
    category: "Gestion",
    excerpt: "Comment en finir avec les pertes de matières premières grâce à la méthode FIFO, aux seuils d'alerte et à l'automatisation des stocks.",
    image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800",
    date: "09 Avril 2026",
    readTime: "7 min",
    author: "Julian Peresson",
    url: "article-gerer-stock-patisserie.html",
    tags: ["stocks", "gestion", "pertes", "FIFO", "matières premières"]
  },
  {
    id: "planning-production-patisserie",
    title: "Planning de production en pâtisserie : comment s'organiser efficacement",
    category: "Gestion",
    excerpt: "Organisez vos semaines de production, anticipez les commandes clients et optimisez le travail de votre équipe en laboratoire.",
    image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800",
    date: "02 Avril 2026",
    readTime: "8 min",
    author: "Julian Peresson",
    url: "article-planning-production-patisserie.html",
    tags: ["production", "planning", "organisation", "laboratoire", "équipe"]
  },
  {
    id: "inflation-marge-patisserie",
    title: "Inflation et pâtisserie artisanale : comment protéger ses marges",
    category: "Rentabilité",
    excerpt: "Faced à la hausse du beurre, des œufs et de l'énergie, découvrez des stratégies applicables immédiatement pour maintenir vos marges.",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800",
    date: "25 Mars 2026",
    readTime: "7 min",
    author: "Julian Peresson",
    url: "article-inflation-marge-patisserie.html",
    tags: ["inflation", "marge", "rentabilité", "matières premières", "optimisation"]
  },
  {
    id: "cap-patisserie-ep1-ep2",
    title: "CAP Pâtisserie : réussir ses épreuves EP1 et EP2 — conseils d'un apprenti",
    category: "Formation CAP",
    excerpt: "Julian Peresson vous livre son expérience, ses astuces d'organisation d'examen et l'importance cruciale de la feuille d'ordonnancement.",
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800",
    date: "18 Mars 2026",
    readTime: "8 min",
    author: "Julian Peresson",
    url: "article-cap-patisserie-ep1-ep2.html",
    tags: ["CAP Pâtisserie", "formation", "examen", "ordonnancement", "conseils"]
  },
  {
    id: "excel-vs-logiciel-patisserie",
    title: "Excel vs logiciel de gestion pâtisserie : lequel choisir en 2026 ?",
    category: "Gestion",
    excerpt: "Un comparatif complet et objectif entre le tableur traditionnel et un outil SaaS moderne pour piloter la rentabilité de votre laboratoire.",
    image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800",
    date: "10 Mars 2026",
    readTime: "7 min",
    author: "Julian Peresson",
    url: "article-excel-vs-logiciel-patisserie.html",
    tags: ["Excel", "logiciel de gestion", "gestion", "rentabilité", "outils"]
  },
  {
    id: "5-erreurs-prix-patissier",
    title: "5 erreurs que font les pâtissiers artisans avec leurs prix de vente",
    category: "Rentabilité",
    excerpt: "Identifiez et corrigez immédiatement ces 5 erreurs classiques de tarification qui grignotent silencieusement vos bénéfices journaliers.",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800",
    date: "03 Mars 2026",
    readTime: "6 min",
    author: "Julian Peresson",
    url: "article-5-erreurs-prix-patissier.html",
    tags: ["erreurs", "prix de vente", "rentabilité", "pricing", "artisanat"]
  },
  {
    id: "digitaliser-laboratoire-budget",
    title: "Comment digitaliser son laboratoire de pâtisserie sans budget",
    category: "Gestion",
    excerpt: "Découvrez des outils gratuits et des méthodes astucieuses pour moderniser votre laboratoire et piloter votre rentabilité à moindres frais.",
    image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800",
    date: "24 Février 2026",
    readTime: "7 min",
    author: "Julian Peresson",
    url: "article-digitaliser-laboratoire-budget.html",
    tags: ["digitalisation", "gratuit", "gestion", "laboratoire", "GourmetRevient"]
  }
];

// Helper to filter articles by category or query
function getFilteredArticles(category = "Tous", query = "") {
  return blogArticles.filter(article => {
    const matchesCategory = category === "Tous" || article.category.toLowerCase() === category.toLowerCase();
    const queryLower = query.toLowerCase().trim();
    const matchesQuery = !queryLower || 
      article.title.toLowerCase().includes(queryLower) || 
      article.excerpt.toLowerCase().includes(queryLower) ||
      article.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
      article.category.toLowerCase().includes(queryLower);
    return matchesCategory && matchesQuery;
  });
}

// Helper to get similar articles (same category or sharing tags, excluding the current one)
function getSimilarArticles(currentId, limit = 3) {
  const currentArticle = blogArticles.find(a => a.id === currentId);
  if (!currentArticle) return [];
  
  return blogArticles
    .filter(a => a.id !== currentId)
    .map(a => {
      // Calculate score based on category match and shared tags
      let score = 0;
      if (a.category === currentArticle.category) score += 5;
      const sharedTags = a.tags.filter(t => currentArticle.tags.includes(t));
      score += sharedTags.length * 2;
      return { article: a, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.article)
    .slice(0, limit);
}

// Export for browser usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { blogArticles, getFilteredArticles, getSimilarArticles };
}
