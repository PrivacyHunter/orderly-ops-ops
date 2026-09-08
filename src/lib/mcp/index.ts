import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listProducts from "./tools/list-products";
import getProduct from "./tools/get-product";
import listInquiries from "./tools/list-inquiries";
import listQuotes from "./tools/list-quotes";

// The OAuth issuer must be the direct Supabase host; the project ref is the only
// Supabase value that survives publish unchanged.
const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "opscodestudioambitionest",
  title: "opscodestudioambitionest",
  version: "0.1.0",
  instructions:
    "Tools for the Ambition Sports B2B custom sportswear site. Use `list_products` / `get_product` to browse the catalog, and `list_inquiries` / `list_quotes` to review incoming customer requests. All tools act as the signed-in account.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listProducts, getProduct, listInquiries, listQuotes],
});
