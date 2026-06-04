const RESP_HTTP = require('../../consts');

function obterId(req, res) {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: 'ID inválido' });
        return null;
    }
    return id;
}

module.exports = { obterId };