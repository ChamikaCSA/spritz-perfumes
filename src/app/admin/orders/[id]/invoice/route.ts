import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import {
  buildInvoicePdf,
  orderDocumentFilename,
  pdfResponse,
} from "@/lib/orders/pdfs";

type Params = Promise<{ id: string }>;

export async function GET(
  _request: Request,
  { params }: { params: Params },
) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const bytes = await buildInvoicePdf(order);
  return pdfResponse(bytes, orderDocumentFilename("invoice", order));
}
