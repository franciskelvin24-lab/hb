/* Customer-facing view for token-protected business quotations. */
(function () {
  "use strict";
  var HB = window.HB, esc = HB.escapeHtml, root;
  var token = new URLSearchParams(window.location.search).get("token") || "";

  function render(record) {
    if (!record) {
      root.innerHTML = '<div class="empty-state"><h2>Quotation link unavailable</h2><p>This link is invalid or this browser does not have the matching quotation record. Contact HomeBasket with your request reference.</p></div>';
      return;
    }
    if (!record.quotation) {
      var questions = (record.clarifications || []).map(function (item) { return '<li>' + esc(item.note) + " <small class=\"muted\">" + HB.formatDateTime(item.createdAt) + "</small></li>"; }).join("");
      root.innerHTML = '<section class="form-card"><h2>Request ' + esc(record.id) + '</h2><p>' + HB.badge(record.status) + '</p><p>Your request is saved. The HomeBasket team has not issued a quotation yet.</p>' +
        (questions ? "<h3>HomeBasket clarification requests</h3><ul>" + questions + "</ul>" : "") +
        '<p class="note">This link uses a random access token, but the record is stored in this browser only. It is not a production-secure cross-device link. Email and WhatsApp notifications are not sent automatically.</p></section>';
      return;
    }
    var q = record.quotation;
    var rows = q.lines.map(function (line) {
      return "<tr><td>" + esc(line.name) + '<br><small class="muted">' + esc(line.measurement || line.unit) +
        (line.brand ? " · " + esc(line.brand) : "") + (line.packaging ? " · " + esc(line.packaging) : "") +
        (line.note ? "<br>" + esc(line.note) : "") + "</small></td><td>" + line.qty + "</td><td>" +
        HB.formatNaira(line.unitPrice) + "</td><td>" + HB.formatNaira(line.qty * line.unitPrice) + "</td></tr>";
    }).join("");
    var actions = "";
    if (q.status === "Awaiting Customer Approval") {
      actions = '<div class="btn-row"><button type="button" class="btn btn-primary" data-action="approve">Approve quotation</button> <button type="button" class="btn btn-outline" data-action="revise">Request changes</button> <button type="button" class="btn btn-outline" data-action="decline">Decline</button></div>';
    } else if (q.status === "Approved" && !record.orderRef) {
      actions = '<div class="alert alert-warn"><strong>Payment demonstration only.</strong> Flutterwave has not been connected to a secure backend. No real payment will be taken or verified.</div>' +
        '<p><strong>Approved amount: ' + HB.formatNaira(q.total) + '</strong></p><div class="btn-row"><button type="button" class="btn btn-primary" data-action="pay-success">Simulate successful payment</button> <button type="button" class="btn btn-outline" data-action="pay-failure">Simulate failed payment</button></div>';
    } else if (record.orderRef) {
      actions = '<div class="alert alert-success"><strong>Payment simulation completed.</strong> Order ' + esc(record.orderRef) + ' is ready for demonstration tracking.</div><a class="btn btn-primary" href="track-order.html?ref=' + encodeURIComponent(record.orderRef) + '&token=' + encodeURIComponent(token) + '">Track order</a>';
    } else if (q.status === "Revision Requested") {
      actions = '<p class="note">Your request for changes has been recorded. The previous quotation version remains saved.</p>';
    } else if (q.status === "Declined" || q.status === "Expired") {
      actions = '<p class="note">This quotation is ' + esc(q.status.toLowerCase()) + '. Contact HomeBasket if you need further help.</p>';
    }
    root.innerHTML = '<section class="form-card"><div class="row-between"><h2>Quotation ' + esc(q.id) + '</h2>' + HB.badge(q.status) + '</div>' +
      '<p>Request reference: <strong>' + esc(record.id) + '</strong> · Valid until ' + HB.formatDateTime(q.expiresAt) + '</p>' +
      '<div class="table-wrap"><table class="table"><thead><tr><th>Product</th><th>Qty</th><th>Unit price</th><th>Total</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<dl class="summary-rows"><div><dt>Subtotal</dt><dd>' + HB.formatNaira(q.subtotal) + '</dd></div><div><dt>Delivery fee</dt><dd>' + HB.formatNaira(q.deliveryFee) + '</dd></div><div class="total"><dt>Total</dt><dd>' + HB.formatNaira(q.total) + '</dd></div></dl>' +
      (q.notes ? '<p><strong>HomeBasket notes:</strong> ' + esc(q.notes) + '</p>' : '') + actions +
      '<p class="note">This demonstration stores records in the current browser session. Access links are not production authentication and should not be used for real payment or confidential data.</p></section>';
  }

  function load() {
    if (!/^[a-f0-9]{64}$/.test(token)) { render(null); return; }
    HB.data.quotations.getBusinessByToken(token).then(render, function (error) {
      root.innerHTML = '<div class="alert alert-danger">' + esc(HB.errMsg(error)) + '</div>';
    });
  }
  function decide(decision, note) {
    HB.data.quotations.decideBusiness(token, decision, note).then(function (record) {
      render(record);
      if (decision === "Approved") HB.toast("Quotation approved. Approval is not payment.");
      else if (decision === "Declined") HB.toast("Quotation declined.");
      else HB.toast("Your change request has been saved.");
    }, function (error) { HB.toast(HB.errMsg(error), "error"); });
  }
  function requestChanges() {
    HB.modal({ title: "Request quotation changes", body: '<div class="field"><label for="quote-revision-note">What would you like changed?</label><textarea id="quote-revision-note" rows="4" maxlength="500"></textarea></div><p class="field-error" id="quote-revision-error" role="alert"></p>',
      actions: [{ label: "Cancel", cls: "btn-outline" }, { label: "Send request", cls: "btn-primary", onClick: function (control) {
        var note = control.el.querySelector("#quote-revision-note").value.trim();
        if (note.length < 3) { control.el.querySelector("#quote-revision-error").textContent = "Describe the changes you need."; return false; }
        return HB.data.quotations.decideBusiness(token, "Revision Requested", note).then(function (record) {
          render(record); HB.toast("Your change request has been saved.");
        }, function (error) {
          control.el.querySelector("#quote-revision-error").textContent = HB.errMsg(error); return false;
        });
      } }] });
  }
  function pay(success) {
    HB.data.quotations.payBusiness(token, success).then(function (result) {
      if (!success) HB.toast("Simulated payment failed. No order was created.", "error");
      else HB.toast("Simulated payment recorded. No real payment was taken.");
      load();
    }, function (error) { HB.toast(HB.errMsg(error), "error"); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    root = document.getElementById("business-quotation-root");
    if (!root) return;
    root.addEventListener("click", function (event) {
      var button = event.target.closest("[data-action]");
      if (!button) return;
      if (button.dataset.action === "approve") {
        HB.confirm("Approve this quotation? Approval is not payment.", { title: "Approve quotation", confirmLabel: "Approve" }).then(function (ok) { if (ok) decide("Approved", ""); });
      } else if (button.dataset.action === "decline") {
        HB.confirm("Decline this quotation? It will not proceed to payment or sourcing.", { title: "Decline quotation", confirmLabel: "Decline", danger: true }).then(function (ok) { if (ok) decide("Declined", ""); });
      } else if (button.dataset.action === "revise") requestChanges();
      else if (button.dataset.action === "pay-success") pay(true);
      else if (button.dataset.action === "pay-failure") pay(false);
    });
    load();
  });
})();
