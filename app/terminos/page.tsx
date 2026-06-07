export default function Terminos() {
  return (
    <main className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-3xl font-bold text-white mb-2">Terminos y condiciones</h1>
        <p className="text-gray-500 text-sm mb-8">Ultima actualizacion: junio 2026</p>

        <div className="flex flex-col gap-8 text-gray-300">

          <div>
            <h2 className="text-white font-semibold text-lg mb-3">1. Descripcion del servicio</h2>
            <p className="text-gray-400 leading-relaxed">HuellaClub es una plataforma digital de lealtad para negocios locales. Permite a los negocios crear programas de recompensas para sus clientes mediante codigos QR y registro de visitas.</p>
          </div>

          <div>
            <h2 className="text-white font-semibold text-lg mb-3">2. Uso del servicio</h2>
            <p className="text-gray-400 leading-relaxed">Al registrarte en HuellaClub aceptas usar el servicio de forma licita y de acuerdo con estos terminos. No puedes usar la plataforma para actividades ilegales o fraudulentas.</p>
          </div>

          <div>
            <h2 className="text-white font-semibold text-lg mb-3">3. Suscripcion y pagos</h2>
            <p className="text-gray-400 leading-relaxed">HuellaClub ofrece un periodo de prueba gratuito de 30 dias. Al suscribirte al plan Pro, aceptas un cargo mensual de $199 MXN. Puedes cancelar en cualquier momento desde tu panel de control.</p>
          </div>

          <div>
            <h2 className="text-white font-semibold text-lg mb-3">4. Datos de clientes</h2>
            <p className="text-gray-400 leading-relaxed">Los negocios son responsables de obtener el consentimiento de sus clientes para recopilar su numero de celular. HuellaClub almacena estos datos de forma segura y no los comparte con terceros.</p>
          </div>

          <div>
            <h2 className="text-white font-semibold text-lg mb-3">5. Privacidad</h2>
            <p className="text-gray-400 leading-relaxed">Recopilamos informacion necesaria para operar el servicio: correo electronico del negocio, nombre del negocio y numeros de celular de clientes. Esta informacion se usa unicamente para operar la plataforma.</p>
          </div>

          <div>
            <h2 className="text-white font-semibold text-lg mb-3">6. Cancelacion</h2>
            <p className="text-gray-400 leading-relaxed">Puedes cancelar tu suscripcion en cualquier momento. Al cancelar, tu programa de lealtad se desactivara al termino del periodo pagado. Los datos de tus clientes se conservan por 30 dias adicionales.</p>
          </div>

          <div>
            <h2 className="text-white font-semibold text-lg mb-3">7. Contacto</h2>
            <p className="text-gray-400 leading-relaxed">Para dudas o soporte escribe a: <span className="text-indigo-400">hola@huellaclub.app</span></p>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <a href="/" className="text-gray-500 hover:text-gray-300 text-sm transition">
            Volver al inicio
          </a>
        </div>

      </div>
    </main>
  )
}