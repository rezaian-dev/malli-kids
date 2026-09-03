import { buildMetadata } from "@/lib/seo";
import { CollabLanding } from "@/features/collab/components/collab-landing";

export const metadata = buildMetadata({
  title: "همکاری با ما",
  description: "خرید عمده، دوخت، محتوا و مدلینگ کودک.",
  path: "/collab",
});

export default function CollabPage() {
  return <CollabLanding />;
}
