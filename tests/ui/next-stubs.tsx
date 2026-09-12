import type { ComponentProps } from "react";
const router = { refresh() {} };
export const useRouter = () => router;
export default function Image({
  fill: _fill,
  ...props
}: ComponentProps<"img"> & { fill?: boolean }) {
  void _fill;
  return <img {...props} alt={props.alt ?? ""} />; // eslint-disable-line @next/next/no-img-element
}
