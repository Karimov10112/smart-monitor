/**
 * Express uchun tayyor router — boshqa dasturchi bir qatorda ulaydi:
 *
 *   const express = require('express');
 *   const { createExpressRouter } = require('@karimov_dev/diabets');
 *   app.use('/api/diabetes', createExpressRouter(express));
 *
 * express kutubxonaning bog'liqligi emas — chaqiruvchi o'z express nusxasini beradi.
 */

const { createDiabetesHandlers } = require('./handlers');
const { getOpenAPISpec } = require('./openapi');

/**
 * @param {Function} express — `require('express')`
 * @param {{ defaultLang?: string, onAlert?: Function, basePath?: string }} [options]
 */
function createExpressRouter(express, options = {}) {
  if (!express || typeof express.Router !== 'function') {
    throw new TypeError('createExpressRouter(express): express moduli berilishi kerak');
  }
  const router = express.Router();
  const h = createDiabetesHandlers(options);
  const send = (handler) => (req, res) => {
    const out = handler(req.body);
    res.status(out.status).json(out.body);
  };

  router.use(express.json({ limit: '2mb', type: ['application/json', 'application/fhir+json'] }));
  router.post('/metrics', send(h.metrics));
  router.post('/risk', send(h.risk));
  router.post('/alert', send(h.alert));
  router.post('/glycemic-profile/plan', send(h.profilePlan));
  router.post('/glycemic-profile/analyze', send(h.profileAnalyze));
  router.post('/trend', send(h.trend));
  router.post('/findrisc', send(h.findrisc));
  router.post('/insulin/bolus', send(h.bolus));
  router.post('/fhir/observation', send(h.fhir));
  router.get('/openapi.json', (req, res) => res.json(getOpenAPISpec({ serverUrl: options.basePath || req.baseUrl })));
  return router;
}

module.exports = { createExpressRouter };
