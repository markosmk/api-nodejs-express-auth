const jwt = require('express-jwt');

function authJwt() {
  const secret = process.env.SECRET_JWT;
  const API = process.env.API_URL;
  return jwt({
    secret,
    algorithms: ['HS256'],
  }).unless({
    // routes out jwt
    path: [
      { url: /\/api\/v1\/products(.*)/, method: ['GET', 'OPTIONS'] },
      { url: /\/api\/v1\/categories(.*)/, method: ['GET', 'OPTIONS'] },
      `${API}/users/login`,
      `${API}/users/register`,
    ],
  });
}

module.exports = authJwt;
