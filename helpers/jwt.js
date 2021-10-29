const jwt = require('express-jwt');

function authJwt() {
  const secret = process.env.SECRET_JWT;
  const API = process.env.API_URL;
  return jwt({
    secret,
    algorithms: ['HS256'],
    isRevoked: isRevoked,
  }).unless({
    // routes out jwt
    path: [
      { url: /\/public\/uploads(.*)/, method: ['GET', 'OPTIONS'] },
      { url: /\/api\/v1\/products(.*)/, method: ['GET', 'OPTIONS'] },
      { url: /\/api\/v1\/categories(.*)/, method: ['GET', 'OPTIONS'] },
      { url: /\/api\/v1\/orders(.*)/, methods: ['GET', 'OPTIONS', 'POST'] },
      `${API}/users/login`,
      `${API}/users/register`,
    ],
  });
}

async function isRevoked(req, payload, done) {
  // sino es admin entonces rechazamos el token
  if (!payload.isAdmin) {
    done(null, true);
  }
  done();

  //done(null, !!payload.isAdmi);
}

module.exports = authJwt;
