import { ImageResponse } from "next/og";

export const alt = "Spritz Perfumes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #1a1510 50%, #0a0a0a 100%)",
          color: "#f5f0e8",
        }}
      >
        <p
          style={{
            fontSize: 28,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "#d4af37",
            marginBottom: 24,
            marginTop: 0,
          }}
        >
          Spritz Perfumes
        </p>
        <p
          style={{
            fontSize: 64,
            fontWeight: 600,
            lineHeight: 1.1,
            maxWidth: 900,
            margin: 0,
          }}
        >
          Luxury perfume decants in Sri Lanka
        </p>
        <p
          style={{
            marginTop: 32,
            fontSize: 28,
            color: "#a89f8f",
            maxWidth: 800,
            lineHeight: 1.4,
            marginBottom: 0,
          }}
        >
          Authentic full bottles and fine decants from the world&apos;s finest
          houses.
        </p>
      </div>
    ),
    { ...size },
  );
}
