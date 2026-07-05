const RESP_HTTP = require('../../consts');

function obterId(req, res) {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: 'ID inválido' });
        return null;
    }
    return id;
}
function obterCpf(req, res) {
    const cpf = req.params.cpf;
    const cpfNormalizado = cpf.replace(/[.\-]/g, '');
    if (!/^\d{11}$/.test(cpfNormalizado)) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: 'CPF inválido. Use 00000000000 ou 000.000.000-00' });
        return null;
    }
    return cpfNormalizado;
}
 
function obterNome(req, res) {
    const nome = (req.query.nome || '').trim();
    if (!nome) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: 'Parâmetro de busca "nome" é obrigatório' });
        return null;
    }
    return nome;
}

function obterCnpj(req, res) {
    const cnpj = (req.params.cnpj || '').replace(/[.\-\/]/g, '');
    if (!/^\d{14}$/.test(cnpj)) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: 'CNPJ inválido. Use 00000000000000 ou 00.000.000/0000-00' });
        return null;
    }
    return cnpj;
}
 
module.exports = { obterId, obterCpf, obterCnpj, obterNome };
