async function getQRCode() {
  const url = "https://embra.site/qrcode?link=https://embra.site/QOe99o";

  const response = await fetch(url);

  // Pega o arrayBuffer da resposta
  const arrayBuffer = await response.arrayBuffer();

  // Converte para Buffer do Node.js
  const buffer = Buffer.from(arrayBuffer);

  // Converte para base64
  const base64 = buffer.toString("base64");

  // Monta o Data URL
  const dataUrl = `data:image/png;base64,${base64}`;

  return dataUrl;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  const qrCode = await getQRCode();

  return new Response(JSON.stringify({ qrCode: qrCode }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
