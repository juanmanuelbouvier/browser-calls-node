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
    dial.client("support_agent");
  }

  res.send(twiml.toString());
});

router.post('/enqueue', twilio.webhook({validate: false}), function(req, res, next) {
    const twiml = new VoiceResponse();

    const json = { from: req.body.callerId, expert_id: req.body.expertId };
    twiml
        .enqueue({
            workflowSid: 'WWdf028de9470acaccfcdf530fe1073f01',
        }, "Experts")
        .task({}, JSON.stringify(json));

    console.log(twiml.toString());

    res.setHeader('Content-Type', 'application/xml');
    res.send(twiml.toString());
});

module.exports = router;
