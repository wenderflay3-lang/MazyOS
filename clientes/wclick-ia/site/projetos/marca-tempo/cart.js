const CART_KEY = 'marcatempo_cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartLabel();
}

function addToCart(name, price) {
  const cart = getCart();
  cart.push({ name: name, price: price });
  saveCart(cart);
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCartPage();
}

function cartTotal(cart) {
  return cart.reduce(function (sum, item) { return sum + item.price; }, 0);
}

function updateCartLabel() {
  const label = document.getElementById('cart-count');
  if (label) {
    label.textContent = 'Carrinho (' + getCart().length + ')';
  }
}

function formatPrice(value) {
  return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function renderCartPage() {
  const list = document.getElementById('cart-list');
  const totalEl = document.getElementById('cart-total');
  const emptyEl = document.getElementById('cart-empty');
  if (!list) return;

  const cart = getCart();
  list.innerHTML = '';

  if (cart.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    if (totalEl) totalEl.textContent = formatPrice(0);
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';

  cart.forEach(function (item, index) {
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = '<span>' + item.name + '</span>' +
      '<span>' + formatPrice(item.price) + '</span>' +
      '<button type="button" class="cart-remove" data-index="' + index + '">Remover</button>';
    list.appendChild(row);
  });

  list.querySelectorAll('.cart-remove').forEach(function (btn) {
    btn.addEventListener('click', function () {
      removeFromCart(parseInt(btn.getAttribute('data-index'), 10));
    });
  });

  if (totalEl) totalEl.textContent = formatPrice(cartTotal(cart));
}

document.addEventListener('DOMContentLoaded', function () {
  updateCartLabel();
  renderCartPage();

  document.querySelectorAll('.add-to-cart').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const name = btn.getAttribute('data-name');
      const price = parseFloat(btn.getAttribute('data-price'));
      addToCart(name, price);
      const original = btn.textContent;
      btn.textContent = 'Adicionado ✓';
      btn.classList.add('added');
      setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove('added');
      }, 1200);
    });
  });

  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function () {
      const cart = getCart();
      if (cart.length === 0) return;
      let msg = 'Olá! Tenho interesse nestas peças da Marca Tempo:\n\n';
      cart.forEach(function (item) {
        msg += '- ' + item.name + ' (' + formatPrice(item.price) + ')\n';
      });
      msg += '\nTotal: ' + formatPrice(cartTotal(cart));
      window.open('https://wa.me/5569983456789?text=' + encodeURIComponent(msg), '_blank');
    });
  }
});
