import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'

function Compra() {
    const navigate = useNavigate()

    const [form, setForm] = useState({
        fk_produto: '',
        fk_fornecedor: '',
        quantidade: '',
        custo_unitario: '',
        data_recebimento: new Date().toISOString().split('T')[0],
        fk_nota_fiscal: '',
    })
    const [produtos, setProdutos] = useState([])
    const [fornecedores, setFornecedores] = useState([])
    const [buscaProduto, setBuscaProduto] = useState('')
    const [buscaFornecedor, setBuscaFornecedor] = useState('')
    const [erro, setErro] = useState(null)
    const [salvando, setSalvando] = useState(false)

    useEffect(() => {
        async function carregar() {
            try {
                const [resProd, resForn] = await Promise.all([
                    api.get('/produtos'),
                    api.get('/fornecedores'),
                ])
                setProdutos(resProd.data.produtos)
                setFornecedores(resForn.data.fornecedores)
            } catch {
                setErro('Erro ao carregar dados')
            }
        }
        carregar()
    }, [])

    const [confirmar, setConfirmar] = useState(false)

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleSubmit() {
        setErro(null)
        setSalvando(true)
        setConfirmar(false)
        try {
            await api.post('/compras', form)
            navigate('/estoque')
        } catch (e) {
            setErro(e.response?.data?.erro || 'Erro ao registrar compra')
        } finally {
            setSalvando(false)
        }
    }

    const totalEstimado = form.quantidade && form.custo_unitario
        ? (Number(form.quantidade) * Number(form.custo_unitario)).toFixed(2)
        : '0.00'

    return (
        <div style={styles.container}>
            <Header voltarPara="/" />

            <main style={styles.main}>
                <nav style={styles.breadcrumb}>
                    <span onClick={() => navigate('/')} style={styles.link}>Início</span> &gt;
                    <strong> Nova compra</strong>
                </nav>

                <div style={styles.form}>
                    <div style={styles.row}>
                        <div style={styles.campo}>
                            <label style={styles.label}>Produto *</label>
                            <select style={styles.input} name="fk_produto" value={form.fk_produto} onChange={handleChange}>
                                <option value="">Selecione o produto</option>
                                {produtos.map(p => (
                                    <option key={p.id_produto} value={p.id_produto}>
                                        {p.nome} (estoque: {p.quantidade_estoque})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={styles.campo}>
                            <label style={styles.label}>Fornecedor *</label>
                            <select style={styles.input} name="fk_fornecedor" value={form.fk_fornecedor} onChange={handleChange}>
                                <option value="">Selecione o fornecedor</option>
                                {fornecedores.map(f => (
                                    <option key={f.id_fornecedor} value={f.id_fornecedor}>{f.razao_social}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.campo}>
                            <label style={styles.label}>Quantidade *</label>
                            <input style={styles.input} name="quantidade" type="number" min="1" value={form.quantidade} onChange={handleChange} />
                        </div>
                        <div style={styles.campo}>
                            <label style={styles.label}>Custo unitário (R$) *</label>
                            <input style={styles.input} name="custo_unitario" type="number" step="0.01" min="0" value={form.custo_unitario} onChange={handleChange} />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.campo}>
                            <label style={styles.label}>Data de recebimento *</label>
                            <input style={styles.input} name="data_recebimento" type="date" value={form.data_recebimento} onChange={handleChange} />
                        </div>
                        <div style={styles.campo}>
                            <label style={styles.label}>Nota fiscal (opcional)</label>
                            <input style={styles.input} name="fk_nota_fiscal" type="number" value={form.fk_nota_fiscal} onChange={handleChange} placeholder="Número da nota" />
                        </div>
                    </div>

                    <div style={styles.totalBox}>
                        <span style={styles.totalLabel}>Total estimado:</span>
                        <span style={styles.totalValor}>R$ {totalEstimado}</span>
                    </div>

                    {erro && <p style={styles.erro}>{erro}</p>}

                    <div style={styles.acoes}>
                        <button style={styles.btnVerEstoque} onClick={() => navigate('/estoque')}>Ver estoque</button>
                        <button style={styles.btnCancelar} onClick={() => navigate('/')}>Cancelar</button>
                        <button style={styles.btnConfirmar} onClick={() => setConfirmar(true)} disabled={salvando}>
                            {salvando ? 'Registrando...' : 'Confirmar compra'}
                        </button>
                    </div>
                </div>
            </main>

            {confirmar && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3 style={styles.modalTitulo}>Confirmar compra</h3>
                        <p style={styles.modalTexto}>
                            Registrar entrada de <strong>{form.quantidade} unidade(s)</strong> no estoque?<br />
                            Total estimado: <strong>R$ {totalEstimado}</strong>
                        </p>
                        <div style={styles.modalAcoes}>
                            <button style={styles.btnCancelar} onClick={() => setConfirmar(false)}>Cancelar</button>
                            <button style={styles.btnConfirmar} onClick={handleSubmit} disabled={salvando}>
                                {salvando ? 'Registrando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
    totalBox: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', padding: '12px 0', borderTop: '1px solid #eee', marginBottom: '12px' },
    totalLabel: { fontSize: '14px', color: '#555' },
    totalValor: { fontSize: '18px', fontWeight: 'bold', color: '#2d6a4f' },
    erro: { color: '#e53935', fontSize: '14px', marginBottom: '12px' },
    acoes: { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
    btnVerEstoque: { backgroundColor: '#fff', border: '1px solid #2d6a4f', color: '#2d6a4f', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginRight: 'auto' },
    btnCancelar: { backgroundColor: '#fff', border: '1px solid #ddd', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer' },
    btnConfirmar: { backgroundColor: '#2d6a4f', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer' },
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
    modal: { backgroundColor: '#fff', borderRadius: '8px', padding: '28px 32px', maxWidth: '400px', width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
    modalTitulo: { fontSize: '16px', fontWeight: '600', marginBottom: '12px' },
    modalTexto: { fontSize: '14px', color: '#444', marginBottom: '20px', lineHeight: '1.6' },
    modalAcoes: { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
}

export default Compra