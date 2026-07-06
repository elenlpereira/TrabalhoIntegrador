import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'

function EditarComanda() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { state } = useLocation()
    const voltarPara = state?.from || '/consumo'
    const nova = !id

    const [comanda, setComanda] = useState(null)
    const [produtos, setProdutos] = useState([])
    const [busca, setBusca] = useState('')
    const [erro, setErro] = useState(null)
    const [salvando, setSalvando] = useState(false)

    useEffect(() => {
        carregarProdutos()
        if (!nova) carregarComanda()
        else criarComanda()
    }, [])

    async function criarComanda() {
        try {
            const res = await api.post('/comandas', {})
            setComanda(res.data)
            navigate(`/consumo/${res.data.id_comanda}`, { replace: true })
        } catch {
            setErro('Erro ao criar comanda')
        }
    }

    async function carregarComanda() {
        try {
            const res = await api.get(`/comandas/${id}`)
            setComanda(res.data)
        } catch {
            setErro('Erro ao carregar comanda')
        }
    }

    async function carregarProdutos() {
        try {
            const res = await api.get('/produtos')
            setProdutos(res.data.produtos)
        } catch {
            setErro('Erro ao carregar produtos')
        }
    }

    function quantidadeNaComanda(produtoId) {
        if (!comanda?.consumos) return 0
        const item = comanda.consumos.find(c => c.fk_produto === produtoId)
        return item ? item.quantidade : 0
    }

    async function alterarQuantidade(produto, delta) {
        const qtdAtual = quantidadeNaComanda(produto.id_produto)
        const novaQtd = qtdAtual + delta
        if (novaQtd < 0) return

        try {
            const consumoExistente = comanda.consumos?.find(c => c.fk_produto === produto.id_produto)

            if (novaQtd === 0 && consumoExistente) {
                await api.delete(`/comandas/${comanda.id_comanda}/consumos/${consumoExistente.id_consumo}`)
            } else if (consumoExistente) {
                await api.patch(`/comandas/${comanda.id_comanda}/consumos/${consumoExistente.id_consumo}`, { quantidade: novaQtd })
            } else {
                await api.post(`/comandas/${comanda.id_comanda}/consumos`, { fk_produto: produto.id_produto, quantidade: novaQtd })
            }
            await carregarComanda()
        } catch (e) {
            setErro(e.response?.data?.erro || 'Erro ao atualizar item')
        }
    }

    async function confirmar() {
        setSalvando(true)
        try {
            await api.patch(`/comandas/${comanda.id_comanda}`, {})
            navigate('/consumo')
        } catch (e) {
            setErro(e.response?.data?.erro || 'Erro ao confirmar comanda')
        } finally {
            setSalvando(false)
        }
    }

    async function deletar() {
        if (!confirm('Deletar esta comanda?')) return
        try {
            await api.delete(`/comandas/${comanda.id_comanda}`)
            navigate('/consumo')
        } catch (e) {
            setErro(e.response?.data?.erro || 'Erro ao deletar comanda')
        }
    }

    const produtosFiltrados = produtos.filter(p =>
        p.nome.toLowerCase().includes(busca.toLowerCase())
    )

    const nomeComanda = comanda?.identificacao || (comanda ? `#${comanda.id_comanda}` : '...')
    const comandaInativa = comanda && comanda.status !== 'aberta'

    // Calcula o total somando quantidade × preço de venda de cada item na comanda
    const totalComanda = (comanda?.consumos || []).reduce((soma, consumo) => {
        const produto = produtos.find(p => p.id_produto === consumo.fk_produto)
        return soma + (produto ? consumo.quantidade * parseFloat(produto.preco_venda) : 0)
    }, 0)

    return (
        <div style={s.container}>
            <Header voltarPara={voltarPara} />

            {comandaInativa && (
                <div style={s.bannerInativo}>
                    <strong>Comanda {comanda.status}</strong> — esta comanda não pode ser alterada.
                    {comanda.status === 'cancelada' && ' Foi cancelada e seus itens foram devolvidos ao estoque.'}
                    {comanda.status === 'fechada'   && ' O pagamento já foi registrado.'}
                </div>
            )}

            <div style={s.breadcrumb}>
                <span style={s.logoChip}>logo</span>
                <span style={s.crumb} onClick={() => navigate('/consumo')}>Consumo</span>
                <span style={s.crumbAltering}>Alterando</span>
                <span style={s.crumbActive}>{nomeComanda}</span>
            </div>

            <div style={s.body}>
                <main style={s.main}>
                    <div style={s.fieldLabel}>Pesquisar produtos</div>
                    <div style={s.searchBox}>
                        <input
                            style={s.searchInput}
                            placeholder="Digite aqui"
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                        />
                    </div>

                    {erro && <p style={{ color: '#e6453c', fontSize: 13, marginBottom: 12 }}>{erro}</p>}

                    <div style={s.tableWrap}>
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    <th style={s.th}>Produto</th>
                                    <th style={s.th}>Qtd.</th>
                                    <th style={s.th}>Preço unit.</th>
                                    <th style={s.th}>Subtotal</th>
                                    <th style={s.th}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {produtosFiltrados.map(p => {
                                    const qtd = quantidadeNaComanda(p.id_produto)
                                    return (
                                        <tr key={p.id_produto} style={qtd > 0 ? s.trAtivo : {}}>
                                            <td style={s.td}>{p.nome}</td>
                                            <td style={s.td}>{qtd}</td>
                                            <td style={s.td}>R$ {parseFloat(p.preco_venda).toFixed(2)}</td>
                                            <td style={s.td}>
                                                {qtd > 0 ? `R$ ${(qtd * parseFloat(p.preco_venda)).toFixed(2)}` : '—'}
                                            </td>
                                            <td style={{ ...s.td, textAlign: 'right' }}>
                                                <button style={s.iconBtn} onClick={() => alterarQuantidade(p, -1)}>−</button>
                                                <button style={s.iconBtn} onClick={() => alterarQuantidade(p, +1)}>+</button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div style={s.totalRow}>
                        <span style={s.totalLabel}>Total da comanda:</span>
                        <span style={s.totalValor}>R$ {totalComanda.toFixed(2)}</span>
                    </div>

                    <div style={s.actionsRow}>
                        <button style={s.btn} onClick={deletar}>DELETAR</button>
                        <button style={s.btn} onClick={() => navigate('/consumo')}>CANCELAR</button>
                        <button style={s.btn} onClick={() => navigate(`/pagamento/${comanda?.id_comanda}`)}>PAGAMENTO</button>
                        <button style={{ ...s.btn, ...s.btnSolid }} onClick={confirmar} disabled={salvando}>
                            {salvando ? 'SALVANDO...' : 'CONFIRMAR'}
                        </button>
                    </div>
                </main>
            </div>

            <div style={s.footer}><a href="#" style={s.footerLink}>Contate-nos</a></div>
        </div>
    )
}

const s = {
    container: { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' },
    bannerInativo: { backgroundColor: '#fff3cd', borderBottom: '1px solid #ffc107', padding: '10px 20px', fontSize: 13, color: '#856404' },
    topbar: { background: '#1f1f1f', color: '#e6e6e6', display: 'flex', alignItems: 'center', gap: 18, padding: '12px 20px', fontSize: 14 },
    tbName: { fontWeight: 700 },
    tbSpacer: { flex: 1 },
    pillVoltar: { padding: '6px 16px', borderRadius: 14, fontSize: 11, fontWeight: 700, background: '#3aa65b', color: '#fff', border: 'none', cursor: 'pointer' },
    pillSair: { padding: '6px 16px', borderRadius: 14, fontSize: 11, fontWeight: 700, background: '#e6453c', color: '#fff', border: 'none', cursor: 'pointer' },
    breadcrumb: { background: '#ececec', borderBottom: '1px solid #d8d8d8', display: 'flex', alignItems: 'center', gap: 16, padding: '9px 20px', fontSize: 13 },
    logoChip: { background: '#cfcfcf', color: '#6b6b6b', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 3 },
    crumb: { color: '#777', cursor: 'pointer' },
    crumbAltering: { color: '#b5651d', fontWeight: 700 },
    crumbActive: { color: '#222', fontWeight: 700 },
    body: { flex: 1, display: 'flex' },
    main: { flex: 1, padding: '22px 26px', display: 'flex', flexDirection: 'column' },
    fieldLabel: { fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 },
    searchBox: { marginBottom: 18 },
    searchInput: { width: '100%', border: '1px solid #ccc', borderRadius: 5, padding: '9px 14px', background: '#fafafa', fontSize: 13, outline: 'none' },
    tableWrap: { flex: 1, border: '1px solid #e4e4e4', borderRadius: 4, overflow: 'auto', marginBottom: 18 },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
    th: { textAlign: 'left', background: '#eeeeee', color: '#555', fontWeight: 700, padding: '9px 14px' },
    td: { padding: '9px 14px', borderTop: '1px solid #eee', color: '#333' },
    trAtivo: { background: '#eafaf1' },
    iconBtn: { border: 'none', background: 'none', color: '#3aa65b', cursor: 'pointer', fontSize: 18, fontWeight: 700, padding: '0 6px' },
    totalRow:   { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: '2px solid #e4e4e4', marginBottom: 12 },
    totalLabel: { fontSize: 14, fontWeight: 600, color: '#555' },
    totalValor: { fontSize: 16, fontWeight: 700, color: '#3aa65b' },
    actionsRow: { display: 'flex', justifyContent: 'flex-end', gap: 12 },
    btn: { display: 'inline-block', padding: '9px 24px', borderRadius: 16, fontWeight: 700, fontSize: 12, cursor: 'pointer', textDecoration: 'none', border: '1.5px solid #3aa65b', background: '#fff', color: '#3aa65b' },
    btnSolid: { background: '#3aa65b', color: '#fff' },
    footer: { padding: '8px 20px', textAlign: 'right', fontSize: 12 },
    footerLink: { color: '#2f6fed', textDecoration: 'none' },
}

export default EditarComanda