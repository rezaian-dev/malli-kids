import { BRAND } from "@/lib/constants";

export function ContactMap() {
  const { lat, lng } = BRAND.map;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.008}%2C${lng + 0.01}%2C${lat + 0.008}&layer=mapnik&marker=${lat}%2C${lng}`;
  return (
    <div className="border-navy/10 bg-sand h-95 overflow-hidden rounded-[28px] border">
      <iframe
        title="نقشه گالری ولیعصر"
        src={src}
        className="h-full w-full border-0"
      />
    </div>
  );
}
