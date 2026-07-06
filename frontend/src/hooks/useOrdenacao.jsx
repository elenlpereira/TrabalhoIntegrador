import { useState } from 'react'

/**
 * Hook de ordenação reutilizável para tabelas.
 * Ciclo: clique 1 → asc ▲, clique 2 → desc ▼, clique 3 → sem ordenação
 */
export function useOrdenacao() {
    const [coluna, setColuna] = useState(null)
    const [direcao, setDirecao] = useState('asc')

    function alternar(key) {
        if (coluna === key) {
            if (direcao === 'asc') setDirecao('desc')
            else { setColuna(null); setDirecao('asc') }
        } else {
            setColuna(key)
            setDirecao('asc')
        }
    }

    function ordenar(lista) {
        if (!coluna) return lista
        return [...lista].sort((a, b) => {
            const va = a[coluna] ?? ''
            const vb = b[coluna] ?? ''
            if (typeof va === 'number' && typeof vb === 'number') {
                return direcao === 'asc' ? va - vb : vb - va
            }
            return direcao === 'asc'
                ? String(va).localeCompare(String(vb), 'pt-BR', { numeric: true })
                : String(vb).localeCompare(String(va), 'pt-BR', { numeric: true })
        })
    }

    return { coluna, direcao, alternar, ordenar }
}

/**
 * Cabeçalho de coluna clicável.
 * Props: label, col, coluna (atual), direcao, onSort
 */
export function Th({ label, col, coluna, direcao, onSort, style = {} }) {
    const ativo = coluna === col
    return (
        <th
            onClick={() => onSort(col)}
            style={{
                cursor: 'pointer',
                userSelect: 'none',
                textAlign: 'left',
                padding: '10px 12px',
                borderBottom: '2px solid #ddd',
                fontSize: '13px',
                color: ativo ? '#1a1a1a' : '#555',
                whiteSpace: 'nowrap',
                ...style,
            }}
        >
            {label}{' '}
            <span style={{ fontSize: '10px', color: ativo ? '#2d6a4f' : '#bbb' }}>
                {ativo ? (direcao === 'asc' ? '▲' : '▼') : '⇅'}
            </span>
        </th>
    )
}
