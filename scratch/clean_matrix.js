function renderAllergenMatrix() {
  const table = document.getElementById('allergenMatrixTable');
  if (!table) return;

  // Use both saved and reference recipes so it's never empty
  const recipes = [...(APP.savedRecipes || []), ...(typeof RECIPES !== 'undefined' ? RECIPES : [])];
  
  if (recipes.length === 0) {
    table.innerHTML = `<tr><td colspan="15" style="text-align:center; padding:3rem;">
      <div class="mgmt-empty-state">
        <div class="empty-icon">ðŸ›¡ï¸</div>
        <h4>Aucune recette détectée</h4>
        <p>Enregistrez des recettes pour générer la matrice.</p>
      </div>
    </td></tr>`;
    return;
  }

  const allAllergens = [
    { key: "Lait", emoji: "ðŸ¥›" },
    { key: "Å’ufs", emoji: "ðŸ¥š" },
    { key: "Gluten", emoji: "ðŸŒ¾" },
    { key: "Fruits à coque", emoji: "ðŸ¥œ" },
    { key: "Soja", emoji: "ðŸ«˜" },
    { key: "Arachides", emoji: "ðŸ¥œ" },
    { key: "Sésame", emoji: "ðŸŒ°" },
    { key: "Moutarde", emoji: "ðŸŸ¡" },
    { key: "Lupin", emoji: "ðŸŒ¿" },
    { key: "Sulfites", emoji: "ðŸ§ª" },
    { key: "Poisson", emoji: "ðŸŸ" },
    { key: "Crustacés", emoji: "ðŸ¦" },
    { key: "Mollusques", emoji: "ðŸš" },
    { key: "Céleri", emoji: "ðŸ¥¬" }
  ];
  
  let html = `
    <thead>
      <tr>
        <th>Recette</th>
        ${allAllergens.map(a => `<th><span title="${a.key}">${a.emoji}</span><br><span style="font-size:0.55rem;">${a.key}</span></th>`).join('')}
      </tr>
    </thead>
    <tbody>
  `;

  recipes.forEach(r => {
    const foundAllergens = new Set();
    const ings = r.ingredients || [];
    
    ings.forEach(ing => {
      const n = (ing.name || '').toLowerCase();
      // Basic heuristic detection
      if (n.includes('lait') || n.includes('beurre') || n.includes('crème') || n.includes('cream') || n.includes('mascarpone')) foundAllergens.add('Lait');
      if (n.includes('Å“uf') || n.includes('oeuf') || n.includes('jaune') || n.includes('blanc')) foundAllergens.add('Å’ufs');
      if (n.includes('farine') || n.includes('blé') || n.includes('gluten')) foundAllergens.add('Gluten');
      if (n.includes('amande') || n.includes('noisette') || n.includes('noix') || n.includes('pistache') || n.includes('praliné')) foundAllergens.add('Fruits à coque');
      if (n.includes('soja')) foundAllergens.add('Soja');
      if (n.includes('arachide') || n.includes('cacahu')) foundAllergens.add('Arachides');
      if (n.includes('sésame')) foundAllergens.add('Sésame');
      if (n.includes('moutarde')) foundAllergens.add('Moutarde');
      if (n.includes('sulfite') || n.includes('vin')) foundAllergens.add('Sulfites');
    });

    html += `
      <tr>
        <td style="text-align:left; font-weight:600;">${r.name}</td>
        ${allAllergens.map(a => `
          <td><span class="allergen-badge ${foundAllergens.has(a.key) ? 'present' : 'absent'}">${foundAllergens.has(a.key) ? 'â—' : 'â€”'}</span></td>
        `).join('')}
      </tr>
    `;
  });

  html += `</tbody>`;
  table.innerHTML = html;
}
