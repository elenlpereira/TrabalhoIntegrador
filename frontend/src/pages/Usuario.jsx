import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import api from '../services/api'

const PERFIS = ['Atendente', 'Gerente']

const FORM_VAZIO = {
    nome: '',
    email: '',
    perfil_acesso: '',
    senha: '',
    confirmacaoSenha: '',
}

function Usuario() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { usuario: eu } = useAuth()
    const editando = !!id

    const [form, setForm] = useState(FORM_VAZIO)
    const [erro, setErro] = useState(null)
    const [salvando, setSalvando] = useState(false)

    useEffect(() => {
        if (editando) carregarUsuario()
    }, [id])

    async function carregarUsuario() {
        try {
            const res = await api.get(`/usuarios/${id}`)
            const u = res.data
            setForm({
                nome:             u.nome || '',
                email:            u.email || '',
                perfil_acesso:    u.perfil_acesso || '',
                senha:            '',
                confirmacaoSenha: '',
            })
        } catch {
            setErro('Erro ao carregar usuário')
        }
    }

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const editandoProprioUsuario = editando && Number(id) === eu?.id_usuario

    async function handleSubmit() {
        setErro(null)

        if (!form.nome.trim()) return setErro('Nome é obrigatório')
        if (!form.email.trim()) return setErro('E-mail é obrigatório')
        if (!editandoProprioUsuario && !form.perfil_acesso) return setErro('Perfil de acesso é obrigatório')
        if (!editando && !form.senha) return setErro('Senha é obrigatória')
        if (form.senha && form.senha !== form.confirmacaoSenha) return setErro('As senhas não coincidem')

        setSalvando(true)
        try {
            if (editando) {
                // PATCH: só envia senha se o campo foi preenchido
                const dados = {
                    nome:          form.nome,
                    email:         form.email,
                    perfil_acesso: form.perfil_acesso,
                }
                if (form.senha) {
                    dados.senha = form.senha
                    dados.confirmacaoSenha = form.confirmacaoSenha
                }
                await api.patch(`/usuarios/${id}`, dados)
            } else {
                await api.post('/usuarios', form)
            }
            navigate('/usuarios')
        } catch (e) {
            setErro(e.response?.data?.erro || 'Erro ao salvar usuário')
        } finally {
            setSalvando(false)
        }
    }

    return (
        <div style={styles.container}>
            <Header voltarPara="/usuarios" />

            <main style={styles.main}>
                <nav style={styles.breadcrumb}>
                    <span onClick={() => navigate('/')} style={styles.link}>Início</span> &gt;
                    <span onClick={() => navigate('/usuarios')} style={styles.link}> Usuários</span> &gt;
                    <strong> {editando ? 'Editar usuário' : 'Novo usuário'}</strong>
                </nav>

                <div style={styles.form}>
                    <div style={styles.row}>
                        <div style={styles.campo}>
                            <label style={styles.label}>Nome completo</label>
                            <input style={styles.input} name="nome" value={form.nome} onChange={handleChange} placeholder="Digite aqui" />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.campo}>
                            <label style={styles.label}>E-mail</label>
                            <input style={styles.input} name="email" type="email" value={form.email} onChange={handleChange} placeholder="usuario@email.com" />
                        </div>
                        <div style={styles.campo}>
                            <label style={styles.label}>Perfil de acesso</label>
                            <select
                                style={styles.input}
                                name="perfil_acesso"
                                value={form.perfil_acesso}
                                onChange={handleChange}
                                disabled={editandoProprioUsuario}
                            >
                                <option value="">Selecione</option>
                                {PERFIS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            {editandoProprioUsuario && (
                                <span style={styles.aviso}>Não é possível alterar o próprio perfil</span>
                            )}
                        </div>
                    </div>

                    <div style={styles.separador}>
                        <span style={styles.separadorTexto}>
                            {editando ? 'Nova senha (deixe em branco para manter a atual)' : 'Senha'}
                        </span>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.campo}>
                            <label style={styles.label}>Senha</label>
                            <input style={styles.input} name="senha" type="password" value={form.senha} onChange={handleChange} placeholder={editando ? '••••••' : 'Mínimo 6 caracteres'} />
                        </div>
                        <div style={styles.campo}>
                            <label style={styles.label}>Confirmação de senha</label>
                            <input style={styles.input} name="confirmacaoSenha" type="password" value={form.confirmacaoSenha} onChange={handleChange} placeholder="••••••" />
                        </div>
                    </div>

                    {erro && <p style={styles.erroMsg}>{erro}</p>}

                    <div style={styles.acoes}>
                        <button style={styles.btnCancelar} onClick={() => navigate('/usuarios')}>Cancelar</button>
                        <button style={styles.btnConfirmar} onClick={handleSubmit} disabled={salvando}>
                            {salvando ? 'Salvando...' : 'Confirmar'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}

const styles = {
    container: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
    main: { flex: 1, padding: '24px' },
    breadcrumb: { marginBottom: '24px', fontSize: '14px', color: '#555' },
    link: { cursor: 'pointer', color: '#2d6a4f' },
    form: { backgroundColor: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #ddd', maxWidth: '700px' },
    row: { display: 'flex', gap: '16px', marginBottom: '16px' },
    campo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', fontWeight: '500', color: '#333' },
    input: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' },
    aviso: { fontSize: '11px', color: '#888', fontStyle: 'italic' },
    separador: { borderTop: '1px solid #eee', margin: '8px 0 16px' },
    separadorTexto: { fontSize: '12px', color: '#888', backgroundColor: '#fff', padding: '0 8px', position: 'relative', top: '-10px' },
    erroMsg: { color: '#e53935', fontSize: '14px', marginBottom: '12px' },
    acoes: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
    btnCancelar: { backgroundColor: '#fff', border: '1px solid #ddd', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer' },
    btnConfirmar: { backgroundColor: '#2d6a4f', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer' },
}

export default Usuario
