const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function resolveImageUrl(src?: string) {
  if (!src) return "/img/no-image.jpg";
  if (src.startsWith("http")) return src;
  return `${API_URL}${src}`;
}
