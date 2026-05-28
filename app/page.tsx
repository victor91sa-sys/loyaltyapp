export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      
      <div className="text-center max-w-md">
        
        <h1 className="text-4xl font-bold text-white mb-4">
          LoyaltyApp
        </h1>
        
        <p className="text-gray-400 text-lg mb-8">
          Programa de lealtad digital para negocios locales
        </p>

        <div className="flex flex-col gap-4">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition">
            Registrar mi negocio
          </button>
          <button className="border border-gray-600 hover:border-gray-400 text-gray-300 font-semibold py-3 px-6 rounded-xl transition">
            Iniciar sesión
          </button>
        </div>

      </div>

    </main>
  )
}