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

    try {
        // Prepare ticket data
        const { data: { session } } = await window.gourmetSupabase.auth.getSession();
        const ticketData = {
            message: message,
            user_id: session?.user?.id || null,
            email: session?.user?.email || 'Visiteur Anonyme',
            user_agent: navigator.userAgent,
            created_at: new Date().toISOString(),
            status: 'new'
        };

        // Save to Supabase (Julian will see this in his dashboard)
        const { error } = await window.gourmetSupabase
            .from('support_tickets')
            .insert([ticketData]);

        if (error) {
            // Fallback to mailto if table doesn't exist yet
            console.warn('[Support] Table support_tickets missing, falling back to mailto');
            window.location.href = `mailto:contact@gourmetrevient.fr?subject=Support GourmetRevient&body=${encodeURIComponent(message)}`;
        } else {
            if (typeof showToast === 'function') {
                showToast("Demande envoyée ! Nous vous répondrons par email.", "success");
            }
        }
    } catch (err) {
        console.error('[Support] Error:', err);
        // Fallback to mailto
        window.location.href = `mailto:contact@gourmetrevient.fr?subject=Support GourmetRevient&body=${encodeURIComponent(message)}`;
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
