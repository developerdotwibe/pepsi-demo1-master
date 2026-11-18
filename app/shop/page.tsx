"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import PrdFilter, { FilterValues } from "../components/pruduct-list/prd-filter";
import {mapCategoryProducts, ApiCategory, Product, ProductCategory} from "../data/products";
import FloatingCart from "../components/FloatingCart";
import SmoothScroll from "../components/SmoothScroll";
import "./products.css";
import PageLoader from "../components/PageLoader";
import ProductRequestPopup from "../product-popup/ProductRequestPopup";
import ListingRequestModal from "../components/ListingRequestModal/ListingRequestModal";

export default function ProductsPage() {
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState<FilterValues>({search: "", brand: "all", type: "all", size: "all", sort: "price-desc"});

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
        return categories.map((category) => {
            let list = [...category.products];
            if (filters.search.trim()) {
                const query = filters.search.toLowerCase().trim();
                list = list.filter(
                    (p) => p.name.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query));
            }
            if (filters.brand !== "all") {
                list = list.filter((p) => p.brand === filters.brand);
            }
            if (filters.type !== "all") {
                list = list.filter((p) => p.type === filters.type);
            }
            if (filters.size !== "all") {
                list = list.filter((p) => p.size === filters.size);
            }
            if (filters.sort === "price-desc") {
                list.sort((a, b) => b.price - a.price);
            }
            else if (filters.sort === "price-asc") {
                list.sort((a, b) => a.price - b.price);
            }
            else if (filters.sort === "newest") {
                list.sort((a, b) => b.id - a.id);
            }
            else if (filters.sort === "popular") {
                list.sort((a, b) => b.totalSales - a.totalSales);
            }
            return {
                ...category,
                products: list,
            };
        }).filter((category) => category.products.length > 0);
    }, [categories, filters]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/product-by-categories`);
                if (!response.ok) {
                    throw new Error("Failed to fetch products");
                }
                const data: ApiCategory[] = await response.json();
                setCategories(mapCategoryProducts(data));
            }
            catch (err) {
                console.error("Products API error:", err);
                setError("Unable to load products. Please try again.");
            }
            finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <>
            <SmoothScroll />
            <PageLoader />
            <div className="products-page">
                <Header />

                <main className="products-page-main">
                    <div className="products-container product-list-wrapp">
                        <h2>Our Products</h2>

                        <PrdFilter
                            values={filters}
                            onChange={handleFilterChange}
                        />

                        {loading ? (
                            <div className="products-loading">
                                <p>Loading products...</p>
                            </div>
                            ) : error ? (
                            <div className="products-empty-state">
                                <h3>{error}</h3>
                                <button type="button" onClick={()=> window.location.reload()} > Try Again
                                </button>
                            </div>
                            ) : filteredCategories.length > 0 ? (
                            <div className="products-category-list">
                                {filteredCategories.map((category) => (
                                <section className="products-category-section" key={category.id}>
                                    <h2 className="products-category-title">
                                                {category.name}
                                            </h2>

                                    <div className="products-grid">
                                        {category.products.map((product, idx) => (
                                        <div className="products-card" key={product.id}>
                                            <div className="product-card-img-wrap">
                                                <div className="product-card-glow" />

                                                <Image src={product.image} alt={product.name} width={340} height={340} className="product-card-can" priority={idx < 3} />
                                            </div>

                                            <div className="product-card-info">
                                                <h3>{product.name}</h3>
                                                <p>{product.desc}</p>

                                                <Link href={product.link} className="products-card-btn"> FIND OUT MORE
                                                </Link>
                                            </div>
                                        </div>
                                        ))}
                                    </div>
                                </section>
                                ))}
                            </div>
                            ) : (
                            <div className="products-empty-state">
                                <h3>No products match your selection</h3>
                                <p>Try clearing filters or search terms.</p>

                                <button type="button" onClick={resetFilters}>
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </div>
                </main>

                <FloatingCart count={2} />

                <Footer />

                <>
                  {/* <ProductRequestPopup /> */}
                  <ListingRequestModal />
                </>
            </div>
        </>
    );
}
