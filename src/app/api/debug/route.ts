import { NextResponse } from 'next/server';

import { getProducts } from '@/features/pricing/controllers/get-products';
import { productMetadataSchema } from '@/features/pricing/models/product-metadata';

export async function GET() {
  try {
    const products = await getProducts();
    const results = products.map((p) => {
      const parsed = productMetadataSchema.safeParse(p.metadata);
      return {
        id: p.id,
        name: p.name,
        metadata: p.metadata,
        metadataValid: parsed.success,
        metadataError: parsed.success ? null : parsed.error.format(),
        priceCount: p.prices?.length ?? 0,
      };
    });
    return NextResponse.json({ ok: true, products: results });
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    return NextResponse.json({ ok: false, error: error.message, stack: error.stack });
  }
}
