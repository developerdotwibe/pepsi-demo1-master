"use client";

import { useMemo, useState } from "react";
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
}

export default function ProductsClient({
    initialCategories,
    initialError,
}: ProductsClientProps) {
    const [categories] = useState<ProductCategory[]>(initialCategories);

    const [error] = useState(initialError);

    const [filters, setFilters] = useState<FilterValues>({
        search: "",
        brand: "all",
        type: "all",
        size: "all",
        sort: "price-desc",
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
            sort: "price-desc",
        });
    };

    const filteredCategories = useMemo(() => {
        return categories
            .map((category) => {
                let list = [...category.products];

                if (filters.search.trim()) {
                    const query = filters.search.toLowerCase().trim();

                    list = list.filter(
                        (p) =>
                            p.name.toLowerCase().includes(query) ||
                            p.desc.toLowerCase().includes(query)
                    );
                }

                if (filters.brand !== "all") {
                    list = list.filter(
                        (p) => p.brand === filters.brand
                    );
                }

                if (filters.type !== "all") {
                    list = list.filter(
                        (p) => p.type === filters.type
                    );
                }

                if (filters.size !== "all") {
                    list = list.filter(
                        (p) => p.size === filters.size
                    );
                }

                if (filters.sort === "price-desc") {
                    list.sort((a, b) => b.price - a.price);
                } else if (filters.sort === "price-asc") {
                    list.sort((a, b) => a.price - b.price);
                } else if (filters.sort === "newest") {
                    list.sort((a, b) => b.id - a.id);
                } else if (filters.sort === "popular") {
                    list.sort((a, b) => b.totalSales - a.totalSales);
                }

                return {
                    ...category,
                    products: list,
                };
            })
            .filter((category) => category.products.length > 0);
    }, [categories, filters]);

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

                        {error ? (
                            <div className="products-empty-state">
                                <h3>{error}</h3>

                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : filteredCategories.length > 0 ? (
                            <div className="products-category-list">
                                {filteredCategories.map((category) => (
                                    <section
                                        className="products-category-section"
                                        key={category.id}
                                    >
                                        <h2 className="products-category-title">
                                            {category.name}
                                        </h2>

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