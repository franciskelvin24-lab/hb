/* ==========================================================================
   HomeBasket — cart (stored via data-access.js) + cart page
   Only product IDs and quantities are stored. No personal data.
   ========================================================================== */
(function () {
  "use strict";
  var HB = (window.HB = window.HB || {});
  var CFG = window.HB_CONFIG, KEY = CFG.CART_KEY, MAX = CFG.MAX_QTY;
  var items = load();

  function itemKey(item) {
    return item && (item.key || HB.makeCartItemKey(item.productId || item.id, item.optionId || "default"));
  }
  function findItem(ref) {
    if (!ref) return null;
    return items.filter(function (i) { return itemKey(i) === ref || (i.productId || i.id) === ref || i.id === ref; })[0] || null;
  }
  function load() {
    try {
      var raw = HB.storage.read("local", KEY).value;
      if (!Array.isArray(raw)) return [];
      return raw.map(function (i) {
        var productId = (i && (i.productId || i.id)) || null;
        var product = productId && HB.getProduct(productId);
        if (!product || !product.active) return null;
        var option = HB.getProductOption(product, i && i.optionId ? i.optionId : null);
        var qty = Number(i && i.qty);
        if (!Number.isInteger(qty) || qty < 1) return null;
        return {
          key: i && i.key ? i.key : HB.makeCartItemKey(productId, option ? option.id : "default"),
          id: productId,
          productId: productId,
          optionId: option ? option.id : "default",
          unit: option ? option.label : product.unit,
          price: option ? option.price : product.price,
          qty: Math.min(MAX, qty)
        };
      }).filter(Boolean);
    } catch (e) { return []; }
  }
  function save() {
    HB.storage.write("local", KEY, items.map(function (i) { return { key: i.key, productId: i.productId || i.id, optionId: i.optionId || "default", qty: i.qty }; }));
    window.dispatchEvent(new Event("hb:cart-change"));
  }
  HB.Cart = {
    reload: function () { items = load(); },
    items: function () { return items.slice(); },
    lines: function () {
      return items.map(function (i) {
        var p = HB.getProduct(i.productId || i.id);
        if (!p) return null;
        var option = HB.getProductOption(p, i.optionId || null);
        var total = Number(option ? option.price : p.price) * i.qty;
        return { key: itemKey(i), product: p, option: option, qty: i.qty, total: total, productId: p.id, unit: option ? option.label : p.unit, price: option ? option.price : p.price };
      }).filter(function (l) { return !!l && !!l.product; });
    },
    count: function () { return items.reduce(function (s, i) { return s + i.qty; }, 0); },
    subtotal: function () { return this.lines().reduce(function (s, l) { return s + l.total; }, 0); },
    add: function (id, qty, optionId) {
      var p = HB.getProduct(id); if (!p || !p.active || p.stock === "out_of_stock") return;
      var option = HB.getProductOption(p, optionId);
      qty = Math.max(1, parseInt(qty, 10) || 1);
      var key = HB.makeCartItemKey(id, option.id);
      var f = findItem(key) || items.filter(function (i) { return (i.productId || i.id) === id && (i.optionId || "default") === option.id; })[0];
      if (f) {
        f.qty = Math.min(MAX, f.qty + qty);
        f.unit = option.label;
        f.price = option.price;
        f.optionId = option.id;
        f.key = itemKey(f);
      } else {
        items.push({ key: key, id: id, productId: id, optionId: option.id, unit: option.label, price: option.price, qty: Math.min(MAX, qty) });
      }
      save();
    },
    setQty: function (ref, qty) {
      var f = findItem(ref); if (!f) return;
      qty = parseInt(qty, 10);
      if (!qty || qty < 1) return this.remove(ref);
      f.qty = Math.min(MAX, qty); save();
    },
    remove: function (ref) { items = items.filter(function (i) { return itemKey(i) !== ref && (i.productId || i.id) !== ref; }); save(); },
    clear: function () { items = []; save(); }
  };

  /* Lowest delivery-area fee, for the cart-page estimate */
  function minFee(zones) {
    var fees = zones.map(function (z) { return z.fee; }).filter(function (f) { return f !== null; });
    return fees.length ? Math.min.apply(null, fees) : null;
  }

  function renderCart(root, fee) {
    var lines = HB.Cart.lines();
    if (!lines.length) {
      root.innerHTML = '<div class="empty-state"><div class="empty-icon" aria-hidden="true">🧺</div><h2>Your basket is empty</h2><p>Browse the catalogue and add the essentials you need.</p><a class="btn btn-primary" href="' + HB.link("shop") + '">Shop Essentials</a></div>';
      return;
    }
    var rows = lines.map(function (l) {
      var p = l.product, n = HB.escapeHtml(p.name), optionLabel = (l.option && l.option.label) ? l.option.label : p.unit, linePrice = (l.option && l.option.price) ? l.option.price : p.price, itemKey = l.key || HB.makeCartItemKey(p.id, l.option ? l.option.id : "default");
      return '<li class="cart-item" data-id="' + p.id + '" data-key="' + HB.escapeHtml(itemKey) + '"><div class="cart-thumb">' + HB.imgTag(p) + "</div><div class=\"cart-info\"><h3>" + n + '</h3><p class="muted">' + HB.escapeHtml(optionLabel) + " · " + HB.formatNaira(linePrice) + " each</p>" +
        '<div class="cart-controls"><div class="qty" role="group" aria-label="Quantity for ' + n + '"><button type="button" class="qty-btn" data-act="dec" aria-label="Decrease quantity of ' + n + '">−</button>' +
        '<input class="qty-input" type="number" inputmode="numeric" min="1" max="' + MAX + '" value="' + l.qty + '" aria-label="Quantity of ' + n + '"><button type="button" class="qty-btn" data-act="inc" aria-label="Increase quantity of ' + n + '">+</button></div>' +
        '<button type="button" class="link-btn" data-act="remove" aria-label="Remove ' + n + ' from basket">' + HB.icons.trash + " Remove</button></div></div>" +
        '<p class="cart-line-total">' + HB.formatNaira(l.total) + "</p></li>";
    }).join("");
    var sub = HB.Cart.subtotal();
    var freeBar = '<div class="free-ship"><p>Free-delivery rewards are unavailable until HomeBasket can verify completed orders against account history.</p></div>';
    root.innerHTML = '<div class="cart-layout"><section aria-label="Basket items"><ul class="cart-list">' + rows + '</ul><div class="cart-actions"><a class="btn btn-outline" href="' + HB.link("shop") + '">Continue shopping</a>' +
      '<button type="button" class="btn btn-ghost" data-act="clear">Clear basket</button></div></section>' +
      '<aside class="summary-card" aria-label="Basket summary"><h2>Basket summary</h2><dl class="summary-rows"><div><dt>Items</dt><dd>' + HB.Cart.count() + "</dd></div><div><dt>Subtotal</dt><dd>" + HB.formatNaira(sub) + "</dd></div>" +
      "<div><dt>Delivery fee (estimate)</dt><dd>" + (fee === null ? "At checkout" : "from " + HB.formatNaira(fee)) + "</dd></div>" +
      '<div class="total"><dt>Estimated total</dt><dd>' + HB.formatNaira(sub + (fee || 0)) + "</dd></div></dl>" + freeBar +
      '<p class="note">Delivery is shown separately and depends on your area (chosen at checkout). Prices and availability are reconfirmed by HomeBasket before your order is accepted. No payment is taken on this site.</p>' +
      '<a class="btn btn-primary btn-block" href="' + HB.link("checkout") + '">Proceed to checkout</a></aside></div>';
  }

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("cart-root"); if (!root) return;
    var fee = null;
    function draw(focusSel) { renderCart(root, fee); if (focusSel) { var el = root.querySelector(focusSel); if (el) el.focus(); } }
    HB.data.zones.list().then(function (z) { fee = minFee(z); draw(); }, function () { draw(); });
    draw();
    window.addEventListener("hb:cart-render", function () { draw(); });
    root.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]"); if (!b) return;
      var li = b.closest(".cart-item"), itemKey = li && (li.dataset.key || li.dataset.id), act = b.dataset.act;
      var line = itemKey && HB.Cart.items().filter(function (i) { return (i.key || i.productId || i.id) === itemKey; })[0];
      if (act === "inc") { HB.Cart.setQty(itemKey, line.qty + 1); draw('[data-key="' + itemKey + '"] [data-act="inc"]'); }
      else if (act === "dec") { HB.Cart.setQty(itemKey, line.qty - 1); draw('[data-key="' + itemKey + '"] [data-act="dec"]'); }
      else if (act === "remove") { HB.Cart.remove(itemKey); draw(".btn"); HB.toast("Item removed"); }
      else if (act === "clear") HB.confirm("Remove all items from your basket?", { title: "Clear basket", confirmLabel: "Clear basket", danger: true }).then(function (ok) { if (ok) { HB.Cart.clear(); draw(".btn"); } });
    });
    root.addEventListener("change", function (e) {
      if (!e.target.classList.contains("qty-input")) return;
      var itemKey = e.target.closest(".cart-item").dataset.key || e.target.closest(".cart-item").dataset.id;
      HB.Cart.setQty(itemKey, e.target.value); draw('[data-key="' + itemKey + '"] .qty-input');
    });
  });
})();
