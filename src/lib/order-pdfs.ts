import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { BRAND_CONTACT } from "@/lib/brand";
import type { Order } from "@/lib/types";
import { formatLkr, variantLabel } from "@/lib/utils-commerce";

const BLACK = rgb(0, 0, 0);
const INK = rgb(0.08, 0.08, 0.08);
const MUTED = rgb(0.35, 0.35, 0.35);
const RULE = rgb(0.15, 0.15, 0.15);
const HAIRLINE = rgb(0.55, 0.55, 0.55);

function sanitizeFilenamePart(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

function uniqueStamp() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    "-",
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");
}

export function orderDocumentFilename(
  kind: "invoice" | "shipping-label",
  order: Order,
) {
  const orderPart = sanitizeFilenamePart(order.order_number) || "order";
  return `spritz-${kind}-${orderPart}-${uniqueStamp()}.pdf`;
}

function textWidth(text: string, font: PDFFont, size: number) {
  return font.widthOfTextAtSize(text, size);
}

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  size: number,
  font: PDFFont,
  color = INK,
) {
  page.drawText(text, { x, y, size, font, color });
}

function drawRight(
  page: PDFPage,
  text: string,
  rightX: number,
  y: number,
  size: number,
  font: PDFFont,
  color = INK,
) {
  drawText(page, text, rightX - textWidth(text, font, size), y, size, font, color);
}

function drawCentered(
  page: PDFPage,
  text: string,
  centerX: number,
  y: number,
  size: number,
  font: PDFFont,
  color = INK,
) {
  drawText(
    page,
    text,
    centerX - textWidth(text, font, size) / 2,
    y,
    size,
    font,
    color,
  );
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines: string[] = [];
  let current = words[0];
  for (const word of words.slice(1)) {
    const next = `${current} ${word}`;
    if (textWidth(next, font, size) <= maxWidth) {
      current = next;
    } else {
      lines.push(current);
      current = word;
    }
  }
  lines.push(current);
  return lines;
}

function formatOrderDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-LK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

function hRule(
  page: PDFPage,
  x1: number,
  x2: number,
  y: number,
  thickness = 0.75,
  color = RULE,
) {
  page.drawLine({
    start: { x: x1, y },
    end: { x: x2, y },
    thickness,
    color,
  });
}

export async function buildInvoicePdf(order: Order): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();

  const margin = 48;
  const contentRight = width - margin;
  const contentWidth = contentRight - margin;
  let y = height - 52;

  // Header
  drawText(page, "SPRITZ PERFUMES", margin, y, 10, bold, BLACK);
  drawRight(page, "INVOICE", contentRight, y - 2, 18, bold, BLACK);
  y -= 14;
  drawText(page, BRAND_CONTACT.email, margin, y, 8, font, MUTED);
  y -= 18;
  hRule(page, margin, contentRight, y, 1.25, BLACK);
  y -= 28;

  // Meta grid
  const metaLeft = margin;
  const metaRight = width / 2 + 8;
  drawText(page, "ORDER", metaLeft, y, 7, bold, MUTED);
  drawText(page, "DATE", metaRight, y, 7, bold, MUTED);
  y -= 14;
  drawText(page, order.order_number, metaLeft, y, 12, bold, BLACK);
  drawText(page, formatOrderDate(order.created_at), metaRight, y, 12, font, INK);
  y -= 28;

  // Addresses
  const colGap = 24;
  const colWidth = (contentWidth - colGap) / 2;
  const shipX = margin + colWidth + colGap;

  drawText(page, "BILL TO", margin, y, 7, bold, MUTED);
  drawText(page, "SHIP TO", shipX, y, 7, bold, MUTED);
  y -= 16;

  const billLines = [
    `${order.first_name} ${order.last_name}`,
    order.email,
    order.phone,
  ];
  const shipLines = [
    `${order.first_name} ${order.last_name}`,
    order.address_line1,
    order.address_line2,
    `${order.city}, ${order.district}${order.postal_code ? ` ${order.postal_code}` : ""}`,
    order.country,
    order.phone,
  ].filter(Boolean) as string[];

  const addressStart = y;
  let billY = addressStart;
  billLines.forEach((line, i) => {
    drawText(page, line, margin, billY, i === 0 ? 10 : 9, i === 0 ? bold : font);
    billY -= i === 0 ? 14 : 12;
  });

  let shipY = addressStart;
  shipLines.forEach((line, i) => {
    const wrapped = wrapText(line, i === 0 ? bold : font, i === 0 ? 10 : 9, colWidth);
    for (const w of wrapped) {
      drawText(page, w, shipX, shipY, i === 0 ? 10 : 9, i === 0 ? bold : font);
      shipY -= i === 0 ? 14 : 12;
    }
  });

  y = Math.min(billY, shipY) - 18;
  hRule(page, margin, contentRight, y, 0.75, BLACK);
  y -= 22;

  // Table header
  const qtyX = contentRight - 130;
  const totalX = contentRight;
  drawText(page, "ITEM", margin, y, 7, bold, MUTED);
  drawRight(page, "QTY", qtyX, y, 7, bold, MUTED);
  drawRight(page, "AMOUNT", totalX, y, 7, bold, MUTED);
  y -= 8;
  hRule(page, margin, contentRight, y, 0.6, BLACK);
  y -= 16;

  const itemMaxWidth = qtyX - margin - 28;
  for (const item of order.items ?? []) {
    if (y < 130) break;

    const title = `${item.brand_name} ${item.product_name}`;
    const detail = variantLabel(item.variant_type, item.size_ml);
    const titleLines = wrapText(title, bold, 9, itemMaxWidth);

    for (const [i, line] of titleLines.entries()) {
      drawText(page, line, margin, y, 9, bold);
      if (i === 0) {
        drawRight(page, String(item.quantity), qtyX, y, 9, font);
        drawRight(page, formatLkr(item.line_total_lkr), totalX, y, 9, font);
      }
      y -= 12;
    }
    drawText(page, detail, margin, y, 8, font, MUTED);
    y -= 10;
    hRule(page, margin, contentRight, y, 0.4, HAIRLINE);
    y -= 14;
  }

  y -= 6;

  // Totals
  const totalsLeft = contentRight - 180;
  const totals = [
    { label: "Subtotal", value: formatLkr(order.subtotal_lkr), strong: false },
    { label: "Shipping", value: formatLkr(order.shipping_lkr), strong: false },
    { label: "Total", value: formatLkr(order.total_lkr), strong: true },
  ];

  for (const row of totals) {
    if (row.strong) {
      y -= 4;
      hRule(page, totalsLeft, contentRight, y + 12, 0.8, BLACK);
      y -= 2;
    }
    drawText(
      page,
      row.label.toUpperCase(),
      totalsLeft,
      y,
      row.strong ? 9 : 8,
      bold,
      row.strong ? BLACK : MUTED,
    );
    drawRight(
      page,
      row.value,
      contentRight,
      y,
      row.strong ? 12 : 9,
      row.strong ? bold : font,
      BLACK,
    );
    y -= row.strong ? 20 : 15;
  }

  // Footer
  y = 56;
  hRule(page, margin, contentRight, y + 18, 0.6, BLACK);
  drawText(
    page,
    `${BRAND_CONTACT.email}  ·  ${BRAND_CONTACT.whatsappDisplay}  ·  ${BRAND_CONTACT.hours}`,
    margin,
    y,
    7.5,
    font,
    MUTED,
  );
  drawRight(page, "Thank you for your order", contentRight, y, 7.5, font, MUTED);

  return doc.save();
}

export async function buildShippingLabelPdf(order: Order): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([288, 432]); // 4×6 in
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();

  const outer = 10;
  const pad = 18;
  const left = outer + pad;
  const right = width - outer - pad;
  const contentWidth = right - left;

  // Outer frame
  page.drawRectangle({
    x: outer,
    y: outer,
    width: width - outer * 2,
    height: height - outer * 2,
    borderColor: BLACK,
    borderWidth: 1.5,
  });

  let y = height - outer - 28;

  // Brand strip
  drawCentered(page, "SPRITZ PERFUMES", width / 2, y, 9, bold, BLACK);
  y -= 10;
  hRule(page, left, right, y, 1, BLACK);
  y -= 20;

  // Order identity
  drawText(page, "ORDER", left, y, 7, bold, MUTED);
  y -= 14;
  drawText(page, order.order_number, left, y, 14, bold, BLACK);
  y -= 18;

  if (order.tracking_number) {
    page.drawRectangle({
      x: left,
      y: y - 22,
      width: contentWidth,
      height: 28,
      borderColor: BLACK,
      borderWidth: 0.9,
    });
    drawText(page, "TRACKING", left + 8, y - 6, 6.5, bold, MUTED);
    drawText(page, order.tracking_number, left + 8, y - 18, 10, bold, BLACK);
    y -= 38;
  }

  hRule(page, left, right, y, 0.75, BLACK);
  y -= 18;

  // From
  drawText(page, "FROM", left, y, 7, bold, MUTED);
  y -= 13;
  drawText(page, "Spritz Perfumes", left, y, 9, bold);
  y -= 12;
  drawText(page, "Sri Lanka", left, y, 8, font, MUTED);
  y -= 12;
  drawText(page, BRAND_CONTACT.whatsappDisplay, left, y, 8, font, MUTED);
  y -= 16;
  hRule(page, left, right, y, 0.75, BLACK);
  y -= 20;

  // Deliver to — dominant block
  drawText(page, "DELIVER TO", left, y, 7, bold, MUTED);
  y -= 18;

  const name = `${order.first_name} ${order.last_name}`;
  for (const line of wrapText(name, bold, 14, contentWidth)) {
    drawText(page, line, left, y, 14, bold, BLACK);
    y -= 18;
  }

  y -= 2;
  drawText(page, order.phone, left, y, 11, bold, BLACK);
  y -= 18;

  const addressParts = [
    order.address_line1,
    order.address_line2,
    `${order.city}, ${order.district}`,
    order.postal_code,
    order.country,
  ].filter(Boolean) as string[];

  for (const part of addressParts) {
    for (const line of wrapText(part, font, 11, contentWidth)) {
      drawText(page, line, left, y, 11, font, INK);
      y -= 14;
    }
  }

  // Bottom barcode-style order ref
  const bottomY = outer + 22;
  hRule(page, left, right, bottomY + 16, 0.75, BLACK);
  drawCentered(
    page,
    order.order_number.replace(/-/g, "  "),
    width / 2,
    bottomY,
    8,
    bold,
    BLACK,
  );

  return doc.save();
}

export function pdfResponse(bytes: Uint8Array, filename: string) {
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
