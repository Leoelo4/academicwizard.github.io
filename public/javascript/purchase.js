// Purchase functionality for resources
function handlePurchase(itemName, price) {
  // Create a simple notification
  const message = document.createElement('div');
  message.className = 'purchase-notification';
  message.innerHTML = `
    <div class="notification-content">
      <h3>✓ Added to Cart</h3>
      <p><strong>${itemName}</strong> - $${price.toFixed(2)}</p>
      <p style="font-size: 0.9rem; margin-top: 0.5rem;">Payment integration coming soon!</p>
    </div>
  `;
  
  document.body.appendChild(message);
  
  // Add styles if not already present
  if (!document.getElementById('purchase-styles')) {
    const style = document.createElement('style');
    style.id = 'purchase-styles';
    style.textContent = `
      .purchase-notification {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--bg-card);
        border: 2px solid var(--brand-primary);
        border-radius: var(--radius-lg);
        padding: 2rem;
        z-index: 10000;
        animation: purchaseSlideIn 0.3s ease-out;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      }
      
      .notification-content {
        text-align: center;
        color: var(--text-primary);
      }
      
      .notification-content h3 {
        color: var(--success);
        margin-bottom: 1rem;
        font-size: 1.5rem;
      }
      
      .notification-content p {
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
      }
      
      @keyframes purchaseSlideIn {
        from {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.9);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    message.style.animation = 'purchaseSlideIn 0.3s ease-out reverse';
    setTimeout(() => message.remove(), 300);
  }, 3000);
  
  // Log purchase for demo
  console.log(`Purchase initiated: ${itemName} - $${price}`);
}
