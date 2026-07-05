import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'

const CATEGORIAS = ['bebidas', 'alimentos', 'mercearia', 'outros']

function Produto() {
    const navigate = useNavigate()
    const { id } = useParams()
    const editando = !!id

    const [form, setForm] = useState({
        nome: '',
        categoria: '',
        quantidade_estoque: 0,
        estoque_minimo: 0,
        preco_custo: '',
        preco_venda: '',
    })
    const [erro, setErro] = useState(null)
    const [salvando, setSalvando] = useState(false)

    useEffect(() => {
        if (editando) carregarProduto()
    }, [id])

    async function carregarProduto() {
        try {
            const res = await api.get(`/produtos/${id}`)
            setForm(res.data)
        } catch {
            setErro('Erro ao carregar produto')
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
                await api.put(`/produtos/${id}`, form)
            } else {
                await api.post('/produtos', form)
            }
            navigate('/estoque')
        } catch (e) {
            setErro(e.response?.data?.erro || 'Erro ao salvar produto')
        } finally {
            setSalvando(false)
        }
    }

    return (
        <div style={styles.container}>
            <Header voltarPara="/estoque" />

            <main style={styles.main}>
                <nav style={styles.breadcrumb}>
                    <span onClick={() => navigate('/')} style={styles.link}>Início</span> &gt;
                    <span onClick={() => navigate('/estoque')} style={styles.link}> Estoque</span> &gt;
                    <strong> {editando ? 'Editar produto' : 'Cadastrar novo produto'}</strong>
                </nav>

                <div style={styles.form}>
                    <div style={styles.row}>
                        <div style={styles.campo}>
                            <label style={styles.label}>Nome do produto</label>
                            <input style={styles.input} name="nome" value={form.nome} onChange={handleChange} placeholder="Digite aqui" />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.campo}>
                            <label style={styles.label}>Categoria</label>
                            <select style={styles.input} name="categoria" value={form.categoria} onChange={handleChange}>
                                <option value="">Selecione a categoria</option>
                                {CATEGORIAS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                            </select>
                        </div>
                        <div style={styles.campo}>
                            <label style={styles.label}>Quantidade em estoque</label>
                            <input style={styles.input} name="quantidade_estoque" type="number" value={form.quantidade_estoque} onChange={handleChange} />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.campo}>
                            <label style={styles.label}>Estoque mínimo</label>
                            <input style={styles.input} name="estoque_minimo" type="number" value={form.estoque_minimo} onChange={handleChange} />
                        </div>
                        <div style={styles.campo}>
                            <label style={styles.label}>Preço de custo</label>
                            <input style={styles.input} name="preco_custo" type="number" step="0.01" value={form.preco_custo} onChange={handleChange} placeholder="R$ 0,00" />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.campo}>
                            <label style={styles.label}>Preço de venda</label>
                            <input style={styles.input} name="preco_venda" type="number" step="0.01" value={form.preco_venda} onChange={handleChange} placeholder="R$ 0,00" />
                        </div>
                    </div>

                    {erro && <p style={styles.erro}>{erro}</p>}

                    <div style={styles.acoes}>
                        <button style={styles.btnCancelar} onClick={() => navigate('/estoque')}>Cancelar</button>
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
    erro: { color: '#e53935', fontSize: '14px', marginBottom: '12px' },
    acoes: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
    btnCancelar: { backgroundColor: '#fff', border: '1px solid #ddd', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer' },
    btnConfirmar: { backgroundColor: '#2d6a4f', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer' },
}

export default Produto