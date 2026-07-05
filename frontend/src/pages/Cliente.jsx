import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'

const FORM_VAZIO = {
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    data_nascimento: '',
    endereco: '',
}

function Cliente() {
    const navigate = useNavigate()
    const { id } = useParams()
    const editando = !!id

    const [form, setForm] = useState(FORM_VAZIO)
    const [erro, setErro] = useState(null)
    const [salvando, setSalvando] = useState(false)

    useEffect(() => {
        if (editando) carregarCliente()
    }, [id])

    async function carregarCliente() {
        try {
            const res = await api.get(`/clientes/${id}`)
            const c = res.data
            setForm({
                nome:            c.nome || '',
                cpf:             formatarCpf(c.cpf),
                telefone:        c.telefone || '',
                email:           c.email || '',
                data_nascimento: c.data_nascimento || '',
                endereco:        c.endereco || '',
            })
        } catch {
            setErro('Erro ao carregar cliente')
        }
    }

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleSubmit() {
        setErro(null)
        setSalvando(true)
        try {
            if (editando) {
                await api.put(`/clientes/${id}`, form)
            } else {
                await api.post('/clientes', form)
            }
            navigate('/clientes')
        } catch (e) {
            setErro(e.response?.data?.erro || 'Erro ao salvar cliente')
        } finally {
            setSalvando(false)
        }
    }

    return (
        <div style={styles.container}>
            <Header voltarPara="/clientes" />

            <main style={styles.main}>
                <nav style={styles.breadcrumb}>
                    <span onClick={() => navigate('/')} style={styles.link}>Início</span> &gt;
                    <span onClick={() => navigate('/clientes')} style={styles.link}> Registros</span> &gt;
                    <strong> {editando ? 'Editar cliente' : 'Cadastrar novo cliente'}</strong>
                </nav>

                <div style={styles.form}>
                    <div style={styles.row}>
                        <div style={styles.campo}>
                            <label style={styles.label}>Nome</label>
                            <input style={styles.input} name="nome" value={form.nome} onChange={handleChange} placeholder="Digite aqui" />
                        </div>
                        <div style={styles.campo}>
                            <label style={styles.label}>CPF</label>
                            <input style={styles.input} name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.campo}>
                            <label style={styles.label}>Telefone</label>
                            <input style={styles.input} name="telefone" value={form.telefone} onChange={handleChange} placeholder="Digite aqui" />
                        </div>
                        <div style={styles.campo}>
                            <label style={styles.label}>Data de nascimento</label>
                            <input style={styles.input} name="data_nascimento" type="date" value={form.data_nascimento} onChange={handleChange} />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={{ ...styles.campo, flex: 2 }}>
                            <label style={styles.label}>Endereço</label>
                            <input style={styles.input} name="endereco" value={form.endereco} onChange={handleChange} placeholder="Digite aqui" />
                        </div>
                    </div>

                    {erro && <p style={styles.erroMsg}>{erro}</p>}

                    <div style={styles.acoes}>
                        <button style={styles.btnCancelar} onClick={() => navigate('/clientes')}>Cancelar</button>
                        <button style={styles.btnConfirmar} onClick={handleSubmit} disabled={salvando}>
                            {salvando ? 'Salvando...' : 'Confirmar'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}

function formatarCpf(cpf) {
    if (!cpf) return ''
    const s = cpf.replace(/\D/g, '')
    if (s.length !== 11) return cpf
    return `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6, 9)}-${s.slice(9)}`
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
    erroMsg: { color: '#e53935', fontSize: '14px', marginBottom: '12px' },
    acoes: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
    btnCancelar: { backgroundColor: '#fff', border: '1px solid #ddd', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer' },
    btnConfirmar: { backgroundColor: '#2d6a4f', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer' },
}

export default Cliente
