/**
 * GourmetRevient Support Service — v1.0
 * Handles the Support Center interactions and messaging.
 */

window.openSupport = function() {
    const modal = document.getElementById('supportModal');
    if (modal) {
        modal.style.display = 'flex';
        // Add a slight delay to allow the overlay to appear before focusing
        setTimeout(() => {
            const textarea = document.getElementById('supportMessage');
            if (textarea) textarea.focus();
        }, 100);
    }
};

window.closeSupport = function() {
    const modal = document.getElementById('supportModal');
    if (modal) modal.style.display = 'none';
};

window.sendSupportMessage = async function(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button[type="submit"]');
    const message = document.getElementById('supportMessage').value;
    
    if (!message.trim()) return;

    // UI State: Loading
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="display:inline-block; width:20px; height:20px; border:3px solid rgba(255,255,255,0.3); border-radius:50%; border-top-color:white; animation:spin 1s linear infinite;"></span>';

    // Simulated API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulation success
    if (typeof showToast === 'function') {
        showToast("Message envoyé avec succès ! Notre équipe vous répondra bientôt.", "success");
    } else {
        alert("Message envoyé ! Notre équipe vous répondra bientôt.");
    }

    // Reset form and close
    document.getElementById('supportForm').reset();
    btn.disabled = false;
    btn.innerHTML = originalText;
    closeSupport();
};

// Add CSS for spinner if not present
if (!document.getElementById('support-styles')) {
    const style = document.createElement('style');
    style.id = 'support-styles';
    style.textContent = `
        @keyframes spin { to { transform: rotate(360deg); } }
        .glass-modal-overlay { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    `;
    document.head.appendChild(style);
}
