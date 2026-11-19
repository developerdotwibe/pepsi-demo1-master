
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import {
    mapCategoryProducts,
    ApiCategory,
    ProductCategory,
} from "../data/products";
import ProductsClient from "./ProductsClient";
import { FilterValues } from "../components/pruduct-list/prd-filter";

interface ProductsPageProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
    const params = await searchParams;

    let categories: ProductCategory[] = [];
    let error = "";

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/product-by-categories`,
            { cache: "no-store" }
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

    const sortMap: Record<string, string> = {
        popularity: "popular",
        date: "newest",
        price: "price-asc",
        "price-desc": "price-desc",
    };

    const initialFilters: FilterValues = {
        search: typeof params.searchname === "string" ? params.searchname : "",
        brand: typeof params.brand === "string" ? params.brand : "all",
        type: typeof params.category === "string" ? params.category : "all",
        size: typeof params.packaging === "string" ? params.packaging : "all",
        sort:
            typeof params.sortby === "string"
                ? sortMap[params.sortby] || ""
                : "",
    };

    return (
        <>
            <Header />
            <ProductsClient
                initialCategories={categories}
                initialError={error}
                initialFilters={initialFilters}
            />
            <Footer />
        </>
    );
}
