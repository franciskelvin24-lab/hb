/* HomeBasket — order tracking (status entered by the HomeBasket team; not live tracking) */
(function () {
  "use strict";
  var HB = window.HB;

  function quoteCard(q, order) {
    var rows = q.lines.map(function (l) { return "<tr><td>" + HB.escapeHtml(l.name) + '<br><small class="muted">' + HB.escapeHtml(l.unit) + "</small></td><td>" + l.qty + "</td><td>" + HB.formatNaira(l.unitPrice) + "</td><td>" + HB.formatNaira(l.qty * l.unitPrice) + "</td></tr>"; }).join("");
    var actions = "";
    if (q.status === "Awaiting Customer Approval") {
      actions = '<p class="note">Your original estimate was ' + HB.formatNaira(q.originalTotal) + ". Valid until " + HB.formatDateTime(q.expiresAt) + ".</p>" +
        '<div class="btn-row"><button type="button" class="btn btn-primary" data-decision="Approved" data-id="' + q.id + '">Approve quotation</button><button type="button" class="btn btn-outline" data-decision="Revision Requested" data-id="' + q.id + '">Request changes</button><button type="button" class="btn btn-outline" data-decision="Rejected" data-id="' + q.id + '">Decline</button></div>';
    } else if (q.status === "Revision Requested") {
      actions = '<p class="note">You asked for changes to this quotation. HomeBasket will review your request and send a revised quote.</p>';
    } else if (q.status === "Approved" && order.paymentStatus.indexOf("Payment Successful") !== 0) {
      actions = '<div class="alert alert-warn"><strong>Payment demonstration only.</strong> Flutterwave is not connected to a secure backend. No real payment will be taken or verified.</div>' +
        '<p><strong>Approved amount: ' + HB.formatNaira(q.total) + '</strong></p><div class="btn-row"><button type="button" class="btn btn-primary" data-payment="success">Simulate successful payment</button> <button type="button" class="btn btn-outline" data-payment="failure">Simulate failed payment</button></div>';
    } else if (q.status === "Approved") {
      actions = '<p class="alert alert-success"><strong>' + HB.escapeHtml(order.paymentStatus) + '.</strong> Sourcing can proceed after this simulated payment.</p>';
    }
    return '<section class="form-card quote-card"><h2>Final quotation ' + HB.badge(q.status) + "</h2>" +
      '<p>HomeBasket confirmed the prices and availability below. One price per item.</p><div class="table-wrap"><table class="table"><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>' + rows + "</tbody></table></div>" +
      '<dl class="summary-rows"><div><dt>Items subtotal</dt><dd>' + HB.formatNaira(q.subtotal) + "</dd></div><div><dt>Delivery fee</dt><dd>" + HB.formatFee(q.deliveryFee) + '</dd></div><div class="total"><dt>Quotation total</dt><dd>' + HB.formatNaira(q.total) + "</dd></div></dl>" + actions + "</section>";
  }
  function render(o, root) {
    var d = HB.orderUpdates.describe(o), log = o.timeline.slice().reverse(), e = HB.escapeHtml, banner = "";
    if (o.sample) banner += '<div class="alert alert-info" role="note"><strong>Sample order.</strong> This is an example order used for testing. It is not a real purchase.</div>';
    if (o.delayed) banner += '<div class="alert alert-warn" role="status"><strong>Delayed.</strong> ' + e(o.delayNote || "HomeBasket will update you.") + "</div>";
    var tone = d.cancelled ? "badge-danger" : (d.stepIndex === 7 ? "badge-success" : "badge-warn");
    var steps = d.steps.map(function (s) {
      return '<li class="' + s.state + '"' + (s.state === "current" ? ' aria-current="step"' : "") + '><span class="tl-dot" aria-hidden="true"></span><div><strong>' + e(s.label) + "</strong>" + (s.at && s.state !== "todo" ? '<small class="muted"> ' + HB.formatDateTime(s.at) + "</small>" : "") + "</div></li>";
    }).join("") + (d.cancelled ? '<li class="cancelled" aria-current="step"><span class="tl-dot" aria-hidden="true"></span><div><strong>Cancelled / Unavailable</strong></div></li>' : "");
    var rows = d.lines.map(function (l) {
      return "<li><span>" + l.qty + " × " + e(l.name) + '<small class="muted"> ' + e(l.unit) + " · " + HB.formatNaira(l.unitPrice) + " each</small></span><strong>" + HB.formatNaira(l.qty * l.unitPrice) + "</strong></li>";
    }).join("");
    var priceHead = d.priceState === "approved" ? "Approved quotation" : (d.priceState === "quoted" ? "Quoted prices" : "Your order");
    root.innerHTML = '<div class="track-head"><h2>Order ' + e(o.ref) + '</h2><p><span class="badge ' + tone + '">' + e(d.label) + "</span> " + HB.badge(o.paymentStatus) + '</p><p class="muted">Ordered ' + HB.formatDateTime(o.createdAt) + " · " + e(o.customer.area) + "</p></div>" + banner +
      '<section class="update-card" aria-live="polite"><h2>Latest update</h2><p class="update-label">' + e(d.label) + "</p><p>" + e(d.message) + '</p><p class="muted small">Last updated by our team: ' + HB.formatDateTime(d.lastUpdated) + ". Status is updated by our team and is not tracked live.</p></section>" +
      '<ol class="timeline">' + steps + "</ol>" +
      (o.quotation && o.quotation.status !== "Draft" ? quoteCard(o.quotation, o) : "") +
      '<section class="form-card"><h2>' + priceHead + '</h2><ul class="summary-items">' + rows + "</ul>" +
      '<dl class="summary-rows"><div><dt>Items subtotal</dt><dd>' + HB.formatNaira(d.subtotal) + "</dd></div><div><dt>Delivery fee</dt><dd>" + HB.formatFee(d.deliveryFee) + '</dd></div><div class="total"><dt>' + e(d.totalLabel) + "</dt><dd>" + HB.formatNaira(d.total) + (d.deliveryFee === null ? " + delivery" : "") + "</dd></div></dl>" +
      (d.priceNote ? '<p class="note">' + e(d.priceNote) + "</p>" : "") + (d.priceState === "quoted" && o.totalEst !== d.total ? '<p class="note">When you ordered, your estimate was ' + HB.formatNaira(o.totalEst) + ".</p>" : "") + "</section>" +
      '<section class="form-card"><h2>Updates</h2><ul class="activity">' + log.map(function (x) { return "<li><strong>" + e(x.status) + '</strong> <small class="muted">' + HB.formatDateTime(x.at) + "</small>" + (x.note ? "<br>" + e(x.note) : "") + "</li>"; }).join("") + "</ul></section>";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("track-form"); if (!form) return;
    var input = document.getElementById("track-ref"), result = document.getElementById("track-result"), err = document.getElementById("err-ref");
    var current = null, currentToken = "";
    function lookup(ref, accessToken) {
      err.textContent = "";
      if (!ref.trim()) { err.textContent = "Enter your order reference, e.g. HB-1001."; input.focus(); return; }
      currentToken = accessToken || "";
      result.innerHTML = '<p class="muted">Looking up your order…</p>';
      HB.data.orders.getByReference(ref, currentToken).then(function (o) {
        if (!o) { current = null; result.innerHTML = '<div class="empty-state"><div class="empty-icon" aria-hidden="true">🔍</div><h2>No order found</h2><p>We could not find an order with that reference on this device. Check the reference and try again, or message us on WhatsApp.</p></div>'; return; }
        current = o.ref; render(o, result);
      }, function (e) { result.innerHTML = '<div class="alert alert-danger">' + HB.escapeHtml(HB.errMsg(e)) + "</div>"; });
    }
    form.addEventListener("submit", function (e) { e.preventDefault(); lookup(input.value, currentToken); });
    result.addEventListener("click", function (e) {
      var paymentButton = e.target.closest("[data-payment]");
      if (paymentButton) {
        var success = paymentButton.dataset.payment === "success";
        HB.data.quotations.payOrder(current, success).then(function () {
          HB.toast(success ? "Simulated payment recorded. No real payment was taken." : "Simulated payment failed; no sourcing was started.", success ? "success" : "error");
          lookup(current);
        }, function (error) { HB.toast(HB.errMsg(error), "error"); });
        return;
      }
      var b = e.target.closest("[data-decision]"); if (!b) return;
      var decision = b.dataset.decision;
      var title = decision === "Approved" ? "Approve quotation" : (decision === "Revision Requested" ? "Request changes" : "Decline quotation");
      var message = decision === "Approved" ? "Approve this quotation? Payment is still required before supplier sourcing starts." :
        (decision === "Revision Requested" ? "Request changes to this quotation? HomeBasket will review your notes and prepare a revised quote." : "Decline this quotation? The order will be cancelled.");
      var confirmLabel = decision === "Approved" ? "Approve" : (decision === "Revision Requested" ? "Send request" : "Decline");
      HB.confirm(message, { title: title, confirmLabel: confirmLabel, danger: decision === "Rejected" || decision === "Declined" }).then(function (ok) {
        if (!ok) return;
        var successText = decision === "Approved" ? "Quotation approved." : (decision === "Revision Requested" ? "Change request sent." : "Quotation declined.");
        HB.run(HB.data.quotations.recordCustomerDecision(b.dataset.id, decision), successText).then(function () { lookup(current); }, function () {});
      });
    });
    var params = new URLSearchParams(window.location.search), q = params.get("ref"), accessToken = params.get("token");
    if (q) { input.value = q; lookup(q, accessToken); }
  });
})();
