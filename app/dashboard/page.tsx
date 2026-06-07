"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Suspense, useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const negocioId = searchParams.get("id");
  const negocioNombre = searchParams.get("nombre");
  const qrRef = useRef<HTMLDivElement>(null);

  const [metricas, setMetricas] = useState({
    totalClientes: 0,
    visitasSemana: 0,
    canjes: 0,
  });
  const [clientes, setClientes] = useState<any[]>([]);
  const [negocio, setNegocio] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [pagando, setPagando] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      const { data: negocioData } = await supabase
        .from("negocios")
        .select("*")
        .eq("id", negocioId)
        .single();

      setNegocio(negocioData);

      const { data: clientesData } = await supabase
        .from("clientes")
        .select("*")
        .eq("negocio_id", negocioId)
        .order("visitas", { ascending: false });

      if (clientesData) {
        setClientes(clientesData);

        const unaSemanaAtras = new Date();
        unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);

        const visitasSemana = clientesData.filter(
          (c) => c.ultima_visita && new Date(c.ultima_visita) > unaSemanaAtras,
        ).length;

        const canjes = clientesData.filter(
          (c) => c.visitas >= negocioData.visitas,
        ).length;

        setMetricas({
          totalClientes: clientesData.length,
          visitasSemana,
          canjes,
        });
      }

      setCargando(false);
    };

    if (negocioId) cargarDatos();
  }, [negocioId]);

  const urlCliente = "https://huellaclub.app/visita?negocio=" + negocioId;

  const diasRestantes = negocio
    ? (() => {
        const creado = new Date(negocio.created_at);
        const hoy = new Date();
        const dias = Math.floor(
          (hoy.getTime() - creado.getTime()) / (1000 * 60 * 60 * 24),
        );
        return Math.max(0, 30 - dias);
      })()
    : 0;

  const trialActivo = diasRestantes > 0;
  const accesoActivo = negocio?.suscripcion_activa || trialActivo;

  const irAlEditor = () => {
    router.push(
      "/editor-qr?id=" +
        negocioId +
        "&nombre=" +
        encodeURIComponent(negocioNombre || ""),
    );
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const descargarQR = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const size = 600;
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, size, size);

    const img = new Image();
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.download = "QR-" + negocioNombre + ".png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = url;
  };

  const handlePago = async () => {
    setPagando(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          negocioId,
          negocioNombre,
          correo: negocio?.correo,
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Error al procesar el pago: " + data.error);
      }
    } catch (error) {
      alert("Error al conectar con el servidor de pagos");
    } finally {
      setPagando(false);
    }
  };

  if (cargando) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-white">{negocioNombre}</h1>
          <button
            onClick={cerrarSesion}
            className="text-gray-500 hover:text-gray-300 text-sm transition"
          >
            Cerrar sesion
          </button>
        </div>
        <p className="text-gray-400 mb-8">Panel de control</p>

        {negocio?.suscripcion_activa && (
          <div className="bg-green-900 border border-green-600 rounded-2xl p-4 mb-8 flex items-center gap-3">
            <p className="text-green-400 text-sm font-semibold">
              HuellaClub Pro activo
            </p>
          </div>
        )}

        {!negocio?.suscripcion_activa && trialActivo && (
          <div className="bg-indigo-900 border border-indigo-600 rounded-2xl p-5 mb-8 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Periodo de prueba</p>
              <p className="text-indigo-300 text-sm">
                Te quedan {diasRestantes} dias gratis
              </p>
            </div>
            <button
              onClick={handlePago}
              disabled={pagando}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-xl transition disabled:opacity-50 text-sm"
            >
              {pagando ? "Cargando..." : "Suscribirme $199/mes"}
            </button>
          </div>
        )}

        {!negocio?.suscripcion_activa && !trialActivo && (
          <div className="bg-red-900 border border-red-600 rounded-2xl p-5 mb-8">
            <p className="text-white font-semibold mb-1">
              Tu periodo de prueba termino
            </p>
            <p className="text-red-300 text-sm mb-4">
              Suscribete para reactivar tu programa de lealtad.
            </p>
            <button
              onClick={handlePago}
              disabled={pagando}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-xl transition disabled:opacity-50 text-sm"
            >
              {pagando ? "Cargando..." : "Reactivar por $199/mes"}
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-2xl p-5 text-center">
            <p className="text-4xl font-bold text-white">
              {metricas.totalClientes}
            </p>
            <p className="text-gray-400 text-sm mt-1">Clientes</p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-5 text-center">
            <p className="text-4xl font-bold text-indigo-400">
              {metricas.visitasSemana}
            </p>
            <p className="text-gray-400 text-sm mt-1">Visitas esta semana</p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-5 text-center">
            <p className="text-4xl font-bold text-green-400">
              {metricas.canjes}
            </p>
            <p className="text-gray-400 text-sm mt-1">Canjes</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 mb-8">
          <h2 className="text-white font-semibold mb-4">Tu codigo QR</h2>
          {accesoActivo ? (
            <div className="flex items-center gap-6">
              <div ref={qrRef} className="bg-white p-4 rounded-xl">
                <QRCodeSVG value={urlCliente} size={120} />
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-gray-400 text-sm">
                  Imprime este QR y colócalo en tu caja. Tus clientes lo
                  escanean para registrar su visita.
                </p>
                <button
                  onClick={descargarQR}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-xl transition text-sm"
                >
                  Descargar QR en PNG
                </button>
                <button
                  onClick={irAlEditor}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl transition text-sm"
                >
                  Personalizar QR
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-4">
                Tu QR esta desactivado. Suscribete para reactivarlo.
              </p>
              <button
                onClick={handlePago}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-xl transition text-sm"
              >
                Reactivar
              </button>
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Tus clientes</h2>
          {clientes.length === 0 ? (
            <p className="text-gray-400">Aun no tienes clientes registrados.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {clientes.map((cliente) => {
                const progreso = Math.min(
                  (cliente.visitas / negocio.visitas) * 100,
                  100,
                );
                return (
                  <div key={cliente.id} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-white text-sm">
                        {cliente.celular}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {cliente.visitas} de {negocio.visitas} visitas
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{ width: progreso + "%" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-900 flex justify-between items-center">
          <a
            href="/terminos"
            className="text-gray-700 hover:text-gray-500 text-xs transition"
          >
            Terminos y condiciones
          </a>
          <a
            href="mailto:hola@huellaclub.app"
            className="text-gray-700 hover:text-gray-500 text-xs transition"
          >
            Cancelar suscripcion
          </a>
        </div>
      </div>
    </main>
  );
}

export default function Dashboard() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
