'use client'

import { useState } from 'react'

export default function Registro() {
  const [formulario, setFormulario] = useState({
    nombre: '',
    tipo: '',
    correo: '',
    visitas: '',
    recompensa: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('¡Negocio registrado! Próximamente conectamos esto a la base de datos.')
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2">
          Registra tu negocio
        </h1>
        <p className="text-gray-400 mb-8">
          Configura tu programa de lealtad en minutos
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Nombre del negocio</label>
            <input
              type="text"
              name="nombre"
              value={formulario.nombre}
              onChange={handleChange}
              placeholder="Ej. Café La Paloma"
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Tipo de negocio</label>
            <select
              name="tipo"
              value={formulario.tipo}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecciona una opción</option>
              <option value="cafeteria">Cafetería</option>
              <option value="restaurante">Restaurante</option>
              <option value="barberia">Barbería</option>
              <option value="salon">Salón de belleza</option>
              <option value="lavanderia">Lavandería</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Correo del dueño</label>
            <input
              type="email"
              name="correo"
              value={formulario.correo}
              onChange={handleChange}
              placeholder="tucorreo@email.com"
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm mb-1 block">¿Cuántas visitas para obtener recompensa?</label>
            <input
              type="number"
              name="visitas"
              value={formulario.visitas}
              onChange={handleChange}
              placeholder="Ej. 10"
              min="1"
              max="50"
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm mb-1 block">¿Cuál es la recompensa?</label>
            <input
              type="text"
              name="recompensa"
              value={formulario.recompensa}
              onChange={handleChange}
              placeholder="Ej. Café gratis"
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition mt-2"
          >
            Crear mi programa de lealtad
          </button>
        </form>
      </div>
    </main>
  )
}