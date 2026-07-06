import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'

const FORMAS_PAGAMENTO = [
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'pix',      label: 'Pix' },
    { value: 'credito',  label: 'Crédito' },
    { value: 'debito',   label: 'Débito' },
]

function Debitos() {
    const navigate = useNavigate()

    const [clientes,       setClientes]       = useState([])
    const [busca,          setBusca]          = useState('')
    const [carregando,     setCarregando]      = useState(true)
    const [erro,           setErro]            = useState(null)

    // Modal de detalhe / quitação
    const [clienteSel,     setClienteSel]      = useState(null)   // { id_cliente, nome, ... }
    const [fichas,         setFichas]          = useState([])
    const [saldoTotal,     setSaldoTotal]      = useState(0)
    const [carregandoFicha, setCarregandoFicha] = useState(false)

    // Pagamento
    const [formaPag,       setFormaPag]        = useState('dinheiro')
    const [valorPag,       setValorPag]        = useState('')
    const [pagando,        setPagando]         = useState(false)
    const [erroModal,      setErroModal]       = useState(null)
    const [sucessoModal,   setSucessoModal]    = useState(null)

    // ── Carrega lista resumida ──────────────────────────────────────────────
    const carregarDebitos = useCallback(async () => {
        setCarregando(true)
        setErro(null)
        try {
            // GET /api/fichas  → retorna todas as dívidas
            const res = await api.get('/fichas', { params: { status: undefined } })
            const todasFichas = res.data.fichas || []

            // Agrupa por cliente, soma saldo pendente
            const mapa = {}
            for (const f of todasFichas) {
                if (f.status === 'pago') continue
                if (!mapa[f.fk_cliente]) {
                    mapa[f.fk_cliente] = { id_cliente: f.fk_cliente, nome: null, saldo: 0 }
                }
                mapa[f.fk_cliente].saldo += Number(f.saldo)
            }

            // Busca nomes dos clientes
            const clientesRes = await api.get('/clientes')
            const clientesMap = {}
            for (const c of (clientesRes.data.clientes || [])) {
                clientesMap[c.id_cliente] = c.nome
            }

            const lista = Object.values(mapa)
                .map(item => ({ ...item, nome: clientesMap[item.id_cliente] || `Cliente #${item.id_cliente}` }))
                .filter(item => item.saldo > 0)
                .sort((a, b) => b.saldo - a.saldo)

            setClientes(lista)
        } catch {
            setErro('Erro ao carregar débitos. Verifique a conexão com o servidor.')
        } finally {
            setCarregando(false)
        }
    }, [])

    useEffect(() => { carregarDebitos() }, [carregarDebitos])

    // ── Filtro por nome ou id ───────────────────────────────────────────────
    const clientesFiltrados = clientes.filter(c => {
        if (!busca.trim()) return true
        const termo = busca.toLowerCase()
        return (
            c.nome.toLowerCase().includes(termo) ||
            String(c.id_cliente).includes(termo)
        )
    })

    // ── Abre detalhe de um cliente ──────────────────────────────────────────
    async function abrirCliente(cliente) {
        setClienteSel(cliente)
        setErroModal(null)
        setSucessoModal(null)
        setValorPag('')
        setFormaPag('dinheiro')
        setCarregandoFicha(true)
        try {
            const res = await api.get(`/fichas/${cliente.id_cliente}`)
            setFichas(res.data.fichas || [])
            setSaldoTotal(Number(res.data.saldo_total || 0))
        } catch {
            setErroModal('Erro ao carregar detalhes da ficha.')
        } finally {
            setCarregandoFicha(false)
        }
    }

    function fecharModal() {
        setClienteSel(null)
        setFichas([])
        setSaldoTotal(0)
        setErroModal(null)
        setSucessoModal(null)
    }

    // ── Confirma pagamento ──────────────────────────────────────────────────
    async function handlePagar() {
        setErroModal(null)
        setSucessoModal(null)
        const valor = parseFloat(valorPag)
        if (!valor || valor <= 0) {
            setErroModal('Informe um valor maior que zero.')
            return
        }
        if (valor > saldoTotal + 0.001) {
            setErroModal(`O valor não pode ser maior que o saldo devedor (R$ ${saldoTotal.toFixed(2)}).`)
            return
        }
        setPagando(true)
        try {
            const res = await api.post(`/fichas/${clienteSel.id_cliente}/quitar`, {
                valor,
                forma_pagamento: formaPag,
            })
            const { valor_pago, troco, saldo_restante } = res.data
            setSucessoModal(
                `Pagamento de R$ ${Number(valor_pago).toFixed(2)} registrado!` +
                (troco > 0 ? ` Troco: R$ ${Number(troco).toFixed(2)}.` : '') +
                (saldo_restante > 0 ? ` Saldo restante: R$ ${Number(saldo_restante).toFixed(2)}.` : ' Ficha quitada!')
            )
            setValorPag('')
            // Recarrega detalhes da ficha
            const det = await api.get(`/fichas/${clienteSel.id_cliente}`)
            setFichas(det.data.fichas || [])
            setSaldoTotal(Number(det.data.saldo_total || 0))
            // Atualiza lista principal
            await carregarDebitos()
        } catch (e) {
            setErroModal(e.response?.data?.erro || 'Erro ao registrar pagamento.')
        } finally {
            setPagando(false)
        }
    }

    function quitar100() {
        setValorPag(saldoTotal.toFixed(2))
    }

    // ── STATUS badge ────────────────────────────────────────────────────────
    function badgeStatus(status) {
        const cores = {
            pendente:    { bg: '#fff3cd', color: '#856404', label: 'Pendente' },
            pago_parcial:{ bg: '#cce5ff', color: '#004085', label: 'Parcial' },
            pago:        { bg: '#d4edda', color: '#155724', label: 'Pago' },
        }
        const c = cores[status] || { bg: '#eee', color: '#555', label: status }
        return (
            <span style={{ ...s.badge, background: c.bg, color: c.color }}>
                {c.label}
            </span>
        )
    }

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <div style={s.page}>
            <Header voltarPara="/" />

            <nav style={s.breadcrumb}>
                <span style={s.bcItem} onClick={() => navigate('/')}>Início</span>
                <span style={s.bcSep}>›</span>
                <span style={s.bcAtivo}>Débitos</span>
            </nav>

            <main style={s.main}>
                <div style={s.topBar}>
                    <h1 style={s.titulo}>Débitos de clientes</h1>
                    <button style={s.btnAtualizar} onClick={carregarDebitos} disabled={carregando}>
                        {carregando ? 'Atualizando...' : '↻ Atualizar'}
                    </button>
                </div>

                <div style={s.buscaRow}>
                    <input
                        style={s.inputBusca}
                        placeholder="Buscar por nome ou ID do cliente"
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                    />
                </div>

                {erro && <p style={s.msgErro}>{erro}</p>}

                {carregando ? (
                    <p style={s.muted}>Carregando...</p>
                ) : clientesFiltrados.length === 0 ? (
                    <div style={s.vazio}>
                        <span style={s.vazioBig}>{busca ? '🔍' : '✓'}</span>
                        <p style={s.vazioTxt}>
                            {busca
                                ? `Nenhum cliente encontrado para "${busca}".`
                                : 'Nenhum cliente com débito pendente.'
                            }
                        </p>
                    </div>
                ) : (
                    <div style={s.listaWrap}>
                        <div style={s.listaHeader}>
                            <span>Cliente</span>
                            <span style={{ textAlign: 'right' }}>Saldo devedor</span>
                        </div>
                        {clientesFiltrados.map(c => (
                            <div
                                key={c.id_cliente}
                                style={s.clienteRow}
                                onClick={() => abrirCliente(c)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={e => e.key === 'Enter' && abrirCliente(c)}
                            >
                                <div style={s.clienteInfo}>
                                    <span style={s.clienteNome}>{c.nome}</span>
                                    <span style={s.clienteId}>#{c.id_cliente}</span>
                                </div>
                                <div style={s.clienteDir}>
                                    <span style={s.saldoValor}>R$ {c.saldo.toFixed(2)}</span>
                                    <span style={s.verDetalhes}>Ver detalhes →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* ── Modal de detalhe ── */}
            {clienteSel && (
                <div style={s.overlay} onClick={fecharModal}>
                    <div style={s.modal} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">

                        {/* Cabeçalho do modal */}
                        <div style={s.modalHeader}>
                            <div>
                                <h2 style={s.modalTitulo}>{clienteSel.nome}</h2>
                                <p style={s.modalSubtitulo}>#{clienteSel.id_cliente} · Ficha de débitos</p>
                            </div>
                            <button style={s.btnFechar} onClick={fecharModal} aria-label="Fechar">✕</button>
                        </div>

                        {erroModal  && <p style={s.msgErro}>{erroModal}</p>}
                        {sucessoModal && <p style={s.msgSucesso}>{sucessoModal}</p>}

                        {carregandoFicha ? (
                            <p style={s.muted}>Carregando ficha...</p>
                        ) : (
                            <>
                                {/* Tabela de lançamentos */}
                                <div style={s.tabelaWrap}>
                                    <table style={s.table}>
                                        <thead>
                                            <tr>
                                                <th style={s.th}>Data</th>
                                                <th style={s.th}>Comanda</th>
                                                <th style={s.th}>Débito</th>
                                                <th style={s.th}>Pago</th>
                                                <th style={s.th}>Saldo</th>
                                                <th style={s.th}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fichas.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} style={{ ...s.td, textAlign: 'center', color: '#999' }}>
                                                        Nenhum lançamento encontrado.
                                                    </td>
                                                </tr>
                                            )}
                                            {fichas.map(f => (
                                                <tr key={f.id_divida}>
                                                    <td style={s.td}>{f.data}</td>
                                                    <td style={s.td}>{f.fk_comanda ? `#${f.fk_comanda}` : '—'}</td>
                                                    <td style={s.td}>R$ {Number(f.debito).toFixed(2)}</td>
                                                    <td style={s.td}>R$ {Number(f.credito).toFixed(2)}</td>
                                                    <td style={{ ...s.td, fontWeight: f.status !== 'pago' ? 700 : 400, color: f.status !== 'pago' ? '#c0392b' : '#27ae60' }}>
                                                        R$ {Number(f.saldo).toFixed(2)}
                                                    </td>
                                                    <td style={s.td}>{badgeStatus(f.status)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Resumo do saldo */}
                                <div style={s.saldoBox}>
                                    <span style={s.saldoLabel}>Saldo devedor total</span>
                                    <span style={s.saldoGrande}>R$ {saldoTotal.toFixed(2)}</span>
                                </div>

                                {saldoTotal > 0 && (
                                    <div style={s.pagBox}>
                                        <h3 style={s.pagTitulo}>Registrar pagamento</h3>

                                        {/* Forma de pagamento */}
                                        <label style={s.fieldLabel}>Forma de pagamento</label>
                                        <div style={s.formasGrid}>
                                            {FORMAS_PAGAMENTO.map(fp => (
                                                <button
                                                    key={fp.value}
                                                    style={{
                                                        ...s.formaBtn,
                                                        ...(formaPag === fp.value ? s.formaBtnAtivo : {}),
                                                    }}
                                                    onClick={() => setFormaPag(fp.value)}
                                                    aria-pressed={formaPag === fp.value}
                                                >
                                                    {fp.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Valor */}
                                        <label style={s.fieldLabel} htmlFor="valor-pag">Valor a pagar</label>
                                        <div style={s.inputRow}>
                                            <div style={s.inputPrefix}>R$</div>
                                            <input
                                                id="valor-pag"
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                max={saldoTotal}
                                                style={s.inputValor}
                                                value={valorPag}
                                                onChange={e => setValorPag(e.target.value)}
                                                placeholder="0,00"
                                            />
                                            <button style={s.btnTotal} onClick={quitar100}>
                                                Quitar tudo
                                            </button>
                                        </div>

                                        <div style={s.acoes}>
                                            <button style={s.btnCancelar} onClick={fecharModal}>
                                                Cancelar
                                            </button>
                                            <button
                                                style={{ ...s.btnConfirmar, opacity: pagando ? 0.7 : 1 }}
                                                onClick={handlePagar}
                                                disabled={pagando}
                                            >
                                                {pagando ? 'Registrando...' : 'Confirmar pagamento'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {saldoTotal <= 0 && (
                                    <p style={{ ...s.muted, textAlign: 'center', marginTop: 16 }}>
                                        ✅ Este cliente não possui saldo devedor.
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Estilos ────────────────────────────────────────────────────────────────
const s = {
    page:         { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' },
    breadcrumb:   { background: '#ececec', borderBottom: '1px solid #d8d8d8', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px', fontSize: 13 },
    bcItem:       { color: '#777', cursor: 'pointer' },
    bcSep:        { color: '#aaa' },
    bcAtivo:      { color: '#222', fontWeight: 700 },
    main:         { flex: 1, padding: '24px 20px', maxWidth: 720, width: '100%', margin: '0 auto' },
    topBar:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    titulo:       { fontSize: 20, fontWeight: 700, color: '#222', margin: 0 },
    btnAtualizar: { padding: '8px 18px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', color: '#555', fontSize: 13, cursor: 'pointer', fontWeight: 600 },
    buscaRow:     { marginBottom: 16 },
    inputBusca:   { width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', background: '#fff' },
    msgErro:      { color: '#c0392b', background: '#fdecea', border: '1px solid #f5c6c2', borderRadius: 6, padding: '10px 14px', fontSize: 13, marginBottom: 14 },
    msgSucesso:   { color: '#155724', background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: 6, padding: '10px 14px', fontSize: 13, marginBottom: 14 },
    muted:        { color: '#999', fontSize: 13 },
    vazio:        { textAlign: 'center', padding: '60px 0', color: '#aaa' },
    vazioBig:     { fontSize: 48, display: 'block', marginBottom: 12, color: '#3aa65b' },
    vazioTxt:     { fontSize: 15, color: '#888', margin: 0 },
    listaWrap:    { background: '#fff', border: '1px solid #e4e4e4', borderRadius: 8, overflow: 'hidden' },
    listaHeader:  { display: 'flex', justifyContent: 'space-between', padding: '10px 20px', background: '#f0f0f0', fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' },
    clienteRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid #f0f0f0', cursor: 'pointer', transition: 'background 0.1s' },
    clienteInfo:  { display: 'flex', flexDirection: 'column', gap: 2 },
    clienteNome:  { fontSize: 14, fontWeight: 600, color: '#222' },
    clienteId:    { fontSize: 11, color: '#aaa', fontFamily: 'monospace' },
    clienteDir:   { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 },
    saldoValor:   { fontSize: 16, fontWeight: 700, color: '#c0392b' },
    verDetalhes:  { fontSize: 12, color: '#3aa65b' },

    // Modal
    overlay:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 },
    modal:        { background: '#fff', borderRadius: 10, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', gap: 0 },
    modalHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 24px 16px', borderBottom: '1px solid #eee' },
    modalTitulo:  { fontSize: 18, fontWeight: 700, color: '#222', margin: 0 },
    modalSubtitulo:{ fontSize: 13, color: '#888', margin: '2px 0 0' },
    btnFechar:    { background: 'none', border: 'none', fontSize: 18, color: '#aaa', cursor: 'pointer', padding: 4, lineHeight: 1 },
    tabelaWrap:   { overflowX: 'auto', padding: '0 24px' },
    table:        { width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 16 },
    th:           { textAlign: 'left', background: '#f5f5f5', color: '#555', fontWeight: 700, padding: '8px 10px', borderBottom: '1px solid #e4e4e4' },
    td:           { padding: '9px 10px', borderTop: '1px solid #f0f0f0', color: '#333', fontSize: 13 },
    badge:        { padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 },
    saldoBox:     { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, padding: '16px 24px', borderTop: '2px solid #eee', marginTop: 8 },
    saldoLabel:   { fontSize: 14, fontWeight: 600, color: '#555' },
    saldoGrande:  { fontSize: 22, fontWeight: 700, color: '#c0392b' },

    // Pagamento
    pagBox:       { padding: '16px 24px 24px', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: 12 },
    pagTitulo:    { fontSize: 15, fontWeight: 700, color: '#222', margin: '0 0 4px' },
    fieldLabel:   { fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 2 },
    formasGrid:   { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
    formaBtn:     { padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1.5px solid #ccc', background: '#fff', color: '#555' },
    formaBtnAtivo:{ borderColor: '#3aa65b', background: '#eafaf1', color: '#3aa65b' },
    inputRow:     { display: 'flex', alignItems: 'center', gap: 8 },
    inputPrefix:  { fontSize: 14, fontWeight: 600, color: '#555' },
    inputValor:   { flex: 1, border: '1px solid #ccc', borderRadius: 5, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none' },
    btnTotal:     { padding: '10px 16px', borderRadius: 6, border: '1px solid #3aa65b', background: '#eafaf1', color: '#3aa65b', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
    acoes:        { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 },
    btnCancelar:  { padding: '10px 22px', borderRadius: 16, border: '1.5px solid #ccc', background: '#fff', color: '#555', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
    btnConfirmar: { padding: '10px 24px', borderRadius: 16, border: 'none', background: '#3aa65b', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
}

export default Debitos