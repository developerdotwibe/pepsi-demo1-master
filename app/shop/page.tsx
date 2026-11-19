
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import {
    mapCategoryProducts,
    mapFilteredProducts,
    ApiCategory,
    FilteredProductsResponse,
    ProductCategory,
} from "../data/products";
import ProductsClient from "./ProductsClient";
import { FilterValues } from "../components/pruduct-list/prd-filter";

interface ProductsPageProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
    const params = await searchParams;

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

    const isFiltered =
        initialFilters.search.trim() !== "" ||
        initialFilters.brand !== "all" ||
        initialFilters.type !== "all" ||
        initialFilters.size !== "all" ||
        initialFilters.sort !== "";

    let categories: ProductCategory[] = [];
    let error = "";

    try {
        const apiParams = new URLSearchParams();

        if (isFiltered) {
            apiParams.set("search", "1");
        }

        if (initialFilters.search.trim()) {
            apiParams.set("searchname", initialFilters.search.trim());
        }

        if (initialFilters.brand !== "all") {
            apiParams.set("brand", initialFilters.brand);
        }

        if (initialFilters.type !== "all") {
            apiParams.set("category", initialFilters.type);
        }

        if (initialFilters.size !== "all") {
            apiParams.set("packaging", initialFilters.size);
        }

        const apiSortMap: Record<string, string> = {
            popular: "popularity",
            newest: "date",
            "price-asc": "price",
            "price-desc": "price-desc",
        };

        const sortValue = apiSortMap[initialFilters.sort];

        if (sortValue) {
            apiParams.set("sortby", sortValue);
        }

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/product-by-categories${isFiltered ? `?${apiParams.toString()}` : ""}`,
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        if (isFiltered) {
            if (!data.status || !Array.isArray(data.products)) {
                throw new Error("Invalid filtered products response");
            }

            categories = mapFilteredProducts(data as FilteredProductsResponse);
        } else {
            if (!Array.isArray(data)) {
                throw new Error("Invalid products response");
            }

            categories = mapCategoryProducts(data as ApiCategory[]);
        }
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
                initialFilters={initialFilters}
                initialIsFiltered={isFiltered}
            />
            <Footer />
        </>
    );
}
