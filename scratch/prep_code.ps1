[System.IO.File]::WriteAllText("scratch\render_code.txt", "function renderAllergenMatrix() {
  const table = document.getElementById('allergenMatrixTable');
  if (!table) return;

  const recipes = [...(APP.savedRecipes || []), ...(typeof RECIPES !== 'undefined' ? RECIPES : [])];
  
  if (recipes.length === 0) {
    table.innerHTML = '<tr><td colspan=\"15\" style=\"text-align:center; padding:3rem;\"><div class=\"mgmt-empty-state\"><h4>Aucune recette détectée</h4><p>Enregistrez des recettes pour générer la matrice.</p></div></td></tr>';
    return;
  }

  const allAllergens = [
    { key: 'Lait', emoji: '🥛' },
    { key: 'Œufs', emoji: '🥚' },
    { key: 'Gluten', emoji: '🌾' },
    { key: 'Fruits à coque', emoji: '🥜' },
    { key: 'Soja', emoji: '🫘' },
    { key: 'Arachides', emoji: '🥜' },
    { key: 'Sésame', emoji: '🌰' },
    { key: 'Moutarde', emoji: '🟡' },
    { key: 'Lupin', emoji: '🌿' },
    { key: 'Sulfites', emoji: '🧪' },
    { key: 'Poisson', emoji: '🐟' },
    { key: 'Crustacés', emoji: '🦐' },
    { key: 'Mollusques', emoji: '🐚' },
    { key: 'Céleri', emoji: '🥬' }
  ];
  
  let html = '<thead><tr><th>Recette</th>' + allAllergens.map(a => '<th>' + a.emoji + '<br><span style=\"font-size:0.55rem;\">' + a.key + '</span></th>').join('') + '</tr></thead><tbody>';

  recipes.forEach(r => {
    const foundAllergens = new Set();
    const ings = r.ingredients || [];
    ings.forEach(ing => {
      const n = (ing.name || '').toLowerCase();
      if (n.includes('lait') || n.includes('beurre') || n.includes('crème') || n.includes('mascarpone')) foundAllergens.add('Lait');
      if (n.includes('œuf') || n.includes('oeuf') || n.includes('jaune') || n.includes('blanc')) foundAllergens.add('Œufs');
      if (n.includes('farine') || n.includes('blé') || n.includes('gluten')) foundAllergens.add('Gluten');
      if (n.includes('amande') || n.includes('noisette') || n.includes('noix') || n.includes('pistache')) foundAllergens.add('Fruits à coque');
      if (n.includes('soja')) foundAllergens.add('Soja');
      if (n.includes('arachide')) foundAllergens.add('Arachides');
      if (n.includes('sésame')) foundAllergens.add('Sésame');
      if (n.includes('moutarde')) foundAllergens.add('Moutarde');
    });

    html += '<tr><td style=\"text-align:left; font-weight:600;\">' + r.name + '</td>' + allAllergens.map(a => '<td><span class=\"allergen-badge ' + (foundAllergens.has(a.key) ? 'present' : 'absent') + '\">' + (foundAllergens.has(a.key) ? '●' : '—') + '</span></td>').join('') + '</tr>';
  });

  html += '</tbody>';
  table.innerHTML = html;
}")
