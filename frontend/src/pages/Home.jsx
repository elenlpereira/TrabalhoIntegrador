import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'

function Home() {
    const navigate = useNavigate()
    const { usuario } = useAuth()
    const isGerente = usuario?.perfil_acesso === 'Gerente'

    const modulos = [
        { nome: 'Consumo',       caminho: '/consumo' },
        { nome: 'Estoque',       caminho: '/estoque' },
        { nome: 'Fornecedores',  caminho: '/fornecedores' },
        { nome: 'Clientes',      caminho: '/clientes' },
        ...(isGerente ? [
            { nome: 'Fornecedores', caminho: '/fornecedores' },
            { nome: 'Usuários',     caminho: '/usuarios' },
            { nome: 'Compra',       caminho: '/compras' },
        ] : [])
    ]

    return (
        <div style={styles.container}>
            <Header />

            <main style={styles.main}>
                <div style={styles.grid}>
                    {modulos.map(m => (
                        <button
                            key={m.nome}
                            style={styles.card}
                            onClick={() => navigate(m.caminho)}
                        >
                            {m.nome}
                        </button>
                    ))}
                </div>
                <p style={styles.dica}>Selecione um módulo para começar.</p>
            </main>
        </div>
    )
}

const styles = {
    container: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
    main: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' },
    grid: { display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' },
    card: { width: '140px', height: '120px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: '500' },
    dica: { color: '#888', fontSize: '14px' },
}

export default Home