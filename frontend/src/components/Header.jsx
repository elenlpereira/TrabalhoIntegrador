import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Header({ voltarPara }) {
    const navigate = useNavigate()
    const { usuario, logout } = useAuth()

    function handleLogout() {
        logout()
        navigate('/login')
    }

    return (
        <header style={styles.header}>
            <div style={styles.esquerda}>
                <span style={styles.barName}>Bar Pereira</span>
                <span style={styles.separador}>—</span>
                <span style={styles.nome}>{usuario?.nome}</span>
                {usuario?.perfil_acesso && (
                    <span style={styles.perfil}>{usuario.perfil_acesso}</span>
                )}
            </div>
            <div style={styles.direita}>
                {voltarPara && (
                    <button style={styles.btnVoltar} onClick={() => navigate(voltarPara)}>
                        Voltar
                    </button>
                )}
                <button style={styles.btnSair} onClick={handleLogout}>
                    Sair
                </button>
            </div>
        </header>
    )
}

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 24px',
        backgroundColor: '#1a1a1a',
        color: '#fff',
    },
    esquerda: { display: 'flex', alignItems: 'center', gap: '10px' },
    barName: { fontWeight: 'bold', fontSize: '15px', color: '#fff' },
    separador: { color: '#666', fontSize: '14px' },
    nome: { fontWeight: '400', fontSize: '14px', color: '#ddd' },
    perfil: { color: '#aaa', fontSize: '13px' },
    direita: { display: 'flex', gap: '8px' },
    btnVoltar: {
        backgroundColor: '#2d6a4f',
        color: '#fff',
        border: 'none',
        padding: '7px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '13px',
    },
    btnSair: {
        backgroundColor: '#e53935',
        color: '#fff',
        border: 'none',
        padding: '7px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '13px',
    },
}

export default Header
