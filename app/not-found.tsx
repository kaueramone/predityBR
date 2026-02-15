import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="bg-surface/50 p-6 rounded-full">
                <AlertCircle className="w-16 h-16 text-primary" />
            </div>
            <h2 className="text-4xl font-bold">Página não encontrada</h2>
            <p className="text-gray-400 max-w-md">O recurso que você tentou acessar não existe ou foi removido.</p>
            <Link href="/" className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-all">
                Voltar para o Início
            </Link>
        </div>
    )
}
