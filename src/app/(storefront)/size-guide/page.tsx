import { buildMetadata } from "@/lib/seo";
import { SizeGuideLanding } from "./_components/size-guide-landing";

export const metadata = buildMetadata({
  title: "راهنمای سایز",
  description: "جدول سایز پوشاک کودک بر اساس قد و سن.",
  path: "/size-guide",
});

export default function SizeGuidePage() {
  return <SizeGuideLanding />;
}
