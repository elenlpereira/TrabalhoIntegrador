import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'

const CATEGORIAS = ['Todas', 'bebidas', 'alimentos', 'mercearia', 'outros']

function Estoque() {
    const navigate = useNavigate()
    const [produtos, setProdutos] = useState([])
    const [busca, setBusca] = useState('')
    const [categoria, setCategoria] = useState('Todas')
    const [erro, setErro] = useState(null)

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

    const produtosFiltrados = produtos.filter(p =>
        p.nome.toLowerCase().includes(busca.toLowerCase())
    )

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
                    <div style={styles.buscaRow}>
                        <input
                            style={styles.input}
                            placeholder="Pesquisar produtos"
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                        />
                    </div>

                    {erro && <p style={{ color: 'red' }}>{erro}</p>}

                    <table style={styles.tabela}>
                        <thead>
                            <tr>
                                {['Produto', 'Categoria', 'Estoque', 'Mínimo', 'Preço custo', 'Preço venda', ''].map(h => (
                                    <th key={h} style={styles.th}>{h}</th>
                                ))}
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
                                            <button style={styles.btnAcao}>🗑️</button>
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
    buscaRow: { marginBottom: '16px' },
    input: { width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' },
    tabela: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #ddd', fontSize: '13px', color: '#555' },
    td: { padding: '10px 12px', borderBottom: '1px solid #eee', fontSize: '14px' },
    tag: { backgroundColor: '#e53935', color: '#fff', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' },
    btnAcao: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
}

export default Estoque