import Image, { type ImageProps } from "next/image";

// Hosts listed in next.config.ts `images.remotePatterns` go through the
// Next.js optimizer. Anything else an admin pastes (any image URL on the web)
// is loaded by the browser directly — next/image would otherwise refuse to
// render it — and uploaded images are data: URLs, which are never optimized.
const OPTIMIZED_HOSTS = ["lh3.googleusercontent.com"];

function canOptimize(src: ImageProps["src"]) {
  if (typeof src !== "string") return true;
  if (src.startsWith("/")) return true;
  try {
    return OPTIMIZED_HOSTS.includes(new URL(src).hostname);
  } catch {
    return false;
  }
}

/** next/image that also renders images from hosts outside remotePatterns. */
export function AppImage(props: ImageProps) {
  return <Image {...props} alt={props.alt} unoptimized={props.unoptimized ?? !canOptimize(props.src)} />;
}
