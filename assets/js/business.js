/* HomeBasket — business quotation requests (customer form) + admin "Quotations" section */
(function () {
  "use strict";
  var HB = window.HB, esc = HB.escapeHtml, A = (HB.admin = HB.admin || { sections: {} });

  /* ---------- customer page ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("business-form"); if (!form) return;
    var picker = document.getElementById("item-picker"), filter = document.getElementById("item-filter"), doneBox = document.getElementById("quote-done");
    var products = [];
    form.elements.preferredDate.min = new Date().toISOString().slice(0, 10);
    var wanted = new URLSearchParams(window.location.search).get("category");   /* e.g. business-supplies.html?category=Hotel */
    if (wanted && HB.BUSINESS_CATEGORIES.indexOf(wanted) > -1) form.elements.category.value = wanted;
    var me = HB.session.current();   /* prefill contact details from the signed-in (demonstration) account */
    if (me) { form.elements.contact.value = me.name; form.elements.phone.value = me.phone || ""; form.elements.email.value = me.email || ""; }
    HB.data.zones.list().then(function (z) {
      form.elements.area.innerHTML = '<option value="">Select your area…</option>' + z.map(function (x) { return '<option value="' + HB.escapeHtml(x.name) + '">' + HB.escapeHtml(x.name) + "</option>"; }).join("");
    });
    HB.data.products.list().then(function (list) { products = list.filter(function (p) { return p.stock !== "out_of_stock"; }); drawPicker(""); });
    /* picked: ticked products -> quantity. qtys: the quantity last shown for each product, kept when a product is unticked or filtered out. */
    var picked = {}, qtys = {}, choices = {}, summary = document.getElementById("pick-summary");
    function parseQty(v) { var t = String(v).trim(), n = Number(t); return t !== "" && Number.isInteger(n) ? n : NaN; }
    function validQty(n) { return Number.isInteger(n) && n >= 1 && n <= 999; }
    function updateSummary() {
      var ids = Object.keys(picked), total = 0, ok = true;
      ids.forEach(function (id) {
        var p = HB.getProduct(id), choice = choices[id] || {}, option = p && HB.getProductOption(p, choice.optionId);
        if (!validQty(picked[id])) { ok = false; return; }
        if (option) total += option.price * picked[id];
      });
      summary.textContent = ids.length
        ? ids.length + (ids.length === 1 ? " product" : " products") + " selected · indicative total " + HB.formatNaira(total) + (ok ? "" : " (check the quantities)")
        : "No products selected yet. Tick a product, or change its quantity, to add it.";
    }
    function rowHtml(p) {
      var on = picked[p.id] !== undefined, q = on ? picked[p.id] : (qtys[p.id] !== undefined ? qtys[p.id] : 1), nm = HB.escapeHtml(p.name);
      var selected = choices[p.id] || { optionId: HB.getProductOption(p, null).id, brand: "", packaging: "" };
      choices[p.id] = selected;
      var options = HB.getProductOptions(p).map(function (o) {
        return '<option value="' + HB.escapeHtml(o.id) + '"' + (o.id === selected.optionId ? " selected" : "") + ">" + HB.escapeHtml(o.label) + " · " + HB.formatNaira(o.price) + "</option>";
      }).join("");
      return '<div class="pick-row' + (on ? " is-picked" : "") + '" data-id="' + p.id + '"><label><input type="checkbox" data-id="' + p.id + '"' + (on ? " checked" : "") + "> <span>" + nm + ' <small class="muted">' + HB.escapeHtml(p.unit) + "</small></span></label>" +
        '<div class="pick-controls"><div class="qty" role="group" aria-label="Quantity for ' + nm + '"><button type="button" class="qty-btn" data-step="-1" aria-label="Decrease quantity of ' + nm + '">−</button>' +
        '<input type="number" class="qty-input pick-qty" inputmode="numeric" min="1" max="999" step="1" value="' + (isNaN(q) ? "" : q) + '" aria-label="Quantity of ' + nm + '"' + (on && !validQty(q) ? ' aria-invalid="true"' : "") + ">" +
        '<button type="button" class="qty-btn" data-step="1" aria-label="Increase quantity of ' + nm + '">+</button></div><span class="pick-total"></span></div>' +
        '<div class="field pick-options"><label>Measurement / pack <select class="pick-measure" aria-label="Measurement or pack for ' + nm + '">' + options + '</select></label>' +
        '<label>Brand <span class="optional">(optional)</span><input class="pick-brand" maxlength="80" value="' + HB.escapeHtml(selected.brand) + '" aria-label="Preferred brand for ' + nm + '"></label>' +
        '<label>Packaging <span class="optional">(optional)</span><input class="pick-packaging" maxlength="120" value="' + HB.escapeHtml(selected.packaging) + '" aria-label="Packaging preference for ' + nm + '"></label></div></div>';
    }
    function drawPicker(q) {
      q = q.toLowerCase();
      picker.innerHTML = products.filter(function (p) { return !q || (p.name + " " + p.unit).toLowerCase().indexOf(q) > -1; }).map(rowHtml).join("") || '<p class="muted">No matching products.</p>';
      updateSummary();
    }
    /* Update one row in place (keeps focus while typing): tick state, line total, summary, error text */
    function syncRow(row) {
      var id = row.dataset.id, p = HB.getProduct(id), on = picked[id] !== undefined, q = picked[id];
      row.classList.toggle("is-picked", on);
      row.querySelector('input[type="checkbox"]').checked = on;
      var option = p && HB.getProductOption(p, (choices[id] || {}).optionId);
      row.querySelector(".pick-total").textContent = on && validQty(q) && option ? HB.formatNaira(option.price * q) : "";
      row.querySelector(".pick-qty").setAttribute("aria-invalid", on && !validQty(q) ? "true" : "false");
      var bad = Object.keys(picked).some(function (k) { return !validQty(picked[k]); });
      document.getElementById("err-items").textContent = bad ? "Enter whole-number quantities from 1 to 999 for every selected product." : "";
      updateSummary();
    }
    /* Any quantity change ticks the product, so changing a number always has an effect */
    function setQty(row, raw) {
      var id = row.dataset.id, n = parseQty(raw);
      qtys[id] = n; picked[id] = n; syncRow(row);
    }
    filter.addEventListener("input", function () { drawPicker(filter.value.trim()); });
    picker.addEventListener("input", function (e) {
      var row = e.target.closest(".pick-row"); if (row && e.target.classList.contains("pick-qty")) setQty(row, e.target.value);
      if (row && e.target.classList.contains("pick-brand")) choices[row.dataset.id].brand = e.target.value;
      if (row && e.target.classList.contains("pick-packaging")) choices[row.dataset.id].packaging = e.target.value;
    });
    picker.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-step]"); if (!btn) return;
      var row = btn.closest(".pick-row"), input = row.querySelector(".pick-qty"), cur = parseQty(input.value);
      var next = Math.max(1, Math.min(999, (isNaN(cur) ? 0 : cur) + Number(btn.dataset.step)));
      input.value = next; setQty(row, next);
    });
    picker.addEventListener("change", function (e) {
      var row = e.target.closest(".pick-row"); if (!row) return;
      var id = row.dataset.id;
      if (e.target.classList.contains("pick-measure")) {
        choices[id].optionId = e.target.value;
        syncRow(row);
      }
      if (e.target.type === "checkbox") {
        if (e.target.checked) { var q = parseQty(row.querySelector(".pick-qty").value); picked[id] = q; qtys[id] = q; } else delete picked[id];
        syncRow(row);
      }
    });
    updateSummary();
    var rules = {
      businessName: function (v) { return v.length < 2 ? "Enter your business name." : ""; },
      contact: function (v) { return v.length < 2 ? "Enter a contact person." : ""; },
      phone: function (v) { return HB.normalizeNgPhone(v) ? "" : "Enter a valid Nigerian number, e.g. 0803 123 4567."; },
      area: function (v) { return v ? "" : "Choose your delivery area."; },
      category: function (v) { return v ? "" : "Choose your business category."; },
      deliveryAddress: function (v) { return v.length < 8 ? "Enter your full delivery address, with a landmark if possible." : ""; },
      preferredDate: function (v) { return !v || v >= new Date().toISOString().slice(0, 10) ? "" : "Choose today or a later date."; },
      requirements: function (v) { return (v.length >= 5 || Object.keys(picked).length) ? "" : "Describe what you need, or select products below."; }
    };
    function setError(f, m) { document.getElementById("err-" + f).textContent = m; form.elements[f].setAttribute("aria-invalid", m ? "true" : "false"); }
    var review = document.getElementById("quote-review"), draft = null;
    function itemsOk() {
      var ids = Object.keys(picked), bad = ids.some(function (id) { var q = picked[id]; return !(Number.isInteger(q) && q >= 1 && q <= 999); });
      document.getElementById("err-items").textContent = bad ? "Enter whole-number quantities from 1 to 999 for every selected product." : "";
      return !bad;
    }
    function money(n) { return HB.formatNaira(n); }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var first = null;
      Object.keys(rules).forEach(function (f) { var m = rules[f](form.elements[f].value.trim()); setError(f, m); if (m && !first) first = form.elements[f]; });
      if (!itemsOk() && !first) first = picker.querySelector('.pick-qty[aria-invalid="true"]') || picker.querySelector(".pick-qty") || picker;
      if (first) { first.focus(); return; }
      var items = Object.keys(picked).map(function (id) {
        var choice = choices[id] || {};
        return { productId: id, optionId: choice.optionId, brand: choice.brand, packaging: choice.packaging, qty: picked[id] };
      });
      draft = {
        customerId: me ? me.id : null, businessName: form.elements.businessName.value.trim(), contact: form.elements.contact.value.trim(), phone: form.elements.phone.value, email: form.elements.email.value.trim(), area: form.elements.area.value,
        category: form.elements.category.value, deliveryAddress: form.elements.deliveryAddress.value.trim(), preferredDate: form.elements.preferredDate.value,
        requirements: form.elements.requirements.value, frequency: form.elements.frequency.value, notes: form.elements.notes.value, items: items
      };
      var rows = items.map(function (i) {
        var p = HB.getProduct(i.productId), option = p && HB.getProductOption(p, i.optionId); if (!p || !option) return "";
        return "<tr><td>" + HB.escapeHtml(p.name) + '<br><small class="muted">' + HB.escapeHtml(option.label) + (i.brand ? " · " + HB.escapeHtml(i.brand) : "") + (i.packaging ? " · " + HB.escapeHtml(i.packaging) : "") + "</small></td><td>" + i.qty + "</td><td>" + money(option.price) + "</td><td>" + money(option.price * i.qty) + "</td></tr>";
      }).join("");
      var total = items.reduce(function (t, i) { var p = HB.getProduct(i.productId), option = p && HB.getProductOption(p, i.optionId); return t + (option ? option.price * i.qty : 0); }, 0);
      var d = function (k, v) { return "<div><dt>" + k + "</dt><dd>" + HB.escapeHtml(v || "-") + "</dd></div>"; };
      document.getElementById("review-body").innerHTML = '<dl class="review-list">' + d("Business", draft.businessName) + d("Category", draft.category) + d("Contact person", draft.contact) + d("Phone", HB.normalizeNgPhone(draft.phone)) +
        d("Delivery area", draft.area) + d("Delivery address", draft.deliveryAddress) + d("Preferred delivery date", draft.preferredDate || "Flexible") + d("How often", draft.frequency) + d("Requirements", draft.requirements) + d("Additional instructions", draft.notes) + "</dl>" +
        (rows ? '<div class="table-wrap"><table class="table"><thead><tr><th>Item</th><th>Qty</th><th>Indicative price</th><th>Total</th></tr></thead><tbody>' + rows + "</tbody></table></div><p><strong>Indicative items total: " + money(total) + "</strong> (excluding delivery)</p>" : "<p>No products selected. We will work from your written requirements.</p>");
      form.hidden = true; review.hidden = false;
      document.getElementById("review-heading").focus(); window.scrollTo(0, 0);
    });
    document.getElementById("review-edit").addEventListener("click", function () { review.hidden = true; form.hidden = false; form.elements.businessName.focus(); });
    document.getElementById("review-confirm").addEventListener("click", function () {
      if (!draft) return;
      var btn = document.getElementById("review-confirm"); btn.disabled = true; btn.textContent = "Submitting…";
      HB.data.quotations.submitBusinessRequest(draft).then(function (bq) { review.hidden = true; show(bq); }, function (err) {
        HB.toast(HB.errMsg(err), "error"); btn.disabled = false; btn.textContent = "Request Quotation";
      });
    });
    function show(bq) {
      form.hidden = true; doneBox.hidden = false;
      var rows = bq.items.map(function (l) { return "<tr><td>" + HB.escapeHtml(l.name) + '<br><small class="muted">' + HB.escapeHtml(l.measurement || l.unit) +
        (l.brand ? " · " + HB.escapeHtml(l.brand) : "") + (l.packaging ? " · " + HB.escapeHtml(l.packaging) : "") + "</small></td><td>" + l.qty + "</td><td>" + HB.formatNaira(l.unitPrice) + "</td><td>" + HB.formatNaira(l.qty * l.unitPrice) + "</td></tr>"; }).join("");
      document.getElementById("quote-ref").textContent = bq.id;
      document.getElementById("quote-summary").innerHTML = (rows ? '<div class="table-wrap"><table class="table"><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>' + rows +
        '</tbody></table></div><p><strong>Indicative items total: ' + HB.formatNaira(bq.indicativeSubtotal) + "</strong> (excluding delivery)</p>" : "<p>No products were selected. We will work from your written requirements.</p>") +
        '<dl class="review-list">' + [["Business", bq.businessName], ["Category", bq.category], ["Contact person", bq.contact], ["Phone", bq.phone], ["Delivery area", bq.area], ["Delivery address", bq.deliveryAddress], ["Preferred delivery date", bq.preferredDate || "Flexible"], ["How often", bq.frequency], ["Requirements", bq.requirements], ["Additional instructions", bq.notes]]
          .map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + HB.escapeHtml(r[1] || "-") + "</dd></div>"; }).join("") + "</dl>";
      var quoteUrl = new URL("quotation.html?token=" + encodeURIComponent(bq.accessToken), window.location.href).href;
      var msg = ["HOME BASKET — BUSINESS QUOTATION REQUEST", "Reference: " + bq.id, "Quotation access (same browser demonstration): " + quoteUrl, "", "Customer type: " + bq.customerType + " customer", "Business: " + bq.businessName, "Category: " + (bq.category || "-"), "Contact: " + bq.contact, "Phone: " + bq.phone, "Email: " + (bq.email || "-"), "Delivery area: " + bq.area, "Delivery address: " + (bq.deliveryAddress || "-"), "Preferred delivery date: " + (bq.preferredDate || "Flexible"), "Frequency: " + bq.frequency, "",
        "Requirements: " + (bq.requirements || "See items"), "", bq.items.length ? "ITEMS\n" + bq.items.map(function (l, i) {
          return (i + 1) + ". " + l.name + " (" + (l.measurement || l.unit) + ")" + (l.brand ? " · brand: " + l.brand : "") + (l.packaging ? " · packaging: " + l.packaging : "") + " × " + l.qty;
        }).join("\n") : "", "",
        "Additional instructions: " + (bq.notes || "None"), "", "This is a quotation request. Please check availability and confirm my quotation."].join("\n");
      document.getElementById("quote-link").href = quoteUrl;
      document.getElementById("quote-wa").addEventListener("click", function () { HB.openWhatsApp(msg); });
      document.getElementById("quote-heading").focus(); window.scrollTo(0, 0);
    }
  });

  /* ---------- admin: Quotations section ---------- */
  A.sections.quotes = { label: "Quotations", render: function (root, snap) {
    var statusFilter = (A.ui.quotes && A.ui.quotes.status) || "";
    var requestStatuses = ["New Request", "Under Review", "Quotation Prepared", "Awaiting Customer Approval", "Approved", "Revision Requested", "Declined", "Expired"];
    function accessUrl(b) { var u = new URL("quotation.html", window.location.href); u.searchParams.set("token", b.accessToken || ""); return u.href; }
    function safeList(list) { return Array.isArray(list) ? list : []; }
    function openRequest(b) {
      var items = safeList(b.items).map(function (line) {
        return "<li><strong>" + esc(line.name) + "</strong> · " + line.qty + " × " + esc(line.measurement || line.unit || "") +
          (line.brand ? " · " + esc(line.brand) : "") + (line.packaging ? " · " + esc(line.packaging) : "") + "</li>";
      }).join("") || "<li>Written requirements only.</li>";
      var url = b.accessToken ? accessUrl(b) : "";
      var contactActions = url ? '<p><a class="btn btn-outline btn-sm" target="_blank" rel="noopener" href="' + esc(url) + '">Open customer access link</a> <button type="button" class="btn btn-primary btn-sm" data-modal-prepare="' + esc(b.id) + '">Prepare quotation</button></p>' : "";
      HB.modal({ title: "Request " + b.id, wide: true, body:
        '<p>' + HB.badge(b.status) + " " + HB.badge((b.customerType || "Guest") + " Customer") + (b.sample ? " " + HB.badge("Sample record") : "") + "</p>" +
        '<dl class="review-list"><div><dt>Business</dt><dd>' + esc(b.businessName || "-") + "</dd></div><div><dt>Contact</dt><dd>" + esc(b.contact || "-") + "</dd></div><div><dt>Phone</dt><dd>" + esc(b.phone || "-") + "</dd></div><div><dt>Email</dt><dd>" + esc(b.email || "-") + "</dd></div><div><dt>Delivery location</dt><dd>" + esc(b.area || "-") + " · " + esc(b.deliveryAddress || "-") + "</dd></div><div><dt>Submitted</dt><dd>" + HB.formatDateTime(b.createdAt) + "</dd></div><div><dt>Requirements</dt><dd>" + esc(b.requirements || "-") + "</dd></div><div><dt>Instructions</dt><dd>" + esc(b.notes || "-") + "</dd></div></dl>" +
        "<h3>Requested products</h3><ul>" + items + "</ul>" + contactActions +
        '<div class="btn-row"><button type="button" class="btn btn-outline" data-modal-review="' + esc(b.id) + '">Mark under review</button><button type="button" class="btn btn-outline" data-modal-clarify="' + esc(b.id) + '">Request clarification</button><button type="button" class="btn btn-danger" data-modal-decline="' + esc(b.id) + '">Decline request</button></div>',
        actions: [{ label: "Close", cls: "btn-outline" }] });
    }
    function prepareQuotation(b) {
      var lines = safeList(b.items);
      if (!lines.length) { HB.toast("This request has no product lines to quote.", "error"); return; }
      var body = '<p class="note">Enter HomeBasket selling prices. Supplier cost information is not shown to customers. The original request remains unchanged.</p><div class="table-wrap"><table class="table"><thead><tr><th>Requested item</th><th>Qty</th><th>Selling price (₦)</th><th>Note</th></tr></thead><tbody>' +
        lines.map(function (line) { return '<tr data-pid="' + esc(line.productId) + '"><td>' + esc(line.name) + '<br><small class="muted">' + esc(line.measurement || line.unit || "") +
          (line.brand ? " · " + esc(line.brand) : "") + (line.packaging ? " · " + esc(line.packaging) : "") + '</small></td><td>' + line.qty +
          '</td><td><input class="bq-price" type="number" min="0" step="50" value="' + Number(line.unitPrice || 0) + '" aria-label="HomeBasket selling price for ' + esc(line.name) + '"></td><td><input class="bq-note" maxlength="120" aria-label="Quotation note for ' + esc(line.name) + '"></td></tr>'; }).join("") +
        '</tbody></table></div><div class="field"><label for="bq-delivery">Delivery fee (₦)</label><input id="bq-delivery" type="number" min="0" step="50" value="0"></div>' +
        '<div class="field"><label for="bq-validity">Valid for (days)</label><input id="bq-validity" type="number" min="1" max="90" value="7"></div>' +
        '<div class="field"><label for="bq-notes">Customer-facing notes</label><textarea id="bq-notes" rows="3" maxlength="1000"></textarea></div><p id="bq-preview" class="alert alert-info"></p>';
      var ctl = HB.modal({ title: "Prepare quotation · " + b.id, wide: true, body: body,
        actions: [{ label: "Cancel", cls: "btn-outline" },
          { label: "Save draft", cls: "btn-outline", onClick: function (c) { return save(c, false); } },
          { label: "Issue to customer", cls: "btn-primary", onClick: function (c) { return save(c, true); } }] });
      function payload(c) {
        return {
          lines: [].map.call(c.el.querySelectorAll("tbody tr"), function (row) {
            return { productId: row.dataset.pid, unitPrice: row.querySelector(".bq-price").value, note: row.querySelector(".bq-note").value };
          }),
          deliveryFee: c.el.querySelector("#bq-delivery").value, validDays: c.el.querySelector("#bq-validity").value,
          notes: c.el.querySelector("#bq-notes").value
        };
      }
      function save(c, issue) {
        var data = payload(c);
        return HB.api.prepareBusinessQuotation(b.id, data).then(function (q) {
          if (!issue) { HB.toast("Quotation draft saved."); A.refresh(); return; }
          return HB.api.issueBusinessQuotation(b.id, q.id).then(function () {
            HB.toast("Quotation issued. WhatsApp/email links are available in the request list.");
            A.refresh();
          });
        }, function (error) { HB.toast(HB.errMsg(error), "error"); return false; });
      }
      function preview() {
        var total = 0;
        ctl.el.querySelectorAll("tbody tr").forEach(function (row) {
          var line = lines.filter(function (x) { return x.productId === row.dataset.pid; })[0];
          total += Number(row.querySelector(".bq-price").value || 0) * line.qty;
        });
        total += Number(ctl.el.querySelector("#bq-delivery").value || 0);
        ctl.el.querySelector("#bq-preview").innerHTML = "Quotation total: <strong>" + HB.formatNaira(total) + "</strong>";
      }
      ctl.el.addEventListener("input", preview); preview();
    }
    var requests = snap.businessQuotes.filter(function (b) { return !statusFilter || b.status === statusFilter; });
    var bq = requests.map(function (b) {
      var type = b.customerType || "Guest", items = safeList(b.items);
      var current = safeList(b.quotations).filter(function (q) { return q.id === b.currentQuotationId; })[0];
      var msg = current ? "Hello " + b.contact + ", your HomeBasket quotation " + current.id + " totals " + HB.formatNaira(current.total) + ". Review it here: " + accessUrl(b) : "Hello " + b.contact + ", we are reviewing your HomeBasket quotation request " + b.id + ".";
      var wa = b.phone && b.accessToken ? HB.waLinkTo(b.phone, msg) : "";
      var email = b.email && current ? "mailto:" + encodeURIComponent(b.email) + "?subject=" + encodeURIComponent("HomeBasket quotation " + current.id) + "&body=" + encodeURIComponent(msg) : "";
      return "<tr><td><button class=\"btn btn-ghost btn-sm\" type=\"button\" data-view-request=\"" + esc(b.id) + "\"><strong>" + esc(b.id) + "</strong></button>" + (b.sample ? '<br><small class="muted">Sample record</small>' : "") + "</td>" +
        "<td><strong>" + esc(b.contact || b.businessName || "-") + "</strong><br><small class=\"muted\">" + esc(type) + " Customer · " + esc(b.businessName || "") + "</small><br><small class=\"muted\">" + esc(b.phone || "-") + (b.email ? " · " + esc(b.email) : "") + "</small></td>" +
        "<td>" + esc(b.area || "-") + "<br><small class=\"muted\">" + esc(b.deliveryAddress || "") + "</small></td><td>" + HB.formatDateTime(b.createdAt) + "</td><td>" + items.length + "</td><td>" + HB.badge(b.status) + "</td>" +
        "<td><button class=\"btn btn-outline btn-sm\" type=\"button\" data-view-request=\"" + esc(b.id) + '">View</button> ' +
        (current && current.status === "Awaiting Customer Approval" ? (wa ? '<a class="btn btn-whatsapp btn-sm" target="_blank" rel="noopener" href="' + esc(wa) + '">WhatsApp link</a> ' : "") + (email ? '<a class="btn btn-ghost btn-sm" href="' + esc(email) + '">Email link</a>' : "") : "") +
        (b.accessToken ? ' <a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="' + esc(accessUrl(b)) + '">Customer view</a>' : "") + "</td></tr>";
    }).join("");
    var qs = snap.quotations.map(function (q) {
      return "<tr><td>" + q.id + '</td><td><a href="#orders/' + q.orderRef + '">' + q.orderRef + "</a></td><td>" + HB.badge(q.status) + "</td><td>" + HB.formatNaira(q.total) + '<br><small class="muted">Customer saw ' + HB.formatNaira(q.originalTotal) + "</small></td>" +
        "<td>" + (q.requiresApproval ? "Yes" : "No") + "</td><td>" + HB.formatDateTime(q.createdAt) + "</td><td>" + HB.formatDateTime(q.expiresAt) + "</td></tr>";
    }).join("");
    var versions = snap.businessQuotes.reduce(function (all, b) {
      safeList(b.quotations).forEach(function (q) { all.push({ request: b, quote: q }); });
      return all;
    }, []).map(function (entry) {
      var b = entry.request, q = entry.quote, url = b.accessToken ? accessUrl(b) : "";
      return "<tr><td>" + esc(q.id) + "</td><td>" + esc(b.id) + " · " + esc(b.contact || "") + "</td><td>" + HB.badge(q.status) + "</td><td>" + HB.formatNaira(q.subtotal) + " + " + HB.formatNaira(q.deliveryFee) + "<br><strong>" + HB.formatNaira(q.total) + "</strong></td>" +
        "<td>" + HB.formatDateTime(q.expiresAt) + "</td><td>" + (url ? '<a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="' + esc(url) + '">Customer view</a>' : "-") + "</td></tr>";
    }).join("");
    root.innerHTML = '<div class="dash-head"><h1>Quotations</h1></div><section class="form-card"><h2>Business quotation requests</h2>' +
      '<div class="field"><label for="bq-filter">Filter requests</label><select id="bq-filter"><option value="">All requests</option>' + requestStatuses.map(function (s) { return '<option value="' + s + '"' + (s === statusFilter ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select></div>" +
      (bq ? '<div class="table-wrap"><table class="table"><thead><tr><th>Reference</th><th>Customer</th><th>Delivery location</th><th>Submitted</th><th>Products</th><th>Status</th><th>Actions / notifications</th></tr></thead><tbody>' + bq + "</tbody></table></div>" : '<p class="muted">No requests match this filter.</p>') +
      '<p class="note">Requests and quotations are stored in this browser session only. WhatsApp/email links open message drafts; they do not prove delivery. Recurring restocking remains an enquiry, not a subscription.</p></section>' +
      '<section class="form-card"><h2>Business quotation versions</h2>' + (versions ? '<div class="table-wrap"><table class="table"><thead><tr><th>Quotation</th><th>Request</th><th>Status</th><th>Breakdown</th><th>Valid until</th><th></th></tr></thead><tbody>' + versions + "</tbody></table></div>" : '<p class="muted">No business quotations have been prepared.</p>') + "</section>" +
      '<section class="form-card"><h2>Final quotations for customer orders</h2>' + (qs ? '<div class="table-wrap"><table class="table"><thead><tr><th>Quotation</th><th>Order</th><th>Status</th><th>Total</th><th>Needs approval</th><th>Created</th><th>Expires</th></tr></thead><tbody>' + qs + "</tbody></table></div>" : '<p class="muted">No quotations yet. Prepare one from an order.</p>') + "</section>";
    root.querySelector("#bq-filter").addEventListener("change", function (event) { A.ui.quotes = { status: event.target.value }; A.render(); });
    root.addEventListener("click", function (event) {
      var view = event.target.closest("[data-view-request]"), prep = event.target.closest("[data-modal-prepare]"),
        review = event.target.closest("[data-modal-review]"), decline = event.target.closest("[data-modal-decline]"), clarify = event.target.closest("[data-modal-clarify]");
      if (view) openRequest(A.byId(snap.businessQuotes, view.dataset.viewRequest));
      if (prep) prepareQuotation(A.byId(snap.businessQuotes, prep.dataset.modalPrepare));
      if (review) A.act(HB.api.updateBusinessQuoteStatus(review.dataset.modalReview, "Under Review"), "Request moved to Under Review.");
      if (decline) HB.confirm("Decline this quotation request? The original request will be retained.", { title: "Decline request", confirmLabel: "Decline", danger: true }).then(function (ok) { if (ok) A.act(HB.api.updateBusinessQuoteStatus(decline.dataset.modalDecline, "Declined"), "Request declined."); });
      if (clarify) HB.modal({ title: "Request clarification", body: '<div class="field"><label for="bq-clarification">Message for the customer</label><textarea id="bq-clarification" rows="4" maxlength="500"></textarea></div>',
        actions: [{ label: "Cancel", cls: "btn-outline" }, { label: "Save clarification", cls: "btn-primary", onClick: function (control) {
          return A.act(HB.api.requestBusinessQuoteClarification(clarify.dataset.modalClarify, control.el.querySelector("#bq-clarification").value), "Clarification saved. Notify the customer separately.");
        } }] });
    });
  } };
})();
