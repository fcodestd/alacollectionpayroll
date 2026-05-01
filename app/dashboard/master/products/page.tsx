// app/dashboard/master/products/page.tsx
import { getProducts } from "@/lib/actions/product";
import ProductClientPage from "./product-client";

export default async function MasterProductPage(props: {
  searchParams: Promise<any>;
}) {
  const params = await props.searchParams;
  const q = params.q || "";
  const page = Number(params.page) || 1;

  const { data, totalPages } = await getProducts(q, page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Master Data Produk
        </h1>
        <p className="text-sm text-slate-500">
          Kelola daftar item/produk yang dikerjakan beserta harganya.
        </p>
      </div>

      <ProductClientPage data={data} totalPages={totalPages} />
    </div>
  );
}
