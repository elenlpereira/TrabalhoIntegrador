import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'
import { useOrdenacao, Th } from '../hooks/useOrdenacao.jsx'

const CATEGORIAS = ['Todas', 'bebidas', 'alimentos', 'mercearia', 'outros']

function Estoque() {
    const navigate = useNavigate()
    const [produtos, setProdutos] = useState([])
    const [busca, setBusca] = useState('')
    const [categoria, setCategoria] = useState('Todas')
    const [apenasEstoqueBaixo, setApenasEstoqueBaixo] = useState(false)
    const { coluna, direcao, alternar, ordenar } = useOrdenacao()
    const [erro, setErro] = useState(null)
    const [removendo, setRemovendo] = useState(null)

    useEffect(() => {
        carregarProdutos()
    }, [categoria])

    async function carregarProdutos() {
        try {
            const params = {}
            if (categoria !== 'Todas') params.categoria = categoria
            const res = await api.get('/produtos', { params })
            setProdutos(res.data.produtos)
        } catch (e) {
            setErro('Erro ao carregar produtos')
        }
    }

    async function removerProduto(id) {
        if (!window.confirm('Deseja remover este produto do estoque?')) return
        setRemovendo(id)
        try {
            await api.delete(`/produtos/${id}`)
            setProdutos(prev => prev.filter(p => p.id_produto !== id))
        } catch (e) {
            setErro(e.response?.data?.erro || 'Erro ao remover produto')
        } finally {
            setRemovendo(null)
        }
    }

    let produtosFiltrados = produtos.filter(p =>
        p.nome.toLowerCase().includes(busca.toLowerCase())
    )
    if (apenasEstoqueBaixo) {
        produtosFiltrados = produtosFiltrados.filter(p => p.quantidade_estoque <= p.estoque_minimo)
    }
    produtosFiltrados = ordenar(produtosFiltrados)

    return (
        <div style={styles.container}>
            <Header voltarPara="/" />

            <div style={styles.body}>
                <aside style={styles.sidebar}>
                    <button style={styles.btnNovo} onClick={() => navigate('/estoque/novo')}>
                        Novo produto
                    </button>
                    <p style={styles.sidebarTitulo}>CATEGORIAS</p>
                    {CATEGORIAS.map(c => (
                        <button
                            key={c}
                            style={{ ...styles.sidebarItem, fontWeight: categoria === c ? 'bold' : 'normal' }}
                            onClick={() => setCategoria(c)}
                        >
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                        </button>
                    ))}
                </aside>

                <main style={styles.main}>
                    <div style={styles.filtrosRow}>
                        <input
                            style={{ ...styles.input, flex: 2 }}
                            placeholder="Pesquisar produtos por nome"
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                        />
                        <label style={styles.checkLabel}>
                            <input
                                type="checkbox"
                                checked={apenasEstoqueBaixo}
                                onChange={e => setApenasEstoqueBaixo(e.target.checked)}
                                style={{ marginRight: 6 }}
                            />
                            Apenas estoque baixo
                        </label>
                    </div>

                    {erro && <p style={{ color: 'red' }}>{erro}</p>}

                    <table style={styles.tabela}>
                        <thead>
                            <tr>
                                <Th label="Produto"      col="nome"               coluna={coluna} direcao={direcao} onSort={alternar} />
                                <Th label="Categoria"    col="categoria"          coluna={coluna} direcao={direcao} onSort={alternar} />
                                <Th label="Estoque"      col="quantidade_estoque" coluna={coluna} direcao={direcao} onSort={alternar} />
                                <Th label="Mínimo"       col="estoque_minimo"     coluna={coluna} direcao={direcao} onSort={alternar} />
                                <Th label="Preço custo"  col="preco_custo"        coluna={coluna} direcao={direcao} onSort={alternar} />
                                <Th label="Preço venda"  col="preco_venda"        coluna={coluna} direcao={direcao} onSort={alternar} />
                                <th style={styles.th}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {produtosFiltrados.map(p => {
                                const abaixoMinimo = p.quantidade_estoque < p.estoque_minimo
                                return (
                                    <tr key={p.id_produto} style={{ backgroundColor: abaixoMinimo ? '#fff3f3' : '#fff' }}>
                                        <td style={styles.td}>
                                            {p.nome}
                                            {abaixoMinimo && <span style={styles.tag}> Estoque baixo</span>}
                                        </td>
                                        <td style={styles.td}>{p.categoria}</td>
                                        <td style={styles.td}>{p.quantidade_estoque}</td>
                                        <td style={styles.td}>{p.estoque_minimo}</td>
                                        <td style={styles.td}>R$ {Number(p.preco_custo).toFixed(2)}</td>
                                        <td style={styles.td}>R$ {Number(p.preco_venda).toFixed(2)}</td>
                                        <td style={styles.td}>
                                            <button style={styles.btnAcao} onClick={() => navigate(`/estoque/${p.id_produto}`)}>✏️</button>
                                            <button
                                                style={styles.btnAcao}
                                                onClick={() => removerProduto(p.id_produto)}
                                                disabled={removendo === p.id_produto}
                                                title="Remover"
                                            >🗑️</button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </main>
            </div>
        </div>
    )
}

const styles = {
    container: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
    body: { display: 'flex', flex: 1 },
    sidebar: { width: '160px', backgroundColor: '#fff', borderRight: '1px solid #ddd', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' },
    btnNovo: { backgroundColor: '#2d6a4f', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', marginBottom: '8px' },
    sidebarTitulo: { fontSize: '11px', color: '#888', marginTop: '8px' },
    sidebarItem: { background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: '4px 0', fontSize: '14px' },
    main: { flex: 1, padding: '24px' },
    filtrosRow: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' },
    checkLabel: { display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' },
    buscaRow: { marginBottom: '16px' },
    input: { width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' },
    tabela: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #ddd', fontSize: '13px', color: '#555' },
    td: { padding: '10px 12px', borderBottom: '1px solid #eee', fontSize: '14px' },
    tag: { backgroundColor: '#e53935', color: '#fff', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' },
    btnAcao: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
}

export default Estoque