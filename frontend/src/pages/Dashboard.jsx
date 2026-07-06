import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'

const INTERVALO_REFRESH = 30_000

function hojeLocal() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function inicioMes() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function Card({ titulo, valor, sub, cor, onClick }) {
    return (
        <div style={{ ...s.card, borderTop: `4px solid ${cor}`, cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
            <p style={s.cardTitulo}>{titulo}</p>
            <p style={{ ...s.cardValor, color: cor }}>{valor ?? '—'}</p>
            {sub && <p style={s.cardSub}>{sub}</p>}
        </div>
    )
}

function SecaoCards({ titulo, children }) {
    return (
        <section style={s.secao}>
            <h3 style={s.secaoTitulo}>{titulo}</h3>
            <div style={s.cardGrid}>{children}</div>
        </section>
    )
}

function SecaoTabela({ titulo, children }) {
    return (
        <section style={s.secao}>
            <h3 style={s.secaoTitulo}>{titulo}</h3>
            {children}
        </section>
    )
}

function Dashboard() {
    const navigate = useNavigate()
    const [dados, setDados] = useState(null)
    const [analise, setAnalise] = useState(null)
    const [erro, setErro] = useState(null)
    const [ultimaAtt, setUltimaAtt] = useState(null)
    const [periodo, setPeriodo] = useState({ inicio: inicioMes(), fim: hojeLocal() })
    const [carregandoAnalise, setCarregandoAnalise] = useState(false)

    const carregar = useCallback(async () => {
        try {
            const res = await api.get('/dashboard')
            setDados(res.data)
            setUltimaAtt(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
            setErro(null)
        } catch {
            setErro('Erro ao carregar dados do dashboard')
        }
    }, [])

    const carregarAnalise = useCallback(async (p = periodo) => {
        setCarregandoAnalise(true)
        try {
            const res = await api.get('/dashboard/analise', {
                params: { data_inicio: p.inicio, data_fim: p.fim },
            })
            setAnalise(res.data)
        } catch {
            setAnalise(null)
        } finally {
            setCarregandoAnalise(false)
        }
    }, [periodo])

    useEffect(() => {
        carregar()
        carregarAnalise()
        const timer = setInterval(carregar, INTERVALO_REFRESH)
        return () => clearInterval(timer)
    }, [])

    function handlePeriodoChange(e) {
        setPeriodo(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    function handleBuscarPeriodo(e) {
        e.preventDefault()
        carregarAnalise(periodo)
    }

    const c = dados?.cadastros
    const e = dados?.estoque
    const o = dados?.operacional
    const a = dados?.auditoria

    return (
        <div style={s.container}>
            <Header voltarPara="/" />

            <main style={s.main}>
                <div style={s.topRow}>
                    <h2 style={s.titulo}>Dashboard</h2>
                    <div style={s.attRow}>
                        {ultimaAtt && <span style={s.attTexto}>Atualizado às {ultimaAtt}</span>}
                        <button style={s.btnRefresh} onClick={() => { carregar(); carregarAnalise() }}>↻ Atualizar</button>
                    </div>
                </div>

                {erro && <p style={s.erro}>{erro}</p>}
                {!dados && !erro && <p style={s.carregando}>Carregando...</p>}

                {dados && (
                    <>
                        <SecaoCards titulo="Operacional — Hoje">
                            <Card titulo="Comandas abertas" valor={o?.comandas_abertas} sub="em andamento agora" cor="#2d6a4f" onClick={() => navigate('/consumo')} />
                            <Card titulo="Comandas fechadas hoje" valor={o?.comandas_fechadas_hoje} sub="pagas ou na ficha" cor="#1565c0" />
                            <Card titulo="Fichas pendentes" valor={o?.fichas_pendentes} sub="clientes em débito" cor={o?.fichas_pendentes > 0 ? '#c62828' : '#2d6a4f'} />
                            <Card titulo="Ações registradas hoje" valor={a?.acoes_hoje} sub="logs de auditoria" cor="#6a1b9a" onClick={() => navigate('/logs')} />
                        </SecaoCards>

                        <SecaoCards titulo="Estoque">
                            <Card titulo="Total de produtos" valor={c?.produtos} sub="cadastrados" cor="#37474f" onClick={() => navigate('/estoque')} />
                            <Card titulo="Estoque abaixo do mínimo" valor={e?.produtos_abaixo_minimo} sub={e?.produtos_abaixo_minimo > 0 ? 'atenção necessária' : 'tudo em ordem'} cor={e?.produtos_abaixo_minimo > 0 ? '#e65100' : '#2d6a4f'} onClick={() => navigate('/estoque')} />
                            <Card titulo="Total de compras" valor={o?.total_compras} sub="entradas registradas" cor="#37474f" />
                        </SecaoCards>

                        <SecaoCards titulo="Cadastros">
                            <Card titulo="Clientes" valor={c?.clientes} cor="#546e7a" onClick={() => navigate('/clientes')} />
                            <Card titulo="Fornecedores" valor={c?.fornecedores} cor="#546e7a" onClick={() => navigate('/fornecedores')} />
                            <Card titulo="Usuários do sistema" valor={c?.usuarios} cor="#546e7a" onClick={() => navigate('/usuarios')} />
                        </SecaoCards>
                    </>
                )}

                {/* ── Seções analíticas ─────────────────────────────────── */}

                {/* 1. Comandas abertas */}
                <SecaoTabela titulo="Comandas Abertas Agora">
                    {!analise ? <p style={s.carregando}>Carregando...</p> : analise.comandas_abertas.length === 0
                        ? <p style={s.vazio}>Nenhuma comanda aberta</p>
                        : (
                            <table style={s.tabela}>
                                <thead><tr>
                                    <th style={s.th}>#</th>
                                    <th style={s.th}>Identificação</th>
                                    <th style={s.th}>Abertura</th>
                                    <th style={s.th}>Total</th>
                                </tr></thead>
                                <tbody>
                                    {analise.comandas_abertas.map(c => (
                                        <tr key={c.id_comanda} style={s.tr}>
                                            <td style={s.td}>
                                                <button style={s.linkBtn} onClick={() => navigate(`/consumo/${c.id_comanda}`)}>#{c.id_comanda}</button>
                                            </td>
                                            <td style={s.td}>{c.identificacao || '—'}</td>
                                            <td style={s.td}>{new Date(c.data_hora_inicio).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                                            <td style={{ ...s.td, fontWeight: 600 }}>R$ {Number(c.valor_total).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                </SecaoTabela>

                {/* 2. Produtos abaixo do mínimo */}
                <SecaoTabela titulo="Produtos com Estoque Abaixo do Mínimo">
                    {!analise ? <p style={s.carregando}>Carregando...</p> : analise.estoque_abaixo_minimo.length === 0
                        ? <p style={s.vazio}>✓ Nenhum produto abaixo do mínimo</p>
                        : (
                            <table style={s.tabela}>
                                <thead><tr>
                                    <th style={s.th}>Produto</th>
                                    <th style={s.th}>Categoria</th>
                                    <th style={s.th}>Estoque atual</th>
                                    <th style={s.th}>Mínimo</th>
                                    <th style={s.th}>Preço custo</th>
                                    <th style={s.th}>Preço venda</th>
                                </tr></thead>
                                <tbody>
                                    {analise.estoque_abaixo_minimo.map(p => (
                                        <tr key={p.id_produto} style={{ ...s.tr, backgroundColor: '#fff8f8' }}>
                                            <td style={{ ...s.td, color: '#c62828', fontWeight: 500 }}>{p.nome}</td>
                                            <td style={s.td}>{p.categoria}</td>
                                            <td style={{ ...s.td, color: '#c62828', fontWeight: 600 }}>{p.quantidade_estoque}</td>
                                            <td style={s.td}>{p.estoque_minimo}</td>
                                            <td style={s.td}>R$ {Number(p.preco_custo).toFixed(2)}</td>
                                            <td style={s.td}>R$ {Number(p.preco_venda).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                </SecaoTabela>

                {/* Filtro de período */}
                <form style={s.periodoRow} onSubmit={handleBuscarPeriodo}>
                    <h3 style={{ ...s.secaoTitulo, margin: 0 }}>ANÁLISE — PERÍODO</h3>
                    <input style={s.inputData} type="date" name="inicio" value={periodo.inicio} onChange={handlePeriodoChange} />
                    <span style={{ color: '#888', fontSize: 13 }}>até</span>
                    <input style={s.inputData} type="date" name="fim" value={periodo.fim} onChange={handlePeriodoChange} />
                    <button type="submit" style={s.btnRefresh} disabled={carregandoAnalise}>
                        {carregandoAnalise ? 'Buscando...' : 'Aplicar'}
                    </button>
                </form>

                {/* 3. Relatório de vendas por produto */}
                <SecaoTabela titulo="Vendas por Produto">
                    {!analise ? <p style={s.carregando}>Carregando...</p> : analise.vendas_por_produto.length === 0
                        ? <p style={s.vazio}>Nenhuma venda no período</p>
                        : (
                            <table style={s.tabela}>
                                <thead><tr>
                                    <th style={s.th}>Produto</th>
                                    <th style={s.th}>Categoria</th>
                                    <th style={s.th}>Forma pagamento</th>
                                    <th style={s.th}>Qtd. vendida</th>
                                    <th style={s.th}>Faturamento</th>
                                </tr></thead>
                                <tbody>
                                    {analise.vendas_por_produto.map((v, i) => (
                                        <tr key={i} style={s.tr}>
                                            <td style={s.td}>{v.produto}</td>
                                            <td style={s.td}>{v.categoria}</td>
                                            <td style={s.td}>{v.forma_pagamento || '—'}</td>
                                            <td style={s.td}>{v.quantidade_vendida}</td>
                                            <td style={{ ...s.td, fontWeight: 600, color: '#2d6a4f' }}>R$ {Number(v.faturamento).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                                        <td colSpan={4} style={{ ...s.td, fontWeight: 600, textAlign: 'right' }}>Total</td>
                                        <td style={{ ...s.td, fontWeight: 700, color: '#2d6a4f' }}>
                                            R$ {analise.vendas_por_produto.reduce((acc, v) => acc + Number(v.faturamento), 0).toFixed(2)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                </SecaoTabela>

                {/* 4. Clientes com fiado */}
                <SecaoTabela titulo="Clientes com Fiado (A Receber)">
                    {!analise ? <p style={s.carregando}>Carregando...</p> : analise.clientes_fiado.length === 0
                        ? <p style={s.vazio}>Nenhum cliente com fiado pendente</p>
                        : (
                            <table style={s.tabela}>
                                <thead><tr>
                                    <th style={s.th}>Cliente</th>
                                    <th style={s.th}>Débitos</th>
                                    <th style={s.th}>Total a receber</th>
                                </tr></thead>
                                <tbody>
                                    {analise.clientes_fiado.map(cf => (
                                        <tr key={cf.id_cliente} style={s.tr}>
                                            <td style={s.td}>{cf.nome}</td>
                                            <td style={s.td}>{cf.total_dividas}</td>
                                            <td style={{ ...s.td, fontWeight: 600, color: '#c62828' }}>R$ {Number(cf.total_a_receber).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                </SecaoTabela>
            </main>
        </div>
    )
}

const s = {
    container: { minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' },
    main:  { flex: 1, padding: '24px' },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    titulo: { fontSize: '20px', fontWeight: '600', color: '#222', margin: 0 },
    attRow: { display: 'flex', alignItems: 'center', gap: '12px' },
    attTexto: { fontSize: '12px', color: '#888' },
    btnRefresh: { backgroundColor: '#fff', border: '1px solid #ddd', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
    erro: { color: '#e53935', marginBottom: '16px' },
    carregando: { color: '#888', fontSize: '14px' },
    vazio: { color: '#aaa', fontSize: '13px', padding: '8px 0' },
    secao: { marginBottom: '28px' },
    secaoTitulo: { fontSize: '13px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', borderBottom: '1px solid #ddd', paddingBottom: '6px' },
    cardGrid: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
    card: { backgroundColor: '#fff', borderRadius: '8px', padding: '16px 20px', minWidth: '160px', flex: '1 1 160px', maxWidth: '220px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
    cardTitulo: { fontSize: '12px', color: '#888', marginBottom: '8px', margin: 0 },
    cardValor: { fontSize: '32px', fontWeight: '700', margin: '6px 0 4px' },
    cardSub: { fontSize: '11px', color: '#aaa', margin: 0 },
    periodoRow: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', backgroundColor: '#fff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #ddd' },
    inputData: { padding: '6px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' },
    tabela: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
    th: { textAlign: 'left', padding: '10px 14px', borderBottom: '2px solid #eee', fontSize: '12px', color: '#555', backgroundColor: '#fafafa' },
    tr: { borderBottom: '1px solid #f0f0f0' },
    td: { padding: '9px 14px', fontSize: '13px' },
    linkBtn: { background: 'none', border: 'none', color: '#2d6a4f', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px', padding: 0 },
}

export default Dashboard
