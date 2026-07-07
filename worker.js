// Worker del Panel de Facturación.
// - Responde /api/data (GET para leer, POST para guardar) usando el KV llamado PANEL.
// - Cualquier otra ruta entrega los archivos estáticos (index.html) vía ASSETS.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/data") {
      if (!env.PANEL) return new Response("KV no configurado (falta el binding PANEL)", { status: 500 });

      if (request.method === "GET") {
        const d = await env.PANEL.get("dataset");
        return new Response(d || "", {
          headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
        });
      }
      if (request.method === "POST") {
        const body = await request.text();
        if (body.length > 20 * 1024 * 1024) return new Response("Datos demasiado grandes", { status: 413 });
        await env.PANEL.put("dataset", body);
        return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
      }
      return new Response("Método no permitido", { status: 405 });
    }

    return env.ASSETS.fetch(request);
  },
};
