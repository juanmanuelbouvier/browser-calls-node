var express = require('express');
var router = express.Router();
var twilio = require('twilio');
var VoiceResponse = twilio.twiml.VoiceResponse;

// POST /calls/connect
router.post('/connect', twilio.webhook({validate: false}), function(req, res, next) {
  var phoneNumber = req.body.phoneNumber;
  var callerId = process.env.TWILIO_PHONE_NUMBER;
  var twiml = new VoiceResponse();
  twiml.say(
      {
          voice: 'alice',
          language: 'es-MX',
      },
      'No me preguntes, sólo soy una demo'
  );

  var dial = twiml.dial({
      callerId : callerId,
      record: 'record-from-answer-dual'
  });
  if (phoneNumber != null) {
    dial.number(phoneNumber);
  } else {
    dial.client("expert");
  }

  res.send(twiml.toString());
});

module.exports = router;
