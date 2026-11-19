"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PrdFilter, {
    FilterValues,
} from "../components/pruduct-list/prd-filter";
import {ApiCategory, FilteredProductsResponse, mapCategoryProducts, mapFilteredProducts, ProductCategory} from "../data/products";
import FloatingCart from "../components/FloatingCart";
import SmoothScroll from "../components/SmoothScroll";
import "./products.css";
import PageLoader from "../components/PageLoader";
import ListingRequestModal from "../components/ListingRequestModal/ListingRequestModal";

interface ProductsClientProps {
    initialCategories: ProductCategory[];
    initialError: string;
}

export default function ProductsClient({
    initialCategories,
    initialError,
}: ProductsClientProps) {
    const [categories, setCategories] = useState<ProductCategory[]>(initialCategories);
    const [error, setError] = useState(initialError);
    const [loading, setLoading] = useState(false);
    const [isFiltered, setIsFiltered] = useState(false);
    const [filters, setFilters] = useState<FilterValues>({
        search: "",
        brand: "all",
        type: "all",
        size: "all",
        sort: "",
    });
    const handleFilterChange = (updated: Partial<FilterValues>) => {
        setFilters((prev) => ({ ...prev, ...updated }));
    };
    const resetFilters = () => {
        setFilters({
            search: "",
            brand: "all",
            type: "all",
            size: "all",
            sort: "",
        });
    };

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const fetchFilteredProducts = async () => {
            setLoading(true);

            try {
                const params = new URLSearchParams();

                // Check whether any filter is selected
                const isFilterSelected =
                    filters.search.trim() !== "" ||
                    filters.brand !== "all" ||
                    filters.type !== "all" ||
                    filters.size !== "all" ||
                    filters.sort !== "";

                // Pass search=1 only when a filter is selected
                if (isFilterSelected) {
                    params.set("search", "1");
                }

                // Pass search text only when entered
                if (filters.search.trim()) {
                    params.set("searchname", filters.search.trim());
                }

                // Brand
                if (filters.brand !== "all") {
                    params.set("brand", filters.brand);
                }

                // Type
                if (filters.type !== "all") {
                    params.set("category", filters.type);
                }

                // Serving Size
                if (filters.size !== "all") {
                    params.set("packaging", filters.size);
                }

                // Sort By
                const sortMap: Record<string, string> = {
                    popular: "popularity",
                    newest: "date",
                    "price-asc": "price",
                    "price-desc": "price-desc",
                };

                if (filters.sort) {
                    params.set("sortby", sortMap[filters.sort]);
                }

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/product-by-categories?${params.toString()}`,
                    { cache: "no-store" }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch filtered products");
                }

                const data = await response.json();

                if (isFilterSelected) {
                    if (!data.status || !Array.isArray(data.products)) {
                        throw new Error("Invalid filtered products response");
                    }
                    setCategories(mapFilteredProducts(data as FilteredProductsResponse));
                    setIsFiltered(true);
                } else {
                    if (!Array.isArray(data)) {
                        throw new Error("Invalid products response");
                    }
                    setCategories(mapCategoryProducts(data as ApiCategory[]));
                    setIsFiltered(false);
                }

                setError("");
            } catch (err) {
                console.error("Products filter API error:", err);
                setError("Unable to load products. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchFilteredProducts();
    }, [filters]);

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

                        {loading ? (
                            <div className="products-empty-state">
                                <h3>Loading products...</h3>
                            </div>
                        ) : error ? (
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
                                                {category.name}
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

                <FloatingCart count={2} />

                <ListingRequestModal />
            </div>
        </>
    );
}