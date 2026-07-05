import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'

const CATEGORIAS = ['bebidas', 'alimentos', 'mercearia', 'outros']

const FORM_VAZIO = {
    razao_social: '',
    cnpj: '',
    telefone: '',
    email: '',
    categoria_produtos: '',
    endereco: '',
}

function Fornecedor() {
    const navigate = useNavigate()
    const { id } = useParams()
    const editando = !!id

    const [form, setForm] = useState(FORM_VAZIO)
    const [erro, setErro] = useState(null)
    const [salvando, setSalvando] = useState(false)

    useEffect(() => {
        if (editando) carregarFornecedor()
    }, [id])

    async function carregarFornecedor() {
        try {
            const res = await api.get(`/fornecedores/${id}`)
            const f = res.data
            setForm({
                razao_social:       f.razao_social || '',
                cnpj:               formatarCnpj(f.cnpj),
                telefone:           f.telefone || '',
                email:              f.email || '',
                categoria_produtos: f.categoria_produtos || '',
                endereco:           f.endereco || '',
            })
        } catch {
            setErro('Erro ao carregar fornecedor')
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
                await api.put(`/fornecedores/${id}`, form)
            } else {
                await api.post('/fornecedores', form)
            }
            navigate('/fornecedores')
        } catch (e) {
            setErro(e.response?.data?.erro || 'Erro ao salvar fornecedor')
        } finally {
            setSalvando(false)
        }
    }

    return (
        <div style={styles.container}>
            <Header voltarPara="/fornecedores" />

            <main style={styles.main}>
                <nav style={styles.breadcrumb}>
                    <span onClick={() => navigate('/')} style={styles.link}>Início</span> &gt;
                    <span onClick={() => navigate('/fornecedores')} style={styles.link}> Fornecedores</span> &gt;
                    <strong> {editando ? 'Editar fornecedor' : 'Cadastrar novo fornecedor'}</strong>
                </nav>

                <div style={styles.form}>
                    <div style={styles.row}>
                        <div style={styles.campo}>
                            <label style={styles.label}>Razão social</label>
                            <input style={styles.input} name="razao_social" value={form.razao_social} onChange={handleChange} placeholder="Digite aqui" />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.campo}>
                            <label style={styles.label}>CNPJ</label>
                            <input style={styles.input} name="cnpj" value={form.cnpj} onChange={handleChange} placeholder="00.000.000/0000-00" />
                        </div>
                        <div style={styles.campo}>
                            <label style={styles.label}>Telefone de contato</label>
                            <input style={styles.input} name="telefone" value={form.telefone} onChange={handleChange} placeholder="Digite aqui" />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.campo}>
                            <label style={styles.label}>E-mail do vendedor</label>
                            <input style={styles.input} name="email" type="email" value={form.email} onChange={handleChange} placeholder="Digite aqui" />
                        </div>
                        <div style={styles.campo}>
                            <label style={styles.label}>Categoria de produtos fornecidos</label>
                            <select style={styles.input} name="categoria_produtos" value={form.categoria_produtos} onChange={handleChange}>
                                <option value="">Selecione a categoria</option>
                                {CATEGORIAS.map(c => (
                                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.campo}>
                            <label style={styles.label}>Endereço</label>
                            <input style={styles.input} name="endereco" value={form.endereco} onChange={handleChange} placeholder="Digite aqui" />
                        </div>
                    </div>

                    {erro && <p style={styles.erroMsg}>{erro}</p>}

                    <div style={styles.acoes}>
                        <button style={styles.btnCancelar} onClick={() => navigate('/fornecedores')}>Cancelar</button>
                        <button style={styles.btnConfirmar} onClick={handleSubmit} disabled={salvando}>
                            {salvando ? 'Salvando...' : 'Confirmar'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}

function formatarCnpj(cnpj) {
    if (!cnpj) return ''
    const s = cnpj.replace(/\D/g, '')
    if (s.length !== 14) return cnpj
    return `${s.slice(0,2)}.${s.slice(2,5)}.${s.slice(5,8)}/${s.slice(8,12)}-${s.slice(12)}`
}

const styles = {
    container: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', backgroundColor: '#fff', borderBottom: '1px solid #ddd' },
    logo: { fontWeight: 'bold', fontSize: '18px' },
    headerRight: { display: 'flex', gap: '8px' },
    btnVoltar: { backgroundColor: '#555', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' },
    btnSair: { backgroundColor: '#e53935', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' },
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

export default Fornecedor
