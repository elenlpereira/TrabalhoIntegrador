const sequelize = require('../../config/localConnection');
const { DataTypes, Op } = require('sequelize');

const CONSUMIDOR_FINAL_ID = 1;

// ── Schema ──

const Cliente = sequelize.define('Cliente', {
    id_cliente:      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome:            { type: DataTypes.STRING(100), allowNull: false },
    cpf:             { type: DataTypes.STRING(14), allowNull: false, unique: true },
    telefone:        { type: DataTypes.STRING(20) },
    email:           { type: DataTypes.STRING(100) },
    data_nascimento: { type: DataTypes.DATEONLY },
    endereco:        { type: DataTypes.STRING(255) },
}, {
    tableName: 'cliente',
    freezeTableName: true,
    timestamps: false,
});
 
// ── Validações ────────────────────────────────────────────────────────────────
 
function validarFormatoCpf(cpf) {
    return /^(?:\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/.test(cpf);
}
 
function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
 
function normalizarCpf(cpf) {
    return cpf.replace(/[.\-]/g, '');
}
 
function validarCamposObrigatorios(dados) {
    if (!dados.nome || !dados.cpf || !dados.telefone) {
        throw new Error('Campos obrigatórios ausentes: nome, cpf, telefone');
    }
}
 
async function validarCpfUnico(cpf, idIgnorado = null) {
    const cpfNorm = normalizarCpf(cpf);
    const where = { cpf: cpfNorm };
    if (idIgnorado) where.id_cliente = { [Op.ne]: idIgnorado };
    const existe = await Cliente.findOne({ where });
    if (existe) throw new Error('CPF já cadastrado');
}

async function validarEmailUnico(email, idIgnorado = null) {
    if (!email) return;
    const where = { email };
    if (idIgnorado) where.id_cliente = { [Op.ne]: idIgnorado };
    const existe = await Cliente.findOne({ where });
    if (existe) throw new Error('E-mail já cadastrado');
}

async function validarCliente(dados, idIgnorado = null) {
    validarCamposObrigatorios(dados);
    if (!validarFormatoCpf(dados.cpf)) {
        throw new Error('Formato de CPF inválido. Use 00000000000 ou 000.000.000-00');
    }
    if (dados.email && !validarEmail(dados.email)) {
        throw new Error('Formato de e-mail inválido');
    }
    await validarCpfUnico(dados.cpf, idIgnorado);
    await validarEmailUnico(dados.email, idIgnorado);
}

function isConsumidorFinal(id) {
    return Number(id) === CONSUMIDOR_FINAL_ID;
}
 
// ── Funções de dados ──────────────────────────────────────────────────────────

async function listarTodos() {
    return Cliente.findAll({ order: [['id_cliente', 'ASC']] });
}

async function buscarPorId(id) {
    return Cliente.findByPk(id);
}

async function buscarPorCPF(cpf) {
    return Cliente.findOne({ where: { cpf: normalizarCpf(cpf) } });
}

async function buscarPorNome(nome) {
    return Cliente.findAll({ where: { nome: { [Op.iLike]: `%${nome}%` } }, order: [['id_cliente', 'ASC']] });
}

async function criar(dados) {
    await validarCliente(dados);
    return Cliente.create({
        nome:            dados.nome,
        cpf:             normalizarCpf(dados.cpf),
        telefone:        dados.telefone || null,
        email:           dados.email || null,
        data_nascimento: dados.data_nascimento || null,
        endereco:        dados.endereco || null,
    });
}

// PUT - exige objeto completo
async function atualizar(id, dados) {
    if (isConsumidorFinal(id)) throw new Error('Consumidor Final não pode ser editado');
    const cliente = await Cliente.findByPk(id);
    if (!cliente) return null;

    await validarCliente(dados, id);
    await cliente.update({
        nome:            dados.nome,
        cpf:             normalizarCpf(dados.cpf),
        telefone:        dados.telefone || null,
        email:           dados.email || null,
        data_nascimento: dados.data_nascimento || null,
        endereco:        dados.endereco || null,
    });
    return cliente;
}

// PATCH - atualiza parcialmente
async function atualizarParcial(id, dados) {
    if (isConsumidorFinal(id)) throw new Error('Consumidor Final não pode ser editado');
    const cliente = await Cliente.findByPk(id);
    if (!cliente) return null;

    if (dados.cpf && normalizarCpf(dados.cpf) !== cliente.cpf) {
        if (!validarFormatoCpf(dados.cpf)) throw new Error('Formato de CPF inválido. Use 00000000000 ou 000.000.000-00');
        await validarCpfUnico(dados.cpf, id);
        dados = { ...dados, cpf: normalizarCpf(dados.cpf) };
    }

    if (dados.email && dados.email !== cliente.email) {
        if (!validarEmail(dados.email)) throw new Error('Formato de e-mail inválido');
        await validarEmailUnico(dados.email, id);
    }

    await cliente.update(dados);
    return cliente;
}

async function remover(id) {
    if (isConsumidorFinal(id)) throw new Error('Consumidor Final não pode ser removido');
    const cliente = await Cliente.findByPk(id);
    if (!cliente) return false;
    try {
        await cliente.destroy();
    } catch (err) {
        if (err.name === 'SequelizeForeignKeyConstraintError') {
            throw new Error('Este cliente possui comandas vinculadas e não pode ser removido');
        }
        throw err;
    }
    return true;
}

module.exports = { Cliente, CONSUMIDOR_FINAL_ID, listarTodos, buscarPorNome, buscarPorId, buscarPorCPF, criar, atualizar, atualizarParcial, remover };
