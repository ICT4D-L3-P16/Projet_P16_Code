// ============================================
// 9. Parametres.tsx
// ============================================
export const Parametres: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-google-bold text-textcol">Paramètres</h1>
            <div className="bg-surface border border-gray-200 dark:border-gray-800 rounded-xl p-8">
                <div className="space-y-6 max-w-2xl">
                    <div>
                        <label className="block text-sm font-google-bold mb-2 text-textcol">Nom complet</label>
                        <input
                            type="text"
                            defaultValue="Administrateur"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-background text-textcol focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-google-bold mb-2 text-textcol">Email</label>
                        <input
                            type="email"
                            defaultValue="admin@saje.com"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-background text-textcol focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <button className="px-6 py-3 bg-primary text-white rounded-xl font-google-bold hover:brightness-110 transition-all">
                        Sauvegarder
                    </button>
                </div>
            </div>
        </div>
    )
}