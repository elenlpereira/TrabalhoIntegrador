const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/usuarioModel');
const LogModel = require('../models/logModel');
const RESP_HTTP = require('../../consts');

async function login(req, res) {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(RESP_HTTP.BAD_REQUEST).json({ erro: 'E-mail e senha são obrigatórios' });
    }

    const usuario = await UsuarioModel.buscarPorEmail(email);
    if (!usuario || !bcrypt.compareSync(senha, usuario.senha)) {
        return res.status(RESP_HTTP.UNAUTHORIZED).json({ erro: 'E-mail ou senha incorretos' });
    }

    const payload = {
        id_usuario:    usuario.id_usuario,
        nome:          usuario.nome,
        perfil_acesso: usuario.perfil_acesso,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    LogModel.registrar({
        fk_usuario: usuario.id_usuario,
        tipo: 'login',
        descricao: `Login realizado por ${usuario.nome} (${usuario.perfil_acesso})`,
    }).catch(() => {});

    res.status(RESP_HTTP.OK).json({ token, usuario: payload });
}

module.exports = { login };
