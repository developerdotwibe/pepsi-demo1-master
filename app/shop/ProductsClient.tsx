"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import PrdFilter, {
    FilterValues,
} from "../components/pruduct-list/prd-filter";

import { ProductCategory } from "../data/products";
import FloatingCart from "../components/FloatingCart";
import SmoothScroll from "../components/SmoothScroll";
import "./products.css";
import PageLoader from "../components/PageLoader";
import ListingRequestModal from "../components/ListingRequestModal/ListingRequestModal";

interface ProductsClientProps {
    initialCategories: ProductCategory[];
    initialError: string;
    initialFilters: FilterValues;
    initialIsFiltered: boolean;
}

export default function ProductsClient({
    initialCategories,
    initialError,
    initialFilters,
    initialIsFiltered,
}: ProductsClientProps) {
    const [categories, setCategories] = useState<ProductCategory[]>(initialCategories);
    const [error, setError] = useState(initialError);
    const [isFiltered, setIsFiltered] = useState(initialIsFiltered);
    const [filters, setFilters] = useState<FilterValues>(initialFilters);
    const router = useRouter();

    const decodeHtmlEntities = (value: string) => {
        const textarea = document.createElement("textarea");
        textarea.innerHTML = value;
        return textarea.value;
    };

    // Update product data whenever the server provides new data.
    useEffect(() => {
        setCategories(initialCategories);
        setError(initialError);
        setIsFiltered(initialIsFiltered);
    }, [initialCategories, initialError, initialIsFiltered]);

    // Update filters when the URL changes, including browser Back/Forward.
    useEffect(() => {
        const sortMap: Record<string, string> = {
            popularity: "popular",
            date: "newest",
            price: "price-asc",
            "price-desc": "price-desc",
        };

        const params = new URLSearchParams(window.location.search);

        setFilters({
            search: params.get("searchname") || "",
            brand: params.get("brand") || "all",
            type: params.get("category") || "all",
            size: params.get("packaging") || "all",
            sort: sortMap[params.get("sortby") || ""] || "",
        });
    }, []);

    // Handle filter changes.
    const handleFilterChange = (updated: Partial<FilterValues>) => {
        const updatedFilters = {
            ...filters,
            ...updated,
        };

        setFilters(updatedFilters);

        // Do not navigate while the user is typing in the search field.
        if ("search" in updated && Object.keys(updated).length === 1) {
            return;
        }

        const params = new URLSearchParams();

        if (updatedFilters.search.trim()) {
            params.set("searchname", updatedFilters.search.trim());
        }

        if (updatedFilters.brand !== "all") {
            params.set("brand", updatedFilters.brand);
        }

        if (updatedFilters.type !== "all") {
            params.set("category", updatedFilters.type);
        }

        if (updatedFilters.size !== "all") {
            params.set("packaging", updatedFilters.size);
        }

        const sortMap: Record<string, string> = {
            popular: "popularity",
            newest: "date",
            "price-asc": "price",
            "price-desc": "price-desc",
        };

        const sortValue = sortMap[updatedFilters.sort];

        if (sortValue) {
            params.set("sortby", sortValue);
        }

        if (params.toString()) {
            params.set("search", "1");
        }

        router.push(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
    };

    const resetFilters = () => {
        router.push("/shop");
    };

    return (
        <>
            <SmoothScroll />
            <PageLoader />

            <div className="products-page">
                <main className="products-page-main">
                    <div className="products-container product-list-wrapp">
                        <h2>Our Products</h2>

                        <PrdFilter
                            values={filters}
                            onChange={handleFilterChange}
                        />

                        { error ? (
                            <div className="products-empty-state">
                                <h3>{error}</h3>

                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : categories.length > 0 ? (
                            <div className="products-category-list">
                                {categories.map((category) => (
                                    <section
                                        className="products-category-section"
                                        key={category.id}
                                    >
                                        {!isFiltered && (
                                            <h2 className="products-category-title">
                                                {decodeHtmlEntities(category.name)}
                                            </h2>
                                        )}

                                        <div className="products-grid">
                                            {category.products.map(
                                                (product, idx) => (
                                                    <div
                                                        className="products-card"
                                                        key={product.id}
                                                    >
                                                        <div className="product-card-img-wrap">
                                                            <div className="product-card-glow" />

                                                            <Image
                                                                src={product.image}
                                                                alt={product.name}
                                                                width={340}
                                                                height={340}
                                                                className="product-card-can"
                                                                priority={idx < 3}
                                                            />
                                                        </div>

                                                        <div className="product-card-info">
                                                            <h3>{product.name}</h3>
                                                            <p>{product.desc}</p>
                                                            <p>
                                                                {product.type === "variable" && product.priceRange
                                                                    ? `$${product.priceRange.min.toFixed(2)} - $${product.priceRange.max.toFixed(2)}`
                                                                    : `$${product.price.toFixed(2)}`}
                                                            </p>

                                                            <Link
                                                                href={`/product/${product.slug}`}
                                                                className="products-card-btn"
                                                            >
                                                                FIND OUT MORE
                                                            </Link>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        ) : (
                            <div className="products-empty-state">
                                <h3>No products match your selection</h3>
                                <p>
                                    Try clearing filters or search terms.
                                </p>

                                <button
                                    type="button"
                                    onClick={resetFilters}
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </div>
                </main>

                <FloatingCart />

                <ListingRequestModal />
            </div>
        </>
    );
}