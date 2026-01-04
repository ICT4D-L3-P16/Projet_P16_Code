// ============================================
// 8. Support.tsx
// ============================================
export const Support: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-google-bold text-textcol">Support technique</h1>
            <div className="bg-surface border border-gray-200 dark:border-gray-800 rounded-xl p-8">
                <form className="space-y-4 max-w-2xl">
                    <input
                        type="text"
                        placeholder="Sujet"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-background text-textcol focus:ring-2 focus:ring-primary outline-none"
                    />
                    <textarea
                        placeholder="Décrivez votre problème..."
                        rows={6}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-background text-textcol focus:ring-2 focus:ring-primary outline-none"
                    />
                    <button className="px-6 py-3 bg-primary text-white rounded-xl font-google-bold hover:brightness-110 transition-all">
                        Envoyer la demande
                    </button>
                </form>
            </div>
        </div>
    )
}
