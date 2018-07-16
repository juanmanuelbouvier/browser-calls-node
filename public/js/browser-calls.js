/**
 * Twilio Client configuration for the browser-calls-rails
 * example application.
 */

// Store some selectors for elements we'll reuse
var callStatus = $("#call-status");
var answerButton = $(".answer-button");
var callSupportButton = $(".call-support-button");
var hangUpButton = $(".hangup-button");
var callCustomerButton = $(".call-customer-button");

/* Helper function to update the call status bar */
function updateCallStatus(status) {
  callStatus.text(status);
}

/* Get a Twilio Client token with an AJAX request */
$(document).ready(function() {
  $.post("/token/generate", {page: window.location.pathname}, function(data) {
    // Set up the Twilio Client Device with the token
    Twilio.Device.setup(data.token);
  });

  initNewTicketForm();
});

/* Callback to let us know Twilio Client is ready */
Twilio.Device.ready(function (device) {
  updateCallStatus("Preparado");
});

/* Report any errors to the call status display */
Twilio.Device.error(function (error) {
  updateCallStatus("ERROR: " + error.message);
});

/* Callback for when Twilio Client initiates a new connection */
Twilio.Device.connect(function (connection) {
  // Enable the hang up button and disable the call buttons
  hangUpButton.prop("disabled", false);
  callCustomerButton.prop("disabled", true);
  callSupportButton.prop("disabled", true);
  answerButton.prop("disabled", true);

  // If phoneNumber is part of the connection, this is a call from an
  // operator to a customer's phone
  if ("phoneNumber" in connection.message) {
    updateCallStatus("En llamada con " + connection.message.phoneNumber);
  } else {
    // This is a call from a website user to support agent
    updateCallStatus("En llamada con operador");
  }
});

/* Callback for when a call ends */
Twilio.Device.disconnect(function(connection) {
  // Disable the hangup button and enable the call buttons
  hangUpButton.prop("disabled", true);
  callCustomerButton.prop("disabled", false);
  callSupportButton.prop("disabled", false);

  updateCallStatus("Preparado");
});

/* Callback for when Twilio Client receives a new incoming call */
Twilio.Device.incoming(function(connection) {
  updateCallStatus("Entrando llamada de cliente");

  // Set a callback to be executed when the connection is accepted
  connection.accept(function() {
    updateCallStatus("En llamada con cliente");
  });

  // Set a callback on the answer button and enable it
  answerButton.click(function() {
    connection.accept();
  });
  answerButton.prop("disabled", false);
});

/* Call a customer from a ticket */
function callCustomer(phoneNumber) {
  updateCallStatus("Llamando a " + phoneNumber + "...");

  var params = {"phoneNumber": phoneNumber};
  Twilio.Device.connect(params);
}

/* Call support from the home page */
function callSupport() {
  updateCallStatus("Llamando a un operador...");

  // Our backend will assume that no params means a call to support
  Twilio.Device.connect();
}

/* End a call */
function hangUp() {
  Twilio.Device.disconnectAll();
}

function initNewTicketForm() {
  var formEl = $(".new-ticket");
  var buttonEl = formEl.find(".btn.btn-primary");

  // button handler
  formEl.find("[type='button']").click(function(e) {
    $.ajax({
        url: '/tickets/new',
        type: 'post',
        data: formEl.serialize()
    })
    .done(function(){
      showNotification("El ticker fue creado éxitosamente.", "success")
      // clear form
      formEl.find("input[type=text], textarea").val("");
    })
    .fail(function(res) {
      showNotification("La creación del ticket falló. " + res.responseText, "danger")
    });
  });
}

function showNotification(text, style) {
  var alertStyle = "alert-"+style;
  var alertEl = $(".alert.ticket-notifications");

  if (alertEl.length == 0) {
    alertEl = $("<div class=\"alert ticket-notifications\"></div>");
    $("body").before(alertEl);
  }

  alertEl.removeClass (function (index, css) {
    return (css.match (/(^|\s)alert-\S+/g) || []).join(' ');
  });

  alertEl.addClass(alertStyle);
  alertEl.html(text);

  setTimeout(clearNotifications, 4000)
}

function clearNotifications() {
  var alertEl = $(".alert.ticket-notifications");
  alertEl.remove();
}
