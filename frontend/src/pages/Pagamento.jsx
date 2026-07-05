import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'

const FORMAS_VISTA  = ['dinheiro', 'pix', 'debito', 'credito']
const FORMAS_PRAZO  = ['prazo']
const FORMAS_TODAS  = [...FORMAS_VISTA, ...FORMAS_PRAZO]

// Consumidor Final não pode usar prazo
const CONSUMIDOR_FINAL_ID = 1

function Pagamento() {
    const navigate = useNavigate()
    const { id } = useParams() // id do pagamento

    const [pagamento, setPagamento] = useState(null)
    const [lancamentos, setLancamentos] = useState([{ forma: 'dinheiro', valor: '' }])
    const [erro, setErro] = useState(null)
    const [salvando, setSalvando] = useState(false)

    useEffect(() => {
        carregarPagamento()
    }, [])

    async function carregarPagamento() {
        try {
            const res = await api.get(`/pagamentos/${id}`)
            setPagamento(res.data)
        } catch {
            setErro('Erro ao carregar pagamento.')
        }
    }

    function adicionarLancamento() {
        setLancamentos([...lancamentos, { forma: 'dinheiro', valor: '' }])
    }

    function removerLancamento(idx) {
        setLancamentos(lancamentos.filter((_, i) => i !== idx))
    }

    function atualizarLancamento(idx, campo, valor) {
        setLancamentos(lancamentos.map((l, i) => i === idx ? { ...l, [campo]: valor } : l))
    }

    function formasDisponiveis() {
        const isConsumidorFinal = pagamento?.fk_cliente === CONSUMIDOR_FINAL_ID
        return isConsumidorFinal ? FORMAS_VISTA : FORMAS_TODAS
    }

    function totalLancamentos() {
        return lancamentos.reduce((soma, l) => soma + (parseFloat(l.valor) || 0), 0)
    }

    function calcularTroco() {
        const totalDinheiro = lancamentos
            .filter(l => l.forma === 'dinheiro')
            .reduce((s, l) => s + (parseFloat(l.valor) || 0), 0)
        const excedente = totalLancamentos() - (pagamento?.valor_total || 0)
        return excedente > 0 ? Math.min(excedente, totalDinheiro) : 0
    }

    async function handlePagar() {
        setErro(null)

        if (prazoSemCliente) {
            setErro('Pagamento a prazo requer um cliente cadastrado. Volte à comanda e vincule um cliente.')
            return
        }

        const lancamentosValidos = lancamentos.filter(l => l.valor && parseFloat(l.valor) > 0)

        if (lancamentosValidos.length === 0) {
            setErro('Adicione ao menos um lançamento com valor.')
            return
        }

        if (totalLancamentos() < (pagamento?.valor_total || 0)) {
            setErro(`Valor insuficiente. Faltam R$ ${((pagamento.valor_total || 0) - totalLancamentos()).toFixed(2)}.`)
            return
        }

        setSalvando(true)
        try {
            await api.post(`/pagamentos/${id}/pagar`, {
                lancamentos: lancamentosValidos.map(l => ({
                    forma: l.forma,
                    valor: parseFloat(l.valor),
                })),
            })
            navigate('/consumo', { state: { sucesso: 'Pagamento realizado com sucesso!' } })
        } catch (e) {
            setErro(e.response?.data?.erro || 'Erro ao registrar pagamento.')
        } finally {
            setSalvando(false)
        }
    }

    const totalPago   = totalLancamentos()
    const totalComanda = pagamento?.valor_total || 0
    const troco       = calcularTroco()
    const suficiente       = totalPago >= totalComanda
    const isConsumidorFinal = pagamento?.fk_cliente === CONSUMIDOR_FINAL_ID
    const temPrazo          = lancamentos.some(l => l.forma === 'prazo')
    const prazoSemCliente   = temPrazo && isConsumidorFinal

    return (
        <div style={s.page}>
            <Header voltarPara="/consumo" />

            <nav style={s.breadcrumb} aria-label="Caminho de navegação">
                <span style={s.breadcrumbItem} onClick={() => navigate('/consumo')}>Consumo</span>
                <span style={s.breadcrumbSep}>›</span>
                <span style={s.breadcrumbAtivo}>Pagamento</span>
            </nav>

            <main style={s.main}>
                {/* Resumo da comanda */}
                <section style={s.card} aria-label="Resumo do pagamento">
                    <h2 style={s.cardTitle}>Resumo</h2>

                    {erro && <p style={s.msgErro} role="alert">{erro}</p>}

                    {!pagamento ? (
                        <p style={s.muted}>Carregando...</p>
                    ) : (
                        <>
                            <div style={s.resumoGrid}>
                                <span style={s.resumoLabel}>Total da comanda</span>
                                <span style={s.resumoValor}>R$ {Number(totalComanda).toFixed(2)}</span>

                                <span style={s.resumoLabel}>Total lançado</span>
                                <span style={{
                                    ...s.resumoValor,
                                    color: suficiente ? '#3aa65b' : '#e6453c',
                                    fontWeight: 700,
                                }}>
                                    R$ {totalPago.toFixed(2)}
                                </span>

                                {troco > 0 && (
                                    <>
                                        <span style={s.resumoLabel}>Troco</span>
                                        <span style={{ ...s.resumoValor, color: '#b5651d', fontWeight: 700 }}>
                                            R$ {troco.toFixed(2)}
                                        </span>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </section>

                {/* Lançamentos */}
                <section style={s.card} aria-label="Formas de pagamento">
                    <div style={s.cardHeader}>
                        <h2 style={s.cardTitle}>Formas de pagamento</h2>
                        <button style={s.btnAdicionar} onClick={adicionarLancamento}>
                            + Adicionar
                        </button>
                    </div>

                    {prazoSemCliente && (
                        <p style={s.msgAviso} role="alert">
                            ⚠️ Pagamento a prazo requer cliente cadastrado. Volte à comanda e vincule um cliente.
                        </p>
                    )}

                    <div style={s.lancamentoList}>
                        {lancamentos.map((lanc, idx) => (
                            <div key={idx} style={s.lancamentoRow} aria-label={`Lançamento ${idx + 1}`}>
                                <select
                                    style={s.select}
                                    value={lanc.forma}
                                    onChange={e => atualizarLancamento(idx, 'forma', e.target.value)}
                                    aria-label="Forma de pagamento"
                                >
                                    {formasDisponiveis().map(f => (
                                        <option key={f} value={f}>
                                            {f.charAt(0).toUpperCase() + f.slice(1)}
                                        </option>
                                    ))}
                                </select>

                                <div style={s.inputValorWrap}>
                                    <span style={s.prefixo}>R$</span>
                                    <input
                                        style={s.inputValor}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0,00"
                                        value={lanc.valor}
                                        onChange={e => atualizarLancamento(idx, 'valor', e.target.value)}
                                        aria-label="Valor"
                                    />
                                </div>

                                {lancamentos.length > 1 && (
                                    <button
                                        style={s.btnRemover}
                                        onClick={() => removerLancamento(idx)}
                                        aria-label="Remover lançamento"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Ações */}
                <div style={s.actionsRow}>
                    <button style={s.btnCancelar} onClick={() => navigate('/consumo')}>
                        Cancelar
                    </button>
                    <button
                        style={{ ...s.btn, ...s.btnSolid, opacity: salvando ? 0.7 : 1 }}
                        onClick={handlePagar}
                        disabled={salvando || prazoSemCliente}
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
    page:           { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' },
    breadcrumb:     { background: '#ececec', borderBottom: '1px solid #d8d8d8', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px', fontSize: 13 },
    breadcrumbItem: { color: '#777', cursor: 'pointer' },
    breadcrumbSep:  { color: '#aaa' },
    breadcrumbAtivo:{ color: '#222', fontWeight: 700 },
    main:           { flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 540, width: '100%', margin: '0 auto' },
    card:           { background: '#fff', border: '1px solid #e4e4e4', borderRadius: 8, padding: 24 },
    cardHeader:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    cardTitle:      { fontSize: 16, fontWeight: 700, color: '#222', margin: 0 },
    resumoGrid:     { display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px 24px', alignItems: 'center' },
    resumoLabel:    { fontSize: 14, color: '#555' },
    resumoValor:    { fontSize: 14, color: '#222', textAlign: 'right' },
    lancamentoList: { display: 'flex', flexDirection: 'column', gap: 12 },
    lancamentoRow:  { display: 'flex', alignItems: 'center', gap: 10 },
    select:         { flex: 1, border: '1px solid #ccc', borderRadius: 5, padding: '9px 10px', fontSize: 13, background: '#fafafa', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' },
    inputValorWrap: { display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: 5, background: '#fafafa', overflow: 'hidden', flex: 1 },
    prefixo:        { padding: '9px 8px', fontSize: 13, color: '#888', borderRight: '1px solid #eee' },
    inputValor:     { border: 'none', outline: 'none', padding: '9px 10px', fontSize: 13, background: 'transparent', width: '100%', fontFamily: 'inherit' },
    btnAdicionar:   { fontSize: 12, fontWeight: 700, color: '#3aa65b', background: 'none', border: '1px solid #3aa65b', borderRadius: 12, padding: '5px 14px', cursor: 'pointer' },
    btnRemover:     { border: 'none', background: 'none', color: '#e6453c', cursor: 'pointer', fontSize: 16, padding: '0 4px', fontWeight: 700 },
    actionsRow:     { display: 'flex', justifyContent: 'flex-end', gap: 12 },
    btnCancelar:    { padding: '10px 24px', borderRadius: 16, fontWeight: 700, fontSize: 13, cursor: 'pointer', border: '1.5px solid #ccc', background: '#fff', color: '#555' },
    btn:            { padding: '10px 24px', borderRadius: 16, fontWeight: 700, fontSize: 13, cursor: 'pointer', border: '1.5px solid #3aa65b', background: '#fff', color: '#3aa65b' },
    btnSolid:       { background: '#3aa65b', color: '#fff' },
    msgErro:        { color: '#e6453c', fontSize: 13, marginBottom: 14 },
    msgAviso:       { color: '#b5651d', background: '#fff8f0', border: '1px solid #f5c97a', borderRadius: 6, padding: '10px 14px', fontSize: 13, marginBottom: 14 },
    muted:          { color: '#999', fontSize: 13 },
    footer:         { padding: '8px 20px', textAlign: 'right', fontSize: 12, borderTop: '1px solid #e8e8e8', background: '#fff' },
    footerLink:     { color: '#2f6fed', textDecoration: 'none' },
}

export default Pagamento