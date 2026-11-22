import type { MetadataRoute } from "next";

// Makes SkipQ installable ("Add to Home Screen"), which iPhones require
// before a web app may receive push notifications.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SkipQ — สั่งอาหารล่วงหน้า ข้ามคิว",
    short_name: "SkipQ",
    description: "สั่งอาหารโรงอาหาร ม.ศรีปทุม ล่วงหน้า แล้วรับได้เลยไม่ต้องต่อคิว",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f9fc",
    theme_color: "#e6007e",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
