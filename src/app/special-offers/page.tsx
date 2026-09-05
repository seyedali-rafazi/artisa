import { permanentRedirect } from "next/navigation";

export default function SpecialOffersPage() {
  permanentRedirect("/products?isSpecial=true");
}
