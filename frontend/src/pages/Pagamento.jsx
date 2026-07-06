import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'

const FORMAS_VISTA  = ['dinheiro', 'pix', 'debito', 'credito']
const CONSUMIDOR_FINAL_ID = 1

function Pagamento() {
    const navigate   = useNavigate()
    const { id }     = useParams() // id da comanda

    const [comanda,       setComanda]       = useState(null)
    const [formaPagamento, setFormaPagamento] = useState('dinheiro')
    const [erro,          setErro]          = useState(null)
    const [salvando,      setSalvando]      = useState(false)
    const [clientes,      setClientes]      = useState([])
    const [buscaCliente,  setBuscaCliente]  = useState('')
    const [vinculando,    setVinculando]    = useState(false)

    useEffect(() => {
        carregarComanda()
    }, [])

    async function buscarClientes(termo) {
        if (!termo || termo.length < 2) { setClientes([]); return }
        try {
            const res = await api.get('/clientes', { params: { nome: termo } })
            // filtra consumidor final
            setClientes((res.data.clientes || []).filter(c => c.id_cliente !== CONSUMIDOR_FINAL_ID))
        } catch {
            setClientes([])
        }
    }

    async function vincularCliente(cliente) {
        setVinculando(true)
        try {
            await api.patch(`/comandas/${id}`, { fk_cliente: cliente.id_cliente })
            setBuscaCliente('')
            setClientes([])
            await carregarComanda()
        } catch (e) {
            setErro(e.response?.data?.erro || 'Erro ao vincular cliente.')
        } finally {
            setVinculando(false)
        }
    }

    async function carregarComanda() {
        try {
            const res = await api.get(`/comandas/${id}`)
            setComanda(res.data)
        } catch {
            setErro('Erro ao carregar comanda. Verifique a conexão com o servidor.')
        }
    }

    const isConsumidorFinal = comanda?.fk_cliente === CONSUMIDOR_FINAL_ID
    const formasDisponiveis = [...FORMAS_VISTA, 'ficha']
    const tentouPrazoSemCliente = formaPagamento === 'ficha' && isConsumidorFinal

    async function handleConfirmar() {
        setErro(null)
        setSalvando(true)
        try {
            await api.post(`/comandas/${id}/fechar`, {
                forma_pagamento: formaPagamento,
            })
            navigate('/consumo', { state: { sucesso: 'Pagamento realizado com sucesso!' } })
        } catch (e) {
            setErro(e.response?.data?.erro || 'Erro ao registrar pagamento.')
        } finally {
            setSalvando(false)
        }
    }

    const itens = comanda?.consumos || []

    return (
        <div style={s.page}>
            <Header voltarPara={`/consumo/${id}`} />

            <nav style={s.breadcrumb} aria-label="Caminho de navegação">
                <span style={s.breadcrumbItem} onClick={() => navigate('/consumo')}>Consumo</span>
                <span style={s.breadcrumbSep}>›</span>
                <span style={s.breadcrumbItem} onClick={() => navigate(`/consumo/${id}`)}>
                    {comanda?.info_cliente || `#${id}`}
                </span>
                <span style={s.breadcrumbSep}>›</span>
                <span style={s.breadcrumbAtivo}>Pagamento</span>
            </nav>

            <main style={s.main}>

                {/* Resumo dos itens */}
                <section style={s.card} aria-label="Resumo da comanda">
                    <h2 style={s.cardTitle}>Resumo da comanda</h2>

                    {erro && <p style={s.msgErro} role="alert">{erro}</p>}

                    {!comanda ? (
                        <p style={s.muted}>Carregando...</p>
                    ) : (
                        <>
                            <table style={s.table}>
                                <thead>
                                    <tr>
                                        <th style={s.th}>Produto</th>
                                        <th style={s.th}>Qtd.</th>
                                        <th style={s.th}>Preço unit.</th>
                                        <th style={s.th}>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itens.length === 0 && (
                                        <tr>
                                            <td colSpan={4} style={{ ...s.td, color: '#999', textAlign: 'center' }}>
                                                Nenhum item na comanda
                                            </td>
                                        </tr>
                                    )}
                                    {itens.map(item => (
                                        <tr key={item.id_consumo}>
                                            <td style={s.td}>{item.Produto?.nome || `Produto #${item.fk_produto}`}</td>
                                            <td style={s.td}>{item.quantidade}</td>
                                            <td style={s.td}>R$ {Number(item.Produto?.preco_venda || 0).toFixed(2)}</td>
                                            <td style={s.td}>R$ {(item.quantidade * Number(item.Produto?.preco_venda || 0)).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div style={s.totalRow}>
                                <span style={s.totalLabel}>Total</span>
                                <span style={s.totalValor}>R$ {Number(comanda.valor_total || 0).toFixed(2)}</span>
                            </div>
                        </>
                    )}
                </section>

                {/* Forma de pagamento */}
                <section style={s.card} aria-label="Forma de pagamento">
                    <h2 style={s.cardTitle}>Forma de pagamento</h2>

                    {tentouPrazoSemCliente && (
                        <div style={s.vincularBox} aria-label="Vincular cliente">
                            <p style={s.msgAviso}>
                                ⚠️ Pagamento a prazo requer um cliente cadastrado. Busque e selecione um cliente abaixo.
                            </p>
                            <label style={s.fieldLabel} htmlFor="busca-cliente">Buscar cliente</label>
                            <input
                                id="busca-cliente"
                                style={s.inputBusca}
                                placeholder="Digite o nome do cliente..."
                                value={buscaCliente}
                                onChange={e => { setBuscaCliente(e.target.value); buscarClientes(e.target.value) }}
                                autoFocus
                            />
                            {clientes.length > 0 && (
                                <ul style={s.clienteList} role="listbox">
                                    {clientes.map(c => (
                                        <li
                                            key={c.id_cliente}
                                            style={s.clienteItem}
                                            onClick={() => !vinculando && vincularCliente(c)}
                                            role="option"
                                            aria-selected={false}
                                        >
                                            <span style={s.clienteNome}>{c.nome}</span>
                                            <span style={s.clienteCpf}>{c.cpf}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {buscaCliente.length >= 2 && clientes.length === 0 && (
                                <p style={s.muted}>Nenhum cliente encontrado.</p>
                            )}
                        </div>
                    )}

                    <div style={s.formasGrid}>
                        {formasDisponiveis.map(forma => (
                            <button
                                key={forma}
                                style={{
                                    ...s.formaBtn,
                                    ...(formaPagamento === forma ? s.formaBtnAtivo : {}),
                                }}
                                onClick={() => setFormaPagamento(forma)}
                                aria-pressed={formaPagamento === forma}
                            >
                                {forma === 'ficha' ? 'A prazo' : forma.charAt(0).toUpperCase() + forma.slice(1)}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Ações */}
                <div style={s.actionsRow}>
                    <button style={s.btnCancelar} onClick={() => navigate(`/consumo/${id}`)}>
                        Voltar
                    </button>
                    <button
                        style={{ ...s.btn, ...s.btnSolid, opacity: salvando ? 0.7 : 1 }}
                        onClick={handleConfirmar}
                        disabled={salvando || itens.length === 0 || tentouPrazoSemCliente}
                    >
                        {salvando ? 'Registrando...' : 'Confirmar pagamento'}
                    </button>
                </div>
            </main>

            <footer style={s.footer}>
                <a href="#" style={s.footerLink}>Contate-nos</a>
            </footer>
        </div>
    )
}

const s = {
    page:            { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' },
    breadcrumb:      { background: '#ececec', borderBottom: '1px solid #d8d8d8', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px', fontSize: 13 },
    breadcrumbItem:  { color: '#777', cursor: 'pointer' },
    breadcrumbSep:   { color: '#aaa' },
    breadcrumbAtivo: { color: '#222', fontWeight: 700 },
    main:            { flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 620, width: '100%', margin: '0 auto' },
    card:            { background: '#fff', border: '1px solid #e4e4e4', borderRadius: 8, padding: 24 },
    cardTitle:       { fontSize: 16, fontWeight: 700, color: '#222', marginBottom: 16 },
    table:           { width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 12 },
    th:              { textAlign: 'left', background: '#eeeeee', color: '#555', fontWeight: 700, padding: '8px 12px' },
    td:              { padding: '8px 12px', borderTop: '1px solid #eee', color: '#333' },
    totalRow:        { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, paddingTop: 12, borderTop: '2px solid #e4e4e4' },
    totalLabel:      { fontSize: 14, fontWeight: 600, color: '#555' },
    totalValor:      { fontSize: 18, fontWeight: 700, color: '#3aa65b' },
    formasGrid:      { display: 'flex', gap: 12, flexWrap: 'wrap' },
    formaBtn:        { padding: '10px 22px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1.5px solid #ccc', background: '#fff', color: '#555', transition: 'all 0.15s' },
    formaBtnAtivo:   { borderColor: '#3aa65b', background: '#eafaf1', color: '#3aa65b' },
    actionsRow:      { display: 'flex', justifyContent: 'flex-end', gap: 12 },
    btnCancelar:     { padding: '10px 24px', borderRadius: 16, fontWeight: 700, fontSize: 13, cursor: 'pointer', border: '1.5px solid #ccc', background: '#fff', color: '#555' },
    btn:             { padding: '10px 24px', borderRadius: 16, fontWeight: 700, fontSize: 13, cursor: 'pointer', border: '1.5px solid #3aa65b', background: '#fff', color: '#3aa65b' },
    btnSolid:        { background: '#3aa65b', color: '#fff' },
    msgErro:         { color: '#e6453c', fontSize: 13, marginBottom: 14 },
    msgAviso:        { color: '#b5651d', background: '#fff8f0', border: '1px solid #f5c97a', borderRadius: 6, padding: '10px 14px', fontSize: 13, marginBottom: 16 },
    muted:           { color: '#999', fontSize: 13 },
    vincularBox:     { marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 },
    fieldLabel:      { fontSize: 13, fontWeight: 600, color: '#333' },
    inputBusca:      { border: '1px solid #ccc', borderRadius: 5, padding: '9px 12px', fontSize: 13, background: '#fafafa', outline: 'none', fontFamily: 'inherit' },
    clienteList:     { listStyle: 'none', border: '1px solid #e4e4e4', borderRadius: 5, overflow: 'hidden', margin: 0, padding: 0 },
    clienteItem:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', cursor: 'pointer', borderTop: '1px solid #f0f0f0', background: '#fff', transition: 'background 0.1s' },
    clienteNome:     { fontSize: 13, color: '#333', fontWeight: 600 },
    clienteCpf:      { fontSize: 12, color: '#999' },
    footer:          { padding: '8px 20px', textAlign: 'right', fontSize: 12, borderTop: '1px solid #e8e8e8', background: '#fff' },
    footerLink:      { color: '#2f6fed', textDecoration: 'none' },
}

export default Pagamento