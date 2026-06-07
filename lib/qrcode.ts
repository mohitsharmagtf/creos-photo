import QRCode from "qrcode";

export function publicEventUrl(slug: string) {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  return `${baseUrl.replace(/\/$/, "")}/e/${slug}`;
}

export async function eventQrPng(slug: string) {
  return QRCode.toBuffer(publicEventUrl(slug), {
    type: "png",
    width: 1200,
    margin: 2,
    color: { dark: "#0757C2", light: "#FFFFFF" }
  });
}
