const RESP_HTTP = require('../../consts');

function autorizarGerente(req, res, next) {
    if (req.usuario?.perfil_acesso !== 'Gerente') {
        return res.status(RESP_HTTP.FORBIDDEN).json({ erro: 'Acesso restrito a Gerentes' });
    }
    next();
}

module.exports = autorizarGerente;
