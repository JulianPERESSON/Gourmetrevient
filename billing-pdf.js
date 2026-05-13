/**
 * GourmetRevient — Billing PDF Engine v1.0
 * Generates high-fidelity invoice/receipt PDFs for Pro subscribers.
 */

const GourmetInvoice = (() => {
  
  const INVOICE_STYLES = `
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1e293b; line-height: 1.5; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 60px; border-bottom: 2px solid #f1f5f9; padding-bottom: 30px; }
    .logo { font-size: 2.5rem; filter: grayscale(0.2); }
    .company-info h1 { margin: 0; font-size: 1.5rem; font-weight: 850; color: #6366f1; letter-spacing: -0.5px; }
    .company-info p { margin: 2px 0; font-size: 0.85rem; color: #64748b; }
    
    .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 50px; }
    .details-box h3 { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin-bottom: 10px; letter-spacing: 1px; }
    .details-box p { margin: 0; font-weight: 600; font-size: 1rem; }
    .details-box .sub { font-weight: 400; color: #64748b; font-size: 0.85rem; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
    th { text-align: left; background: #f8fafc; padding: 12px 15px; font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
    td { padding: 20px 15px; border-bottom: 1px solid #f1f5f9; font-size: 0.95rem; }
    .price-col { text-align: right; }

    .totals { margin-left: auto; width: 300px; }
    .total-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
    .total-row.grand-total { border-bottom: none; margin-top: 10px; padding: 15px 0; border-top: 2px solid #6366f1; color: #6366f1; font-weight: 850; font-size: 1.25rem; }
    
    .footer { margin-top: 80px; text-align: center; font-size: 0.75rem; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 30px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 100px; background: #dcfce7; color: #166534; font-weight: 800; font-size: 0.7rem; }
    
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  `;

  function generate(data) {
    const { user, invoiceId, date, amount, planName } = data;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Facture GourmetRevient - ${invoiceId}</title>
        <style>${INVOICE_STYLES}</style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <div class="logo">🧁</div>
            <h1>GourmetRevient SaaS</h1>
            <p>Intelligence Culinaire & Pilotage</p>
            <p>75008 Paris, France</p>
            <p>SIRET: 912 345 678 00012</p>
          </div>
          <div style="text-align: right;">
            <h2 style="margin:0; font-size: 2rem; font-weight: 900; color: #e2e8f0;">FACTURE</h2>
            <p style="font-weight: 800; color: #64748b; margin: 5px 0;"># ${invoiceId}</p>
            <span class="badge">PAYÉE ✅</span>
          </div>
        </div>

        <div class="invoice-details">
          <div class="details-box">
            <h3>Facturé à :</h3>
            <p>${user.name || 'Chef Gourmet'}</p>
            <p class="sub">${user.email}</p>
          </div>
          <div class="details-box" style="text-align: right;">
            <h3>Détails :</h3>
            <p>Date : ${new Date(date).toLocaleDateString('fr-FR')}</p>
            <p class="sub">Mode de paiement : Carte Bancaire (via Stripe)</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="price-col">Quantité</th>
              <th class="price-col">Prix Unitaire</th>
              <th class="price-col">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style="font-weight: 800;">Abonnement GourmetRevient ${planName}</div>
                <div style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">Accès complet aux outils de pilotage ERP, Inventaire Cloud et CRM.</div>
              </td>
              <td class="price-col">1</td>
              <td class="price-col">${amount.toFixed(2)} €</td>
              <td class="price-col">${amount.toFixed(2)} €</td>
            </tr>
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Sous-total HT</span>
            <span>${(amount / 1.2).toFixed(2)} €</span>
          </div>
          <div class="total-row">
            <span>TVA (20%)</span>
            <span>${(amount - (amount / 1.2)).toFixed(2)} €</span>
          </div>
          <div class="total-row grand-total">
            <span>TOTAL TTC</span>
            <span>${amount.toFixed(2)} €</span>
          </div>
        </div>

        <div class="footer">
          <p>GourmetRevient — La plateforme n°1 pour les artisans de la gastronomie.</p>
          <p>Merci pour votre confiance ! En cas de question, contactez support@gourmetrevient.fr</p>
        </div>
        
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
              // window.close(); // Some browsers block this
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  }

  return { generate };
})();

window.GourmetInvoice = GourmetInvoice;
