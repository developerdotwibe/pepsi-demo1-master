import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { mapCategoryProducts, ApiCategory, ProductCategory } from "../data/products";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
    let categories: ProductCategory[] = [];
    let error = "";

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/product-by-categories`,
            {
                cache: "no-store",
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }

        const data: ApiCategory[] = await response.json();
        categories = mapCategoryProducts(data);
    } catch (err) {
        console.error("Products API error:", err);
        error = "Unable to load products. Please try again.";
    }

    return (
        <>
            <Header />
            <ProductsClient
                initialCategories={categories}
                initialError={error}
            />
            <Footer />
        </>
    );
}