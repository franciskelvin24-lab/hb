/* ==========================================================================
   HomeBasket — LOCAL STORE + BACKEND-READY SERVICE LAYER
   --------------------------------------------------------------------------
   * All data lives in one state object (business data from business-data.js).
   * The state is persisted to sessionStorage so it survives page navigation
     inside the same browser tab. It is NOT shared across devices or tabs.
   * UI code should only call HB.api.* (Promises). To go live, replace the
     bodies of these functions with fetch() calls to a real backend.
   ========================================================================== */
(function () {
  "use strict";
  var HB = (window.HB = window.HB || {});
  var CFG = window.HB_CONFIG, D = window.HB_DATA;
  var S = null;            // state
  var T = null;            // time override used only while seeding
  var core = (HB._core = {});

  HB.ORDER_STAGES = ["Order Received", "Awaiting Availability/Price Confirmation", "Confirmed", "Sourcing", "Packed", "Out for Delivery", "Delivered"];
  HB.DELIVERY_STATUSES = ["Awaiting Assignment", "Assigned", "Ready for Pickup", "Picked Up", "Out for Delivery", "Delivered", "Failed Delivery", "Returned"];
  HB.SR_STATUSES = ["New Request", "Accepted", "Preparing", "Ready for Collection", "Collected", "Declined"];
  HB.QUOTE_STATUSES = ["Draft", "Awaiting Customer Approval", "Approved", "Revision Requested", "Rejected", "Declined", "Expired"];
  HB.SUPPLIER_STATUSES = ["Pending Review", "Approved", "Suspended"];
  HB.SUPPLIER_APPLICATION_STATUSES = ["Pending Review", "Under Review", "Additional Information Requested", "Approved", "Rejected"];
  HB.BUSINESS_CATEGORIES = ["Hotel", "Guesthouse", "Restaurant", "Salon", "Office", "Shop", "Other"];
  HB.BQ_STATUSES = ["New", "In Review", "Quoted", "Closed"];

  /* ---------- helpers ---------- */
  function clone(o) { return o === undefined ? undefined : JSON.parse(JSON.stringify(o)); }
  function stamp() { return new Date(T !== null ? T : Date.now()).toISOString(); }
  function tick(min) { if (T !== null) T = Math.min(Date.now(), T + min * 60000); }
  function fail(m) { throw new Error(m); }
  function nextId(k) { S.counters[k] = (S.counters[k] || 0) + 1; return S.counters[k]; }
  function byId(arr, id, key) { key = key || "id"; for (var i = 0; i < arr.length; i++) if (arr[i][key] === id) return arr[i]; return null; }
  function dateStr(daysAhead) { var d = new Date(Date.now() + daysAhead * 86400000); return d.toISOString().slice(0, 10); }
  function sum(arr, fn) { return arr.reduce(function (s, x) { return s + fn(x); }, 0); }
  function stageIdx(s) { return HB.ORDER_STAGES.indexOf(s); }
  function has(arr, v) { return arr.indexOf(v) > -1; }
  function secureToken() {
    if (!window.crypto || !window.crypto.getRandomValues) fail("This browser cannot create a secure quotation link.");
    var bytes = new Uint8Array(32), token = "";
    window.crypto.getRandomValues(bytes);
    for (var i = 0; i < bytes.length; i++) token += ("0" + bytes[i].toString(16)).slice(-2);
    return token;
  }

  HB.normalizeNgPhone = function (raw) {
    var s = String(raw || "").replace(/[\s\-().]/g, "");
    var m = /^(?:\+?234|0)([789][01]\d{8})$/.exec(s);
    return m ? "+234" + m[1] : null;
  };

  /* Areas with no fee set yet ("to be confirmed") stay to be confirmed. */
  HB.deliveryFeeFor = function (zone) {
    if (!zone || zone.fee === null || zone.fee === undefined) return null;
    return zone.fee;
  };

  /* ---------- state lifecycle ---------- */
  function persist() { return HB.storage.write("session", CFG.STATE_KEY, S); }
  function save() {
    var stored = persist();
    if (stored) window.dispatchEvent(new Event("hb:state-change"));
    return stored;
  }
  function ensure() {
    if (S) return S;
    var loaded = null;
    var saved = HB.storage.read("session", CFG.STATE_KEY).value; if (saved && saved.v === 2) loaded = saved;
    if (loaded) {
      S = loaded;
      if (!Array.isArray(S.supplierApplications)) S.supplierApplications = [];
      if (!Array.isArray(S.businessQuotes)) S.businessQuotes = [];
      if (!Array.isArray(S.payments)) S.payments = [];
      if (!S.counters) S.counters = {};
      S.businessQuotes.forEach(function (b) {
        if (!Array.isArray(b.quotations)) b.quotations = [];
        if (!Array.isArray(b.revisionRequests)) b.revisionRequests = [];
        if (!Array.isArray(b.clarifications)) b.clarifications = [];
        if (!Array.isArray(b.payments)) b.payments = [];
        if (!b.customer) b.customer = { name: b.contact || "", email: b.email || "", phone: b.phone || "", address: b.deliveryAddress || "" };
        if (!b.customerType) b.customerType = b.customerId ? "Registered" : "Guest";
        if (b.status === "New") b.status = "New Request";
        if (b.status === "In Review") b.status = "Under Review";
        if (b.status === "Quoted") b.status = "Quotation Prepared";
        (b.items || []).forEach(function (item) {
          if (!item.measurement) item.measurement = item.unit || "";
          if (!item.brand) item.brand = "";
          if (!item.packaging) item.packaging = "";
        });
      });
    } else { seed(); persist(); }
    return S;
  }
  function sweepQuotes() {
    S.quotations.forEach(function (q) {
      if (q.status === "Awaiting Customer Approval" && Date.parse(q.expiresAt) < Date.now()) {
        q.status = "Expired"; q.updatedAt = stamp();
        q.history.push({ status: "Expired", at: stamp(), note: "Validity period ended" });
      }
    });
  }
  /* Sync read helpers used by customer UI (cart, product cards) */
  HB.getProduct = function (id) { return byId(ensure().products, id); };
  HB.activeProducts = function () { return ensure().products.filter(function (p) { return p.active; }); };
  HB.getCategory = function (id) { return byId(window.HB_CATEGORIES, id); };

  /* ---------- timeline ---------- */
  function tl(order, status, note, source) {
    order.timeline.push({ at: stamp(), status: status, note: note || "", source: source || "order" });
    order.updatedAt = stamp();
  }
  function setOrderStatus(order, status, note, source) { order.status = status; tl(order, status, note, source || "order"); }

  /* ---------- supplier helpers ---------- */
  function supplierName(id) { var s = byId(S.suppliers, id); return s ? s.name : id; }
  function costOf(supplierId, productId) {
    for (var i = 0; i < S.supplierProducts.length; i++) { var sp = S.supplierProducts[i]; if (sp.supplierId === supplierId && sp.productId === productId) return sp.cost; }
    return null;
  }

  /* ---------- notifications (queue only) ---------- */
  function buildSupplierMessage(sr) {
    var lines = sr.lines.map(function (l) {
      return "- " + l.qty + " x " + l.name + " (" + (l.measurement || l.unit) + ")" +
        (l.brand ? " · brand: " + l.brand : "") + (l.packaging ? " · packaging: " + l.packaging : "");
    }).join("\n");
    return "[NOT SENT] HomeBasket order " + sr.orderRef + " · sourcing request " + sr.ref + " for " + supplierName(sr.supplierId) +
      "\nRequested fulfilment date: " + sr.requestedDate + "\nItems assigned to you only:\n" + lines +
      "\nPlease reply to accept or decline and confirm your price and stock. This message was queued only and has not been sent.";
  }
  function notify(sr) {
    var sup = byId(S.suppliers, sr.supplierId), status, note;
    if (!sup) { status = "Failed"; note = "Supplier record not found."; }
    else if (sup.status === "Suspended") { status = "Failed"; note = "Supplier is suspended. Use the manual fallback."; }
    else if (!sup.verifiedContact) { status = "Failed"; note = "Supplier contact is not verified. Verify it, retry, or contact manually."; }
    else if (sup.channel === "email") { status = "Awaiting Integration"; note = "Email provider is not connected yet."; }
    else { status = "Queued"; note = "Queued for " + sup.channel + ". Not sent: messaging is not yet connected."; }
    var attempts = S.notifications.filter(function (n) { return n.srRef === sr.ref && n.direction === "outbound"; }).length;
    var n = { id: "N-" + nextId("notif"), direction: "outbound", srRef: sr.ref, supplierId: sr.supplierId, channel: sup ? sup.channel : "-",
      at: stamp(), status: status, note: note, attempt: attempts + 1, message: buildSupplierMessage(sr) };
    S.notifications.unshift(n);
    sr.notificationStatus = status;
    return n;
  }

  /* ---------- sourcing ---------- */
  function createSR(order, supplierId, lineList) {
    var sr = { ref: "SR-" + nextId("sr"), orderRef: order.ref, supplierId: supplierId, createdAt: stamp(), updatedAt: stamp(),
      requestedDate: order.scheduledDate || dateStr(1), status: "New Request", notificationStatus: null, response: null,
      lines: lineList.map(function (l) {
        var product = byId(S.products, l.productId), supplierProduct = S.supplierProducts.filter(function (sp) { return sp.supplierId === supplierId && sp.productId === l.productId; })[0];
        return { productId: l.productId, name: l.name, unit: l.unit, measurement: l.measurement || l.unit, packaging: l.packaging || "",
          brand: l.brand || "", qty: l.qty, indicativeCost: costOf(supplierId, l.productId), category: product ? product.category : "",
          supplierMeasurement: supplierProduct ? supplierProduct.measurement : "", supplierPackaging: supplierProduct ? supplierProduct.packaging : "",
          supplierCapacity: supplierProduct ? supplierProduct.capacity : "", minimumOrder: supplierProduct ? supplierProduct.minimumOrder : "",
          supplierAvailability: supplierProduct ? supplierProduct.availability : "unavailable" };
      }),
      history: [{ status: "New Request", at: stamp() }] };
    S.sourcing.unshift(sr);
    order.sourcingIds.push(sr.ref);
    tl(order, "Sourcing request created", sr.ref + " created for " + supplierName(supplierId) + " (" + lineList.length + " item(s)).", "sourcing");
    notify(sr);
    return sr;
  }
  function routeOrder(order) {
    var groups = {}, un = [];
    order.lines.forEach(function (l) {
      var sid = S.preferred[l.productId];
      if (!sid) { un.push(l.name); return; }
      (groups[sid] = groups[sid] || []).push(l);
    });
    Object.keys(groups).forEach(function (sid) { createSR(order, sid, groups[sid]); });
    if (un.length) tl(order, "Unassigned items", "No supplier selected for: " + un.join(", ") + ".", "sourcing");
  }
  function srUpdate(sr, patch) {
    var order = byId(S.orders, sr.orderRef, "ref");
    var next = { "New Request": ["Accepted", "Declined"], "Accepted": ["Preparing", "Declined"], "Preparing": ["Ready for Collection"], "Ready for Collection": ["Collected"] };
    if (patch.status && patch.status !== sr.status && !has(next[sr.status] || [], patch.status)) fail("A request that is " + sr.status + " cannot move to " + patch.status + ".");
    if (patch.response) {
      var r = patch.response;
      var lines = (r.lines || []).map(function (l) {
        var q = Number(l.proposedQty), c = Number(l.proposedUnitCost);
        if (!(q >= 0) || !(c >= 0)) fail("Proposed quantity and price must be zero or more.");
        return { productId: l.productId, proposedQty: q, proposedUnitCost: c };
      });
      sr.response = { decision: patch.status === "Declined" ? "declined" : "accepted", lines: lines, note: String(r.note || "").slice(0, 300), at: stamp() };
    }
    if (patch.status && patch.status !== sr.status) {
      sr.status = patch.status;
      sr.history.push({ status: patch.status, at: stamp(), note: patch.note || "" });
      if (patch.status === "Accepted" || patch.status === "Declined") {
        var sup = byId(S.suppliers, sr.supplierId);
        S.notifications.unshift({ id: "N-" + nextId("notif"), direction: "inbound", srRef: sr.ref, supplierId: sr.supplierId, channel: sup ? sup.channel : "-", at: stamp(),
          status: "Supplier reply", note: "Supplier " + patch.status.toLowerCase() + " the request.", attempt: 0,
          message: sr.response ? (sr.response.note || "(no note)") : "(no note)" });
      }
      tl(order, "Supplier response", sr.ref + " is now: " + patch.status + ".", "sourcing");
    }
    sr.updatedAt = stamp();
    return sr;
  }

  /* ---------- deliveries ---------- */
  function createDelivery(order) {
    var z = byId(S.zones, order.zoneId);
    var d = { id: "D-" + nextId("delivery"), orderRef: order.ref, zoneId: order.zoneId, area: order.customer.area, partnerId: null, accepted: false,
      option: order.deliveryOption, scheduledDate: order.scheduledDate || null, estFee: order.deliveryFeeEst, actualCost: null, status: "Awaiting Assignment",
      cancelled: false, notes: [], pod: null, createdAt: stamp(), updatedAt: stamp(), history: [{ status: "Awaiting Assignment", at: stamp() }] };
    S.deliveries.unshift(d);
    order.deliveryId = d.id;
    return d;
  }
  function deliveryAssign(d, partnerId) {
    var order = byId(S.orders, d.orderRef, "ref");
    if (order.status === "Cancelled") fail("This order is cancelled.");
    if (has(["Delivered", "Returned"], d.status)) fail("This delivery is already closed.");
    if (partnerId) {
      if (!byId(S.partners, partnerId)) fail("Unknown delivery partner.");
      d.partnerId = partnerId; d.accepted = false;
      if (d.status === "Awaiting Assignment") { d.status = "Assigned"; d.history.push({ status: "Assigned", at: stamp() }); }
      tl(order, "Delivery partner assigned", "A delivery partner has been assigned to your order.", "delivery");
    } else {
      d.partnerId = null; d.accepted = false; d.status = "Awaiting Assignment";
      d.history.push({ status: "Awaiting Assignment", at: stamp(), note: "Partner unassigned" });
    }
    d.updatedAt = stamp();
    return d;
  }
  function sourcedQuantity(order, productId) {
    return sum(S.sourcing.filter(function (sr) { return sr.orderRef === order.ref && sr.status === "Collected"; }), function (sr) {
      return sum(sr.lines.filter(function (line) { return line.productId === productId; }), function (line) {
        var responseLine = sr.response ? byId(sr.response.lines, productId, "productId") : null;
        return responseLine ? Math.min(line.qty, responseLine.proposedQty) : line.qty;
      });
    });
  }
  function allocatedSourcingQuantity(orderRef, productId) {
    return sum(S.sourcing.filter(function (sr) { return sr.orderRef === orderRef && sr.status !== "Declined"; }), function (sr) {
      return sum(sr.lines.filter(function (line) { return line.productId === productId; }), function (line) {
        var responseLine = sr.response ? byId(sr.response.lines, productId, "productId") : null;
        return responseLine ? Math.min(line.qty, responseLine.proposedQty) : line.qty;
      });
    });
  }
  function orderFullySourced(order) {
    return order.lines.every(function (line) { return sourcedQuantity(order, line.productId) >= line.qty; });
  }
  function deliverySet(d, status, note) {
    if (!has(HB.DELIVERY_STATUSES, status)) fail("Unknown delivery status.");
    var order = byId(S.orders, d.orderRef, "ref");
    if (order.status === "Cancelled") fail("This order is cancelled.");
    if (status !== "Awaiting Assignment" && !d.partnerId) fail("Assign a delivery partner first.");
    if (has(["Ready for Pickup", "Picked Up", "Out for Delivery", "Delivered"], status) && stageIdx(order.status) < stageIdx("Packed")) fail("The order must be fully sourced and packed before delivery can start.");
    d.status = status; d.updatedAt = stamp();
    d.history.push({ status: status, at: stamp(), note: note || "" });
    if (note) d.notes.push({ at: stamp(), text: String(note).slice(0, 300) });
    if (status === "Out for Delivery") { if (stageIdx(order.status) < stageIdx("Out for Delivery")) setOrderStatus(order, "Out for Delivery", "Your order is out for delivery.", "delivery"); }
    else if (status === "Delivered") { d.deliveredAt = stamp(); order.delayed = false; setOrderStatus(order, "Delivered", "Marked as delivered.", "delivery"); }
    else if (status === "Picked Up") tl(order, "Picked up for delivery", "", "delivery");
    else if (status === "Ready for Pickup") tl(order, "Ready for pickup by delivery partner", "", "delivery");
    else if (status === "Failed Delivery" || status === "Returned") {
      order.delayed = true; order.delayNote = "A delivery attempt was unsuccessful. HomeBasket will contact you.";
      tl(order, "Delivery issue", order.delayNote, "delivery");
    }
    return d;
  }

  /* ---------- orders ---------- */
  function createOrderInternal(p) {
    var c = p.customer || {};
    if (!p.sample) {
      if (String(c.name || "").trim().length < 2) fail("Customer name is required.");
      if (!HB.normalizeNgPhone(c.phone)) fail("A valid Nigerian phone number is required.");
      if (String(c.address || "").trim().length < 8) fail("A full delivery address is required.");
    }
    if (!p.lines || !p.lines.length) fail("The order has no items.");
    var zone = byId(S.zones, p.zoneId);
    if (!zone) fail("Please choose a delivery area.");
    var option = p.deliveryOption === "scheduled" ? "scheduled" : "standard";
    if (option === "scheduled" && !p.sample && !(p.scheduledDate >= dateStr(0))) fail("Choose a delivery date that is today or later.");
    var lines = p.lines.map(function (l) {
      var pr = byId(S.products, l.productId);
      var qty = Math.floor(Number(l.qty));
      if (!pr || !pr.active) fail("A product in your basket is no longer available.");
      if (!(qty >= 1 && qty <= CFG.MAX_QTY)) fail("Quantity must be between 1 and " + CFG.MAX_QTY + ".");
      if (pr.stock === "out_of_stock") fail(pr.name + " is currently unavailable .");
      var option = HB.getProductOption(pr, l.optionId || null);
      var unitPrice = Number(l.unitPrice != null ? l.unitPrice : option.price);
      var unitLabel = String(l.unit || (option && option.label) || pr.unit || "Standard");
      return { productId: pr.id, name: pr.name, unit: unitLabel, measurement: String(l.measurement || unitLabel),
        packaging: String(l.packaging || "").slice(0, 120), brand: String(l.brand || "").slice(0, 80), qty: qty, unitPrice: unitPrice };
    });
    var subtotal = sum(lines, function (l) { return l.qty * l.unitPrice; });
    var order = { ref: CFG.ORDER_PREFIX + "-" + nextId("order"), accessToken: secureToken(), createdAt: stamp(), updatedAt: stamp(), sample: !!p.sample, customerId: typeof p.customerId === "string" ? p.customerId : null,
      customer: { name: String(c.name).trim(), phone: p.sample ? c.phone : HB.normalizeNgPhone(c.phone), address: String(c.address).trim(), area: zone.name, instructions: String(c.instructions || "").trim().slice(0, 300) },
      zoneId: zone.id, deliveryOption: option, scheduledDate: option === "scheduled" ? (p.scheduledDate || dateStr(1)) : "",
      lines: lines, subtotalEst: subtotal, deliveryFeeEst: HB.deliveryFeeFor(zone), totalEst: subtotal + (HB.deliveryFeeFor(zone) || 0),
      paymentStatus: "Payment pending", status: "Order Received", delayed: false, delayNote: "", confirmedTotal: null,
      timeline: [], sourcingIds: [], quotationId: null, deliveryId: null };
    tl(order, "Order Received", "Order request received.", "order");
    setOrderStatus(order, "Awaiting Availability/Price Confirmation", "HomeBasket will confirm availability and prices before accepting your order.", "order");
    S.orders.unshift(order);
    if (p.sample) routeOrder(order);
    createDelivery(order);
    return order;
  }
  function cancelOrder(order, note) {
    if (order.status === "Delivered") fail("A delivered order cannot be cancelled.");
    setOrderStatus(order, "Cancelled", note || "Order cancelled.", "order");
    var d = byId(S.deliveries, order.deliveryId);
    if (d) { d.cancelled = true; d.updatedAt = stamp(); d.notes.push({ at: stamp(), text: "Order cancelled: delivery no longer needed." }); }
  }
  function customerView(o) {
    var q = o.quotationId ? byId(S.quotations, o.quotationId) : null;
    var d = o.deliveryId ? byId(S.deliveries, o.deliveryId) : null;
    return { ref: o.ref, accessToken: o.accessToken || "", sample: !!o.sample, createdAt: o.createdAt, status: o.status, delayed: o.delayed, delayNote: o.delayNote,
      customer: { name: o.customer.name, area: o.customer.area, address: o.customer.address },
      deliveryOption: o.deliveryOption, scheduledDate: o.scheduledDate, lines: o.lines, subtotalEst: o.subtotalEst, deliveryFeeEst: o.deliveryFeeEst, freeDelivery: !!o.freeDelivery,
      totalEst: o.totalEst, confirmedTotal: o.confirmedTotal, paymentStatus: o.paymentStatus,
      timeline: o.timeline.filter(function (e) { return e.source === "order" || e.source === "delivery" || e.source === "quotation"; }).map(function (e) { return { at: e.at, status: e.status, note: e.note }; }),
      quotation: (q && q.status !== "Draft") ? { id: q.id, status: q.status, lines: q.lines, deliveryFee: q.deliveryFee, subtotal: q.subtotal, total: q.total, originalTotal: q.originalTotal, expiresAt: q.expiresAt, requiresApproval: q.requiresApproval } : null,
      delivery: d ? { status: d.cancelled ? "Cancelled" : d.status, estFee: d.estFee } : null };
  }

  /* ---------- quotations ---------- */
  function lineSig(lines) { return lines.map(function (l) { return l.productId + ":" + l.qty + ":" + l.unitPrice; }).join("|"); }
  function quoteCreate(order, o) {
    o = o || {};
    if (order.status === "Cancelled" || order.status === "Delivered") fail("This order is closed.");
    var src = o.lines && o.lines.length ? o.lines : order.lines;
    var lines = src.map(function (l) {
      var base = byId(order.lines, l.productId, "productId");
      if (!base) fail("Unknown product in quotation.");
      var qty = Math.floor(Number(l.qty)), price = Number(l.unitPrice != null ? l.unitPrice : base.unitPrice);
      if (!(qty >= 1)) fail("Quantity must be at least 1.");
      if (!(price >= 0)) fail("Price must be zero or more.");
      return { productId: l.productId, name: base.name, unit: base.unit, qty: qty, unitPrice: price, note: String(l.note || "").slice(0, 120) };
    });
    if (!lines.length) fail("A quotation needs at least one item.");
    var fee = (o.deliveryFee !== undefined && o.deliveryFee !== null && o.deliveryFee !== "") ? Number(o.deliveryFee) : (order.deliveryFeeEst || 0);
    if (!(fee >= 0)) fail("Delivery fee must be zero or more.");
    S.quotations.forEach(function (q) {
      if (q.orderRef === order.ref && (q.status === "Draft" || q.status === "Awaiting Customer Approval" || q.status === "Revision Requested")) {
        q.status = "Expired"; q.updatedAt = stamp(); q.history.push({ status: "Expired", at: stamp(), note: "Superseded by a newer quotation" });
      }
    });
    var subtotal = sum(lines, function (l) { return l.qty * l.unitPrice; });
    var base0 = (T !== null ? T : Date.now());
    var q = { id: "Q-" + nextId("quote"), orderRef: order.ref, status: "Draft", lines: lines, deliveryFee: fee, subtotal: subtotal, total: subtotal + fee,
      originalTotal: order.totalEst, requiresApproval: lineSig(lines) !== lineSig(order.lines) || order.deliveryFeeEst === null || fee !== order.deliveryFeeEst,
      createdAt: stamp(), updatedAt: stamp(), expiresAt: new Date(base0 + CFG.QUOTE_VALID_HOURS * 3600000).toISOString(), history: [{ status: "Draft", at: stamp() }] };
    S.quotations.unshift(q);
    order.quotationId = q.id;
    tl(order, "Quotation drafted", "Draft quotation " + q.id + " created.", "internal");
    return q;
  }
  function normalizeQuoteDecision(status) {
    var s = String(status || "").trim();
    if (!s) return s;
    var lower = s.toLowerCase();
    if (lower === "request changes" || lower === "revision requested" || lower === "requested changes") return "Revision Requested";
    if (lower === "declined") return "Declined";
    if (lower === "rejected") return "Rejected";
    return s;
  }
  function quoteStatus(q, status, note) {
    var normalized = normalizeQuoteDecision(status);
    var allowed = {
      "Draft": ["Awaiting Customer Approval", "Approved", "Expired"],
      "Awaiting Customer Approval": ["Approved", "Revision Requested", "Rejected", "Declined", "Expired"],
      "Revision Requested": ["Awaiting Customer Approval", "Approved", "Rejected", "Declined", "Expired"]
    };
    if (!has(allowed[q.status] || [], normalized)) fail("A " + q.status + " quotation cannot move to " + normalized + ".");
    if (q.status === "Draft" && normalized === "Approved" && q.requiresApproval) fail("This quotation differs from what the customer saw, so customer approval is required.");
    if (q.status === "Awaiting Customer Approval" && normalized !== "Expired" && Date.parse(q.expiresAt) < Date.now()) fail("This quotation has expired.");
    var order = byId(S.orders, q.orderRef, "ref");
    if (order.status === "Cancelled") fail("This order is cancelled.");
    q.status = normalized; q.updatedAt = stamp(); q.history.push({ status: normalized, at: stamp(), note: note || "" });
    if (normalized === "Awaiting Customer Approval") tl(order, "Awaiting your approval", "A final quotation is ready. Please review and approve it.", "quotation");
    else if (normalized === "Revision Requested") tl(order, "Quotation revision requested", "The customer requested changes to this quotation.", "quotation");
    else if (normalized === "Approved") {
      order.confirmedTotal = q.total; order.confirmedLines = clone(q.lines);
      order.paymentStatus = "Awaiting Payment";
      tl(order, "Quotation approved", "Approved total: " + HB_money(q.total) + ". Payment is still required before sourcing.", "quotation");
    } else if (normalized === "Rejected" || normalized === "Declined") cancelOrder(order, "Quotation declined. Order cancelled.");
    else if (normalized === "Expired") tl(order, "Quotation expired", "The quotation expired. HomeBasket may send a new one.", "quotation");
    return q;
  }
  function HB_money(n) { return "₦" + Math.round(n).toLocaleString("en-NG"); }

  /* ---------- seed ---------- */
  function seed() {
    T = null;
    S = { v: 2, createdAt: new Date().toISOString(), counters: { order: 1000, sr: 2000, quote: 4000, delivery: 5000, notif: 6000, bq: 3000, supplierApp: 7000 },
      products: clone(window.HB_PRODUCTS).map(function (p) { p.active = true; return p; }),
      suppliers: clone(D.suppliers), partners: clone(D.partners), zones: clone(D.zones),
      supplierProducts: [], preferred: {}, supplierApplications: [], orders: [], sourcing: [], notifications: [], quotations: [], deliveries: [], businessQuotes: [], payments: [] };
    S.suppliers.forEach(function (s, si) {
      S.products.forEach(function (p, pi) {
        if (has(s.categories, p.category)) {
          var unit = String(p.unit || "unit");
          var measure = unit;
          var packageLabel = (unit && unit.toLowerCase().indexOf("bag") > -1) ? "Retail bags" : ((unit && unit.toLowerCase().indexOf("carton") > -1) ? "Carton pack" : ((unit && unit.toLowerCase().indexOf("pack") > -1) ? "Retail pack" : "Standard pack"));
          var capacityLabel = p.stock === "out_of_stock" ? "0 units" : (p.stock === "low_stock" ? "Limited weekly stock" : "Regular weekly stock");
          S.supplierProducts.push({ supplierId: s.id, productId: p.id, cost: Math.round(p.price * s.costFactor / 50) * 50,
            availability: p.stock === "out_of_stock" ? "unavailable" : (p.stock === "low_stock" ? "low" : "available"),
            measurement: measure, packaging: packageLabel + " · demo sample", capacity: capacityLabel,
            minimumOrder: "1 " + unit, updatedAt: new Date(Date.now() - (1 + ((si + pi) % 6)) * 86400000).toISOString() });
        }
      });
    });
    S.suppliers.forEach(function (s) { delete s.costFactor; });
    S.products.forEach(function (p) {
      var best = null;
      S.supplierProducts.forEach(function (sp) {
        if (sp.productId !== p.id) return;
        if (byId(S.suppliers, sp.supplierId).status !== "Approved") return;
        if (!best || sp.cost < best.cost) best = sp;
      });
      if (best) S.preferred[p.id] = best.supplierId;
    });
    if (CFG.LOAD_SAMPLE_RECORDS) D.seedOrders.forEach(seedOrder);
    (CFG.LOAD_SAMPLE_RECORDS ? D.businessQuotes : []).forEach(function (b) {
      T = Date.now() - b.hoursAgo * 3600000;
      var items = b.items.map(function (i) { var pr = byId(S.products, i[0]); return { productId: pr.id, name: pr.name, unit: pr.unit, qty: i[1], unitPrice: pr.price }; });
      S.businessQuotes.unshift({ id: "BQ-" + nextId("bq"), createdAt: stamp(), businessName: b.businessName, contact: b.contact, phone: b.phone, area: b.area,
        requirements: b.requirements, frequency: b.frequency, notes: b.notes, items: items, indicativeSubtotal: sum(items, function (l) { return l.qty * l.unitPrice; }), status: b.status, sample: true });
    });
    T = null;
    return S;
  }
  function seedOrder(def) {
    T = Date.now() - def.hoursAgo * 3600000;
    var order = createOrderInternal({ sample: true, customer: def.customer, zoneId: def.zoneId, deliveryOption: def.option,
      scheduledDate: def.option === "scheduled" ? dateStr(1) : "", lines: def.lines.map(function (l) { return { productId: l[0], qty: l[1] }; }) });
    tick(15);
    var srs = S.sourcing.filter(function (s) { return s.orderRef === order.ref; });
    var st = def.stage;
    if (st === "cancelled") { cancelOrder(order, "Cancelled at the customer's request."); return; }
    if (st === "received") return;
    srs.forEach(function (sr) {
      srUpdate(sr, { status: "Accepted", response: { lines: sr.lines.map(function (l) { return { productId: l.productId, proposedQty: l.qty, proposedUnitCost: l.indicativeCost }; }),
        note: sr.notificationStatus === "Failed" ? "Confirmed by phone after manual contact." : "Confirmed." } });
      tick(10);
    });
    var lines = order.lines.map(function (l) { return { productId: l.productId, qty: l.qty, unitPrice: l.unitPrice }; });
    if (def.adjustFirstLinePrice) lines[0].unitPrice += def.adjustFirstLinePrice;
    var q = quoteCreate(order, { lines: lines, deliveryFee: order.deliveryFeeEst });
    if (st === "quote-pending") { quoteStatus(q, "Awaiting Customer Approval"); return; }
    if (q.requiresApproval) quoteStatus(q, "Awaiting Customer Approval");
    quoteStatus(q, "Approved"); tick(20);
    setOrderStatus(order, "Sourcing", "Sourcing in progress.", "order");
    srs.forEach(function (sr) { srUpdate(sr, { status: "Preparing" }); });
    if (st === "sourcing") return;
    tick(120);
    srs.forEach(function (sr) { srUpdate(sr, { status: "Ready for Collection" }); srUpdate(sr, { status: "Collected" }); });
    setOrderStatus(order, "Packed", "Order packed.", "order");
    var d = byId(S.deliveries, order.deliveryId);
    deliveryAssign(d, def.zoneId === "z-awka" ? "dp-1" : (def.zoneId === "z-onitsha" ? "dp-2" : "dp-3"));
    d.accepted = true; tick(30);
    deliverySet(d, "Ready for Pickup"); deliverySet(d, "Picked Up"); tick(20); deliverySet(d, "Out for Delivery");
    if (st === "delivered") { tick(60); d.actualCost = d.estFee; deliverySet(d, "Delivered", "Delivered."); }
  }

  /* ---------- public service layer ---------- */
  function mut(fn) {
    return function () {
      var a = arguments;
      return new Promise(function (res, rej) {
        try {
          ensure(); sweepQuotes();
          var before = clone(S), r = fn.apply(null, a);
          if (!save()) { S = before; fail("Your browser could not save this change. Check its storage settings and try again."); }
          res(clone(r));
        } catch (e) { rej(e); }
      });
    };
  }
  function rd(fn) {
    return function () {
      var a = arguments;
      return new Promise(function (res, rej) {
        try { ensure(); sweepQuotes(); res(clone(fn.apply(null, a))); } catch (e) { rej(e); }
      });
    };
  }
  core.mut = mut; core.rd = rd; core.state = function () { return ensure(); };
  core.notify = notify; core.byId = byId; core.fail = fail; core.stamp = stamp; core.nextId = nextId; core.supplierName = supplierName;

  var api = (HB.api = {});

  api.getProducts = rd(function (opts) { return S.products.filter(function (p) { return (opts && opts.includeInactive) || p.active; }); });
  api.getZones = rd(function () { return S.zones; });
  api.getSnapshot = rd(function () { return S; });

  api.createOrder = mut(function (payload) { return createOrderInternal(payload || {}); });
  api.getOrderByReference = rd(function (ref, opts) {
    var key = String(ref || "").trim().toUpperCase();
    var o = byId(S.orders, key, "ref");
    if (!o) return null;
    if (opts && opts.audience === "customer") {
      if (o.customerId) {
        if (HB.session.currentId() !== o.customerId) return null;
      } else if (!o.sample && o.accessToken && (!opts.accessToken || opts.accessToken !== o.accessToken)) return null;
      return customerView(o);
    }
    return o;
  });
  /* Orders placed by a signed-in customer on this device, newest first (customer-safe views only). */
  api.getCustomerOrders = rd(function (customerId) {
    return S.orders.filter(function (o) { return customerId && o.customerId === customerId; })
      .sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); }).map(function (order) {
        var view = customerView(order); view.accessToken = order.accessToken || ""; return view;
      });
  });
  api.updateOrderStatus = mut(function (ref, status, note) {
    var o = byId(S.orders, ref, "ref"); if (!o) fail("Order not found.");
    if (o.status === "Cancelled") fail("This order is cancelled.");
    if (status === "Sourcing") {
      if (stageIdx(o.status) < stageIdx("Confirmed")) fail("Confirm the order (approved quotation) before sourcing.");
      if (stageIdx(o.status) >= stageIdx("Sourcing")) fail("The order is already at or past Sourcing.");
      setOrderStatus(o, "Sourcing", note || "Sourcing in progress.", "order");
    } else if (status === "Packed") {
      if (o.status !== "Sourcing") fail("Only an order in Sourcing can be marked Packed.");
      if (!orderFullySourced(o)) fail("Every ordered product quantity must be marked Collected before packing.");
      setOrderStatus(o, "Packed", note || "Order packed.", "order");
      var d = byId(S.deliveries, o.deliveryId);
      if (d && d.status === "Assigned") deliverySet(d, "Ready for Pickup", "Order packed");
    } else if (status === "Cancelled") cancelOrder(o, note || "Order cancelled by HomeBasket.");
    else if (status === "Delayed") { o.delayed = true; o.delayNote = note || "Your order is delayed. HomeBasket will update you."; tl(o, "Order delayed", o.delayNote, "order"); }
    else if (status === "Not delayed") { o.delayed = false; o.delayNote = ""; tl(o, "Delay cleared", "", "order"); }
    else fail("Unsupported status change.");
    return o;
  });

  api.getSuppliers = rd(function () { return { suppliers: S.suppliers, supplierProducts: S.supplierProducts, preferred: S.preferred }; });
  api.getSupplierApplications = rd(function () { return S.supplierApplications; });
  api.saveSupplier = mut(function (s) {
    if (String(s.name || "").trim().length < 3) fail("Supplier name is required.");
    if (!has(HB.SUPPLIER_STATUSES, s.status)) fail("Invalid supplier status.");
    var rec = s.id ? byId(S.suppliers, s.id) : null;
    if (s.id && !rec) fail("Supplier not found.");
    if (!rec) { rec = { id: "sup-" + (S.suppliers.length + 1 + Math.floor(Math.random() * 900)) }; S.suppliers.push(rec); }
    ["name", "contact", "phone", "area"].forEach(function (k) { rec[k] = String(s[k] || "").trim(); });
    rec.categories = (s.categories || []).filter(function (c) { return byId(window.HB_CATEGORIES, c); });
    rec.status = s.status; rec.channel = has(["whatsapp", "sms", "email"], s.channel) ? s.channel : "whatsapp"; rec.verifiedContact = !!s.verifiedContact;
    return rec;
  });
  api.submitSupplierApplication = mut(function (payload) {
    payload = payload || {};
    var businessName = String(payload.businessName || "").trim();
    var contactPerson = String(payload.contactPerson || "").trim();
    var phone = HB.normalizeNgPhone(payload.phone || "");
    var email = String(payload.email || "").trim().toLowerCase();
    var businessAddress = String(payload.businessAddress || "").trim();
    var location = String(payload.location || "").trim();
    var businessType = String(payload.businessType || "").trim();
    var productCategories = Array.isArray(payload.productCategories) ? payload.productCategories.filter(Boolean) : [];
    var productsSupplied = String(payload.productsSupplied || "").trim();
    var description = String(payload.description || "").trim();
    var supplyCapacity = String(payload.supplyCapacity || "").trim();
    var availability = String(payload.availability || "").trim();
    var fulfilment = String(payload.fulfilment || "").trim();
    var paymentTerms = String(payload.paymentTerms || "").trim();
    var declaration = !!payload.declaration;
    if (businessName.length < 2) fail("Business name is required.");
    if (contactPerson.length < 2) fail("Contact person's full name is required.");
    if (!phone) fail("A valid Nigerian phone number is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fail("A valid email address is required.");
    if (!businessAddress) fail("Business address is required.");
    if (!location) fail("Location and operating area are required.");
    if (!productCategories.length) fail("Select at least one product category you supply.");
    if (!productsSupplied) fail("List the products you supply.");
    if (!description) fail("Briefly describe the products you supply.");
    if (!supplyCapacity) fail("Supply capacity is required.");
    if (!availability) fail("Availability is required.");
    if (!fulfilment) fail("Fulfilment arrangement is required.");
    if (!paymentTerms) fail("Payment terms are required.");
    if (!declaration) fail("You must confirm the application details are accurate and agree to the verification process.");
    var appNo = nextId("supplierApp");
    var app = {
      id: "SA-" + appNo,
      reference: "HB-APP-" + appNo,
      businessName: businessName,
      contactPerson: contactPerson,
      phone: phone,
      email: email,
      businessAddress: businessAddress,
      location: location,
      businessType: businessType,
      productCategories: productCategories,
      productsSupplied: productsSupplied,
      description: description,
      wholesalePrices: String(payload.wholesalePrices || "").trim(),
      units: String(payload.units || "").trim(),
      minimumOrderQuantity: String(payload.minimumOrderQuantity || "").trim(),
      supplyCapacity: supplyCapacity,
      availability: availability,
      fulfilment: fulfilment,
      paymentTerms: paymentTerms,
      photos: {
        exterior: Array.isArray(payload.photos && payload.photos.exterior) ? payload.photos.exterior : [],
        interior: Array.isArray(payload.photos && payload.photos.interior) ? payload.photos.interior : [],
        inventory: Array.isArray(payload.photos && payload.photos.inventory) ? payload.photos.inventory : []
      },
      status: "Pending Review",
      adminNotes: "",
      rejectionReason: "",
      createdAt: stamp(),
      updatedAt: stamp(),
      reviewedAt: null,
      submittedBy: "public"
    };
    S.supplierApplications.unshift(app);
    return app;
  });
  api.reviewSupplierApplication = mut(function (id, status, note) {
    var app = byId(S.supplierApplications, id, "id") || byId(S.supplierApplications, id, "reference");
    if (!app) fail("Supplier application not found.");
    if (!has(HB.SUPPLIER_APPLICATION_STATUSES, status)) fail("Invalid application status.");
    app.status = status;
    app.updatedAt = stamp();
    app.reviewedAt = stamp();
    if (note) app.adminNotes = String(note).slice(0, 1200);
    if (status === "Rejected") app.rejectionReason = String(note || "").slice(0, 1200);
    return app;
  });
  api.approveSupplierApplication = mut(function (id) {
    var app = byId(S.supplierApplications, id, "id") || byId(S.supplierApplications, id, "reference");
    if (!app) fail("Supplier application not found.");
    app.status = "Approved";
    app.updatedAt = stamp();
    app.reviewedAt = stamp();
    var existing = byId(S.suppliers, app.businessName, "name");
    if (!existing) {
      var supplier = { id: "sup-" + (S.suppliers.length + 1 + Math.floor(Math.random() * 900)), name: app.businessName, contact: app.contactPerson, phone: app.phone, area: app.location,
        categories: app.productCategories, status: "Pending Review", channel: "whatsapp", verifiedContact: false };
      S.suppliers.push(supplier);
      app.supplierId = supplier.id;
    }
    return app;
  });
  api.saveSupplierProduct = mut(function (supplierId, productId, data) {
    var sup = byId(S.suppliers, supplierId), pr = byId(S.products, productId);
    if (!sup || !pr) fail("Supplier or product not found.");
    var rec = null;
    S.supplierProducts.forEach(function (sp) { if (sp.supplierId === supplierId && sp.productId === productId) rec = sp; });
    if (!rec) { rec = { supplierId: supplierId, productId: productId, cost: 0, availability: "available", measurement: pr.unit || "unit",
      packaging: "Standard pack", capacity: "Regular weekly stock", minimumOrder: "1 unit", updatedAt: stamp() }; S.supplierProducts.push(rec); }
    if (data.cost !== undefined) { var c = Number(data.cost); if (!(c >= 0)) fail("Cost must be zero or more."); if (c !== rec.cost) { rec.cost = c; rec.updatedAt = stamp(); } }
    if (data.availability !== undefined) { if (!has(["available", "low", "unavailable"], data.availability)) fail("Invalid availability."); rec.availability = data.availability; rec.updatedAt = stamp(); }
    if (data.measurement !== undefined) rec.measurement = String(data.measurement || "").trim() || rec.measurement;
    if (data.packaging !== undefined) rec.packaging = String(data.packaging || "").trim() || rec.packaging;
    if (data.capacity !== undefined) rec.capacity = String(data.capacity || "").trim() || rec.capacity;
    if (data.minimumOrder !== undefined) rec.minimumOrder = String(data.minimumOrder || "").trim() || rec.minimumOrder;
    rec.updatedAt = stamp();
    return rec;
  });
  api.removeSupplierProduct = mut(function (supplierId, productId) {
    S.supplierProducts = S.supplierProducts.filter(function (sp) { return !(sp.supplierId === supplierId && sp.productId === productId); });
    if (S.preferred[productId] === supplierId) delete S.preferred[productId];
    return { ok: true };
  });
  api.setPreferredSupplier = mut(function (productId, supplierId) {
    if (!byId(S.products, productId)) fail("Product not found.");
    if (!supplierId) { delete S.preferred[productId]; return { productId: productId, supplierId: null }; }
    var sup = byId(S.suppliers, supplierId);
    if (!sup) fail("Supplier not found.");
    if (costOf(supplierId, productId) === null) fail("That supplier does not supply this product.");
    if (sup.status === "Suspended") fail("A suspended supplier cannot be selected.");
    S.preferred[productId] = supplierId;
    return { productId: productId, supplierId: supplierId, warning: sup.status === "Pending Review" ? "This supplier is still pending review." : "" };
  });
  api.createSourcingRequest = mut(function (orderRef, supplierId, productIds) {
    var o = byId(S.orders, orderRef, "ref"), sup = byId(S.suppliers, supplierId);
    if (!o) fail("Order not found."); if (!sup) fail("Supplier not found.");
    if (sup.status === "Suspended") fail("A suspended supplier cannot receive requests.");
    if (o.status === "Cancelled") fail("This order is cancelled.");
    if (!o.sample && o.paymentStatus.indexOf("Payment Successful") !== 0) fail("Payment must be verified before supplier assignment.");
    if (!productIds || !productIds.length) fail("Choose at least one item.");
    var assignedInRequest = {}, lines = productIds.map(function (assignment) {
      if (!assignment || (typeof assignment !== "string" && typeof assignment !== "object")) fail("Invalid product assignment.");
      var pid = typeof assignment === "string" ? assignment : assignment.productId;
      var l = byId(o.lines, pid, "productId");
      if (!l) fail("Item is not part of this order.");
      if (costOf(supplierId, pid) === null) fail(l.name + " is not supplied by " + sup.name + ".");
      var alreadyAssigned = allocatedSourcingQuantity(orderRef, pid);
      var remaining = l.qty - alreadyAssigned - (assignedInRequest[pid] || 0);
      var qty = typeof assignment === "string" ? remaining : Math.floor(Number(assignment.qty));
      if (!(Number.isInteger(qty) && qty > 0 && qty <= remaining)) fail("Assign a quantity from 1 to the remaining " + Math.max(remaining, 0) + " for " + l.name + ".");
      assignedInRequest[pid] = (assignedInRequest[pid] || 0) + qty;
      var line = {};
      Object.keys(l).forEach(function (key) { line[key] = l[key]; });
      line.qty = qty;
      return line;
    });
    return createSR(o, supplierId, lines);
  });
  api.updateSourcingRequest = mut(function (ref, patch) {
    var sr = byId(S.sourcing, ref, "ref"); if (!sr) fail("Sourcing request not found.");
    return srUpdate(sr, patch || {});
  });

  api.getDeliveryAssignments = rd(function (filter) {
    return S.deliveries.filter(function (d) { return !filter || !filter.partnerId || d.partnerId === filter.partnerId; });
  });
  api.assignDelivery = mut(function (id, partnerId) { var d = byId(S.deliveries, id); if (!d) fail("Delivery not found."); return deliveryAssign(d, partnerId || null); });
  api.updateDeliveryStatus = mut(function (id, status, note) { var d = byId(S.deliveries, id); if (!d) fail("Delivery not found."); return deliverySet(d, status, note); });
  api.updateDeliveryDetails = mut(function (id, data) {
    var d = byId(S.deliveries, id); if (!d) fail("Delivery not found.");
    if (data.actualCost !== undefined && data.actualCost !== "") { var c = Number(data.actualCost); if (!(c >= 0)) fail("Actual cost must be zero or more."); d.actualCost = c; }
    if (data.note) d.notes.push({ at: stamp(), text: String(data.note).slice(0, 300) });
    if (data.pod !== undefined) d.pod = String(data.pod).slice(0, 300);
    if (data.accepted !== undefined) d.accepted = !!data.accepted;
    d.updatedAt = stamp(); return d;
  });
  api.saveZone = mut(function (id, fee) {
    var z = byId(S.zones, id); if (!z) fail("Zone not found.");
    if (fee === null || fee === "") z.fee = null; else { var f = Number(fee); if (!(f >= 0)) fail("Fee must be zero or more."); z.fee = f; }
    return z;
  });
  api.setPartnerAvailability = mut(function (id, available) { var p = byId(S.partners, id); if (!p) fail("Partner not found."); p.available = !!available; return p; });

  api.submitBusinessQuoteRequest = mut(function (p) {
    p = p || {};
    if (String(p.businessName || "").trim().length < 2) fail("Business name is required.");
    if (String(p.contact || "").trim().length < 2) fail("Contact person is required.");
    if (!HB.normalizeNgPhone(p.phone)) fail("A valid Nigerian phone number is required.");
    if (!String(p.area || "").trim()) fail("Delivery area is required.");
    if (!String(p.requirements || "").trim() && !(p.items && p.items.length)) fail("Describe your requirements or select products.");
    /* Optional fields (validated only when supplied, so existing callers keep working) */
    var category = String(p.category || "").trim();
    if (category && !has(HB.BUSINESS_CATEGORIES, category)) fail("Choose a valid business category.");
    var deliveryAddress = String(p.deliveryAddress || "").trim();
    if (p.deliveryAddress !== undefined && deliveryAddress.length < 8) fail("A full delivery address is required.");
    var preferredDate = String(p.preferredDate || "").trim();
    if (preferredDate && !(/^\d{4}-\d{2}-\d{2}$/.test(preferredDate) && preferredDate >= dateStr(0))) fail("Choose a delivery date that is today or later.");
    var items = (p.items || []).map(function (i) {
      var pr = byId(S.products, i.productId), q = Number(i.qty);
      if (!pr || !(Number.isInteger(q) && q >= 1 && q <= 999)) fail("Quantities must be whole numbers from 1 to 999.");
      var option = HB.getProductOption(pr, i.optionId || null);
      if (!option) fail("Choose a valid measurement for " + pr.name + ".");
      return { productId: pr.id, name: pr.name, category: pr.category, subcategory: HB.productSubcategory(pr),
        brand: String(i.brand || "").trim().slice(0, 80), optionId: option.id, measurement: option.label,
        packaging: String(i.packaging || "").trim().slice(0, 120), unit: option.label, qty: q, unitPrice: option.price };
    });
    var email = String(p.email || "").trim().toLowerCase();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fail("Enter a valid email address.");
    var customerId = typeof p.customerId === "string" && p.customerId ? p.customerId : null;
    var customerName = String(p.contact).trim();
    var bq = { id: "BQ-" + nextId("bq"), createdAt: stamp(), updatedAt: stamp(), customerType: customerId ? "Registered" : "Guest", customerId: customerId,
      customer: { name: customerName, email: email, phone: HB.normalizeNgPhone(p.phone), address: deliveryAddress.slice(0, 300) },
      businessName: p.businessName.trim(), contact: customerName, email: email, phone: HB.normalizeNgPhone(p.phone), area: String(p.area).trim(),
      category: category, deliveryAddress: deliveryAddress.slice(0, 300), preferredDate: preferredDate,
      requirements: String(p.requirements || "").trim().slice(0, 1000), frequency: p.frequency || "One-off", notes: String(p.notes || "").trim().slice(0, 500), items: items,
      indicativeSubtotal: sum(items, function (l) { return l.qty * l.unitPrice; }), status: "New Request", sample: false,
      accessToken: secureToken(), quotations: [], revisionRequests: [], clarifications: [], payments: [], orderRef: null };
    S.businessQuotes.unshift(bq);
    return bq;
  });
  api.updateBusinessQuoteStatus = mut(function (id, status) {
    var b = byId(S.businessQuotes, id); if (!b) fail("Quote request not found.");
    if (!has(["New Request", "Under Review", "Declined"], status)) fail("Invalid request status.");
    if (b.status === "Approved" || b.orderRef) fail("This request can no longer be changed.");
    b.status = status; b.updatedAt = stamp(); return b;
  });
  api.requestBusinessQuoteClarification = mut(function (id, note) {
    var b = byId(S.businessQuotes, id); if (!b) fail("Quotation request not found.");
    var message = String(note || "").trim();
    if (message.length < 3) fail("Enter a clarification message.");
    if (!Array.isArray(b.clarifications)) b.clarifications = [];
    b.clarifications.push({ note: message.slice(0, 500), createdAt: stamp() });
    if (b.status !== "Declined" && !b.orderRef) b.status = "Under Review";
    b.updatedAt = stamp();
    return b;
  });

  api.prepareBusinessQuotation = mut(function (id, input) {
    var b = byId(S.businessQuotes, id); if (!b) fail("Quotation request not found.");
    if (b.status === "Declined" || b.orderRef) fail("This request is closed.");
    input = input || {};
    var lines = (input.lines || []).map(function (line) {
      var requested = byId(b.items, line.productId, "productId"), price = Number(line.unitPrice);
      if (!requested) fail("A quoted product was not in the original request.");
      if (!(price >= 0) || !isFinite(price)) fail("Enter a valid HomeBasket selling price.");
      return { productId: requested.productId, name: requested.name, category: requested.category, subcategory: requested.subcategory,
        brand: requested.brand, unit: requested.measurement || requested.unit, measurement: requested.measurement || requested.unit,
        packaging: requested.packaging, qty: requested.qty, unitPrice: price, note: String(line.note || "").trim().slice(0, 120) };
    });
    if (!lines.length) fail("A quotation needs at least one product.");
    var deliveryFee = Number(input.deliveryFee);
    if (!(deliveryFee >= 0) || !isFinite(deliveryFee)) fail("Enter a valid delivery charge.");
    var validDays = Number(input.validDays || 7);
    if (!(Number.isInteger(validDays) && validDays >= 1 && validDays <= 90)) fail("Quotation validity must be between 1 and 90 days.");
    var subtotal = sum(lines, function (line) { return line.qty * line.unitPrice; });
    var quote = { id: "BQ-" + b.id.slice(3) + "-V" + (b.quotations.length + 1), version: b.quotations.length + 1,
      status: "Draft", createdAt: stamp(), updatedAt: stamp(), expiresAt: new Date(Date.now() + validDays * 86400000).toISOString(),
      lines: lines, subtotal: subtotal, deliveryFee: deliveryFee, total: subtotal + deliveryFee,
      notes: String(input.notes || "").trim().slice(0, 1000), history: [{ status: "Draft", at: stamp() }] };
    b.quotations.push(quote); b.status = "Quotation Prepared"; b.updatedAt = stamp();
    return quote;
  });
  api.issueBusinessQuotation = mut(function (id, quoteId) {
    var b = byId(S.businessQuotes, id); if (!b) fail("Quotation request not found.");
    var q = byId(b.quotations, quoteId); if (!q || q.status !== "Draft") fail("Quotation draft not found.");
    if (b.status === "Declined" || b.orderRef) fail("This request is closed.");
    if (!b.accessToken) b.accessToken = secureToken();
    q.status = "Awaiting Customer Approval"; q.updatedAt = stamp();
    q.history.push({ status: q.status, at: stamp() });
    b.status = "Awaiting Customer Approval"; b.currentQuotationId = q.id; b.updatedAt = stamp();
    return { request: b, quotation: q };
  });
  function customerBusinessQuote(b, token) {
    if (!b || !token || b.accessToken !== token) return null;
    var q = b.currentQuotationId ? byId(b.quotations, b.currentQuotationId) : null;
    return { id: b.id, customerType: b.customerType, businessName: b.businessName, customer: b.customer,
      createdAt: b.createdAt, status: b.status, orderRef: b.orderRef, revisionRequests: b.revisionRequests, clarifications: b.clarifications,
      paymentStatus: b.payments.length ? b.payments[b.payments.length - 1].status : "Awaiting Payment",
      quotation: q && q.status !== "Draft" ? q : null };
  }
  api.getBusinessQuotationByToken = mut(function (token) {
    var b = S.businessQuotes.filter(function (x) { return x.accessToken === String(token || ""); })[0];
    var q = b && b.currentQuotationId ? byId(b.quotations, b.currentQuotationId) : null;
    if (q && q.status === "Awaiting Customer Approval" && Date.parse(q.expiresAt) < Date.now()) {
      q.status = "Expired"; q.updatedAt = stamp(); q.history.push({ status: "Expired", at: stamp(), note: "Validity period ended" });
      b.status = "Expired"; b.updatedAt = stamp();
    }
    return customerBusinessQuote(b, token);
  });
  api.getBusinessQuotationsForCustomer = rd(function (customerId) {
    return S.businessQuotes.filter(function (b) { return b.customerId && b.customerId === customerId; }).map(function (b) {
      return { id: b.id, accessToken: b.accessToken, businessName: b.businessName, createdAt: b.createdAt, status: b.status,
        quotation: b.currentQuotationId ? byId(b.quotations, b.currentQuotationId) : null, orderRef: b.orderRef };
    });
  });
  api.decideBusinessQuotation = mut(function (token, decision, note) {
    var b = S.businessQuotes.filter(function (x) { return x.accessToken === String(token || ""); })[0];
    if (!b) fail("Quotation link is invalid.");
    var q = b.currentQuotationId ? byId(b.quotations, b.currentQuotationId) : null;
    if (!q || q.status !== "Awaiting Customer Approval") fail("This quotation is no longer awaiting a decision.");
    if (Date.parse(q.expiresAt) < Date.now()) {
      q.status = "Expired"; q.updatedAt = stamp(); q.history.push({ status: "Expired", at: stamp(), note: "Validity period ended" });
      b.status = "Expired"; b.updatedAt = stamp();
      return customerBusinessQuote(b, token);
    }
    if (decision === "Revision Requested") {
      var request = String(note || "").trim();
      if (request.length < 3) fail("Please describe the changes you need.");
      q.status = "Revision Requested"; b.status = "Revision Requested";
      b.revisionRequests.push({ note: request.slice(0, 500), createdAt: stamp(), quotationId: q.id });
    } else if (decision === "Approved") {
      q.status = "Approved"; b.status = "Approved"; q.approvedAt = stamp();
    } else if (decision === "Declined") {
      q.status = "Declined"; b.status = "Declined";
    } else fail("Choose approve, request changes, or decline.");
    q.updatedAt = stamp(); q.decision = decision; q.decisionAt = stamp();
    q.history.push({ status: q.status, at: q.decisionAt, note: String(note || "").slice(0, 500) });
    b.updatedAt = stamp();
    return customerBusinessQuote(b, token);
  });
  api.payBusinessQuotation = mut(function (token, simulatedSuccess) {
    var b = S.businessQuotes.filter(function (x) { return x.accessToken === String(token || ""); })[0];
    if (!b) fail("Quotation link is invalid.");
    var q = b.currentQuotationId ? byId(b.quotations, b.currentQuotationId) : null;
    if (!q || q.status !== "Approved") fail("Approve the quotation before payment.");
    if (b.orderRef) fail("This quotation has already been paid.");
    var payment = { id: "PAY-" + nextId("payment"), quotationId: q.id, status: simulatedSuccess ? "Payment Successful (simulated)" : "Payment Failed (simulated)",
      amount: q.total, currency: "NGN", createdAt: stamp(), simulated: true };
    b.payments.push(payment);
    S.payments.unshift(payment);
    if (!simulatedSuccess) { b.updatedAt = stamp(); return { payment: payment, order: null }; }
    var zone = S.zones.filter(function (z) { return z.name === b.area; })[0] || S.zones.filter(function (z) { return z.id === "z-other"; })[0];
    if (!zone) fail("No delivery area is available for this quotation.");
    var order = createOrderInternal({ deferSourcing: true, customerId: b.customerId, customer: { name: b.contact, phone: b.phone, address: b.deliveryAddress, instructions: b.notes },
      zoneId: zone.id, deliveryOption: "standard", lines: q.lines.map(function (line) { return { productId: line.productId, qty: line.qty, unit: line.unit, unitPrice: line.unitPrice }; }) });
    order.accessToken = b.accessToken;
    order.businessQuoteId = b.id; order.businessQuotationId = q.id;
    order.paymentStatus = payment.status; order.confirmedTotal = q.total; order.confirmedLines = clone(q.lines);
    setOrderStatus(order, "Confirmed", "Approved quotation paid through the simulated frontend payment flow.", "quotation");
    routeOrder(order);
    setOrderStatus(order, "Sourcing", "Payment recorded in frontend demonstration; sourcing started.", "order");
    b.orderRef = order.ref; b.updatedAt = stamp();
    payment.orderRef = order.ref;
    return { payment: payment, order: { ref: order.ref, status: order.status } };
  });

  api.prepareFinalQuotation = mut(function (orderRef, opts) {
    var o = byId(S.orders, orderRef, "ref"); if (!o) fail("Order not found.");
    return quoteCreate(o, opts);
  });
  api.updateQuotationStatus = mut(function (id, status, note) { var q = byId(S.quotations, id); if (!q) fail("Quotation not found."); return quoteStatus(q, status, note); });
  api.recordCustomerQuotationApproval = mut(function (id, decision) {
    var q = byId(S.quotations, id); if (!q) fail("Quotation not found.");
    var normalized = normalizeQuoteDecision(decision);
    if (["Approved", "Rejected", "Declined", "Revision Requested"].indexOf(normalized) === -1) fail("Decision must be Approved, Declined, Rejected or Revision Requested.");
    if (q.status !== "Awaiting Customer Approval") fail("This quotation is not awaiting approval (status: " + q.status + ").");
    if (normalized === "Revision Requested") {
      return quoteStatus(q, "Revision Requested", "Customer requested changes to the quotation.");
    }
    return quoteStatus(q, normalized, "Recorded by HomeBasket");
  });
  api.payOrderQuotation = mut(function (orderRef, simulatedSuccess) {
    var order = byId(S.orders, orderRef, "ref");
    if (!order) fail("Order not found.");
    var q = order.quotationId ? byId(S.quotations, order.quotationId) : null;
    if (!q || q.status !== "Approved") fail("Approve the quotation before payment.");
    if (order.paymentStatus.indexOf("Payment Successful") === 0) fail("This order has already been paid.");
    var payment = { id: "PAY-" + nextId("payment"), orderRef: order.ref, quotationId: q.id, amount: q.total, currency: "NGN",
      status: simulatedSuccess ? "Payment Successful (simulated)" : "Payment Failed (simulated)", simulated: true, createdAt: stamp() };
    S.payments.unshift(payment);
    order.paymentStatus = payment.status;
    if (!simulatedSuccess) {
      tl(order, "Payment failed", "The simulated payment failed. No sourcing was started.", "payment");
      return { payment: payment, order: { ref: order.ref, status: order.status } };
    }
    if (order.status === "Cancelled") fail("This order is cancelled.");
    order.confirmedTotal = q.total; order.confirmedLines = clone(q.lines);
    if (stageIdx(order.status) < stageIdx("Confirmed")) setOrderStatus(order, "Confirmed", "Simulated payment recorded for the approved quotation.", "payment");
    routeOrder(order);
    setOrderStatus(order, "Sourcing", "Approved quotation paid in frontend demonstration; sourcing started.", "order");
    return { payment: payment, order: { ref: order.ref, status: order.status } };
  });

  api.saveProduct = mut(function (p) {
    if (String(p.name || "").trim().length < 2) fail("Product name is required.");
    if (!byId(window.HB_CATEGORIES, p.category)) fail("Choose a category.");
    var price = Number(p.price); if (!(price > 0)) fail("Selling price must be greater than zero.");
    if (!String(p.unit || "").trim()) fail("Unit is required.");
    if (!has(["in_stock", "low_stock", "out_of_stock"], p.stock)) fail("Invalid availability.");
    var rec = p.id ? byId(S.products, p.id) : null;
    if (p.id && !rec) fail("Product not found.");
    if (!rec) {
      var base = (p.name + "-" + p.unit).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40), id = base, n = 2;
      while (byId(S.products, id)) id = base + "-" + (n++);
      rec = { id: id, image: "assets/images/" + id + ".jpg" }; S.products.push(rec);
    }
    rec.name = p.name.trim(); rec.category = p.category; rec.unit = p.unit.trim(); rec.price = price; rec.stock = p.stock;
    rec.emoji = String(p.emoji || "").trim() || (HB.getCategory(p.category) || {}).emoji || "🛒";
    rec.description = String(p.description || "").trim().slice(0, 200); rec.active = p.active !== false;
    return rec;
  });
  api.resetRecords = function () {
    return new Promise(function (res) { HB.storage.remove("session", CFG.STATE_KEY); S = null; ensure(); window.dispatchEvent(new Event("hb:state-change")); res(true); });
  };
})();
