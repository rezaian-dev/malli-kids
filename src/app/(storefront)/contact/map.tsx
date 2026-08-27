import { BRAND } from "@/lib/constants";

export function Map() {
  const { lat, lng } = BRAND.map;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.008}%2C${lng + 0.01}%2C${lat + 0.008}&layer=mapnik&marker=${lat}%2C${lng}`;
  return (
    <div className="rounded-[28px] overflow-hidden border border-navy/10 h-95 bg-sand">
      <iframe title="نقشه گالری ولیعصر" src={src} className="w-full h-full border-0" />
    </div>
  );
}
