import Link from 'next/link'

export default function Terminos() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">

        <Link href="/" className="text-indigo-600 font-bold text-xl block mb-8">
          HuellaClub
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Términos y condiciones</h1>
        <p className="text-gray-400 text-sm mb-10">Última actualización: junio 2026</p>

        <div className="flex flex-col gap-8">

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(99,102,241,0.06)]">
            <h2 className="text-gray-900 font-semibold text-lg mb-3">1. Descripción del servicio</h2>
            <p className="text-gray-600 leading-relaxed text-sm">HuellaClub es una plataforma digital de lealtad para negocios locales. Permite a los negocios crear programas de recompensas para sus clientes mediante códigos QR y registro de visitas.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(99,102,241,0.06)]">
            <h2 className="text-gray-900 font-semibold text-lg mb-3">2. Uso del servicio</h2>
            <p className="text-gray-600 leading-relaxed text-sm">Al registrarte en HuellaClub aceptas usar el servicio de forma lícita y de acuerdo con estos términos. No puedes usar la plataforma para actividades ilegales o fraudulentas.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(99,102,241,0.06)]">
            <h2 className="text-gray-900 font-semibold text-lg mb-3">3. Suscripción y pagos</h2>
            <p className="text-gray-600 leading-relaxed text-sm">HuellaClub ofrece un período de prueba gratuito de 30 días. Al suscribirte al plan Pro, aceptas un cargo mensual de $199 MXN. Puedes cancelar en cualquier momento desde tu panel de control.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(99,102,241,0.06)]">
            <h2 className="text-gray-900 font-semibold text-lg mb-3">4. Datos de clientes</h2>
            <p className="text-gray-600 leading-relaxed text-sm">Los negocios son responsables de obtener el consentimiento de sus clientes para recopilar su número de celular. HuellaClub almacena estos datos de forma segura y no los comparte con terceros.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(99,102,241,0.06)]">
            <h2 className="text-gray-900 font-semibold text-lg mb-3">5. Privacidad</h2>
            <p className="text-gray-600 leading-relaxed text-sm">Recopilamos información necesaria para operar el servicio: correo electrónico del negocio, nombre del negocio y números de celular de clientes. Esta información se usa únicamente para operar la plataforma.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(99,102,241,0.06)]">
            <h2 className="text-gray-900 font-semibold text-lg mb-3">6. Cancelación</h2>
            <p className="text-gray-600 leading-relaxed text-sm">Puedes cancelar tu suscripción en cualquier momento. Al cancelar, tu programa de lealtad se desactivará al término del período pagado. Los datos de tus clientes se conservan por 30 días adicionales.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(99,102,241,0.06)]">
            <h2 className="text-gray-900 font-semibold text-lg mb-3">7. Contacto</h2>
            <p className="text-gray-600 leading-relaxed text-sm">Para dudas o soporte escribe a: <a href="mailto:sabino@maplo.com.mx" className="text-indigo-600 hover:text-indigo-700">sabino@maplo.com.mx</a></p>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm transition">
            Volver al inicio
          </Link>
        </div>

      </div>
    </main>
  )
}
