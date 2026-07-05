const jwt = require('jsonwebtoken');
const RESP_HTTP = require('../../consts');

function autenticar(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(RESP_HTTP.UNAUTHORIZED).json({ erro: 'Token de autenticação não fornecido' });
    }
    const token = authHeader.split(' ')[1];
    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(RESP_HTTP.UNAUTHORIZED).json({ erro: 'Token inválido ou expirado' });
    }
}

module.exports = autenticar;
