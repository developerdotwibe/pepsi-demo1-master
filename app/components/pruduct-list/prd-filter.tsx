"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AnimatedDropdown from "../animatedDrop/AnimatedDropdown";
import "./product-home.css";
import Image from "next/image";

export interface FilterValues {
    search: string;
    brand: string;
    type: string;
    size: string;
    sort: string;
}

interface FilterOption {
    id: number;
    name: string;
    slug: string;
    count: number;
}

interface FilterApiResponse {
    status: boolean;
    data: {
        brand: FilterOption[];
        type: FilterOption[];
        packaging: FilterOption[];
    };
}

interface DropdownOption {
    value: string;
    label: string;
}

interface PrdFilterProps {
    values?: FilterValues;
    onChange?: (values: Partial<FilterValues>) => void;
}

export const SORT_OPTIONS = [
    { value: "", label: "Select" },
    { value: "price-desc", label: "Price High to Low" },
    { value: "price-asc", label: "Price Low to High" },
    { value: "newest", label: "Newest" },
    { value: "popular", label: "Popular" },
];

export default function PrdFilter({ values, onChange }: PrdFilterProps) {
    const router = useRouter();

    const [localValues, setLocalValues] = useState<FilterValues>({
        search: "",
        brand: "all",
        type: "all",
        size: "all",
        sort: "",
    });

    const [brandOptions, setBrandOptions] = useState<DropdownOption[]>([
        { value: "all", label: "All Brands" },
    ]);

    const [typeOptions, setTypeOptions] = useState<DropdownOption[]>([
        { value: "all", label: "All Types" },
    ]);

    const [sizeOptions, setSizeOptions] = useState<DropdownOption[]>([
        { value: "all", label: "All Serving Sizes" },
    ]);

    const currentValues = values || localValues;

    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/productsfilters`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch product filters");
                }

                const result: FilterApiResponse = await response.json();

                if (result.status && result.data) {
                    setBrandOptions([
                        { value: "all", label: "All Brands" },
                        ...result.data.brand.map((item) => ({
                            value: item.slug,
                            label: item.name,
                        })),
                    ]);

                    setTypeOptions([
                        { value: "all", label: "All Types" },
                        ...result.data.type.map((item) => ({
                            value: item.slug,
                            label: item.name,
                        })),
                    ]);

                    setSizeOptions([
                        { value: "all", label: "All Serving Sizes" },
                        ...result.data.packaging.map((item) => ({
                            value: item.slug,
                            label: item.name,
                        })),
                    ]);
                }
            } catch (error) {
                console.error("Error fetching product filters:", error);
            }
        };

        fetchFilterOptions();
    }, []);

    const navigateToShop = (filterValues: FilterValues) => {
        const params = new URLSearchParams();

        if (filterValues.search.trim()) {
            params.set("searchname", filterValues.search.trim());
        }

        if (filterValues.brand !== "all") {
            params.set("brand", filterValues.brand);
        }

        if (filterValues.type !== "all") {
            params.set("category", filterValues.type);
        }

        if (filterValues.size !== "all") {
            params.set("packaging", filterValues.size);
        }

        const sortMap: Record<string, string> = {
            popular: "popularity",
            newest: "date",
            "price-asc": "price",
            "price-desc": "price-desc",
        };

        const sortValue = sortMap[filterValues.sort];

        if (sortValue) {
            params.set("sortby", sortValue);
        }

        if (params.toString()) {
            params.set("search", "1");
        }

        router.push(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
    };

    const handleUpdate = (field: keyof FilterValues, val: string) => {
        const updatedValues = {
            ...currentValues,
            [field]: val,
        };

        if (onChange) {
            onChange({ [field]: val });
        } else {
            setLocalValues(updatedValues);
        }

        // Do not navigate while typing in the search field.
        if (field === "search") return;

        // On the homepage, navigate directly to the shop.
        // On the shop page, ProductsClient handles navigation.
        if (!onChange) {
            navigateToShop(updatedValues);
        }
    };

    const handleSearch = () => {
        navigateToShop(currentValues);
    };

    const [showFilters, setShowFilters] = useState(false);
    const [activeFilter, setActiveFilter] = useState("brand");

    return (
        <>
            <div className="prd-filter-row row desk">
                {/* Search */}
                <div className="prft-col1 col-md-2">
                    <h3>Search</h3>
                    <div className="prd-filter">
                        <input
                            type="text"
                            className="prd-filter-select"
                            placeholder="Search products..."
                            value={currentValues.search}
                            onChange={(e) => handleUpdate("search", e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSearch();
                                }
                            }}
                        />
                        <button
                            className="search-btn"
                            type="button"
                            aria-label="Search"
                            onClick={handleSearch}
                        >
                            <Image
                                src="/images/icons/search-icon.svg"
                                alt="Search Icon"
                                width={19}
                                height={19}
                                sizes="(max-width: 768px) 80vw, 25vw"
                                style={{ objectFit: "contain" }}
                            />
                        </button>
                    </div>
                </div>

                {/* Brand */}
                <div className="prft-col1 col-md-2">
                    <h3>Brand</h3>
                    <div className="filter-col">
                        <AnimatedDropdown
                            options={brandOptions}
                            value={currentValues.brand}
                            onChange={(val) => handleUpdate("brand", val)}
                            placeholder="All Brands"
                        />
                    </div>
                </div>

                {/* Type */}
                <div className="prft-col1 col-md-2">
                    <h3>Type</h3>
                    <div className="filter-col">
                        <AnimatedDropdown
                            options={typeOptions}
                            value={currentValues.type}
                            onChange={(val) => handleUpdate("type", val)}
                            placeholder="All Types"
                        />
                    </div>
                </div>

                {/* Serving Size */}
                <div className="prft-col1 col-md-2">
                    <h3>Serving Size</h3>
                    <div className="filter-col">
                        <AnimatedDropdown
                            options={sizeOptions}
                            value={currentValues.size}
                            onChange={(val) => handleUpdate("size", val)}
                            placeholder="All Serving Sizes"
                        />
                    </div>
                </div>

                {/* Sort By - Static */}
                <div className="prft-col1 col-md-2">
                    <h3>Sort By</h3>
                    <div className="filter-col">
                        <AnimatedDropdown
                            options={SORT_OPTIONS}
                            value={currentValues.sort}
                            onChange={(val) => handleUpdate("sort", val)}
                            placeholder="Price High to Low"
                        />
                    </div>
                </div>
            </div>

            <div className="prd-filter-row row mob">

                {/* Search */}
                <div className="prft-col1 col-md-2">
                    <h3>Search</h3>
                    <div className="prd-filter">
                        <input
                            type="text"
                            className="prd-filter-select"
                            placeholder="Search products..."
                            value={currentValues.search}
                            onChange={(e) => handleUpdate("search", e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSearch();
                            }}
                        />
                        <button
                            className="search-btn"
                            type="button"
                            aria-label="Search"
                            onClick={handleSearch}
                        >
                            <Image
                                src="/images/icons/search-icon.svg"
                                alt="Search Icon"
                                width={19}
                                height={19}
                                sizes="(max-width: 768px) 80vw, 25vw"
                                style={{ objectFit: "contain" }}
                            />
                        </button>
                    </div>
                </div>

                {/* Filter Button */}
                <div className="filter-main-wrapper">
                    <button
                        className="filter-main-btn"
                        onClick={() => setShowFilters(prev => !prev)}
                        aria-expanded={showFilters}
                    >   <Image
                                src="/images/icons/filter-icon.svg"
                                alt="Search Icon"
                                width={19}
                                height={19}
                                sizes="(max-width: 768px) 80vw, 25vw"
                                style={{ objectFit: "contain" }}
                            />
                        <span>Filter</span>
                        <span>{showFilters ? "−" : "+"}</span>
                    </button>

                    {/* Tab Panel */}
                    {showFilters && (
                        <div className="filter-tab-panel">

                            {/* Left Side - Tabs */}
                            <div className="filter-tab-buttons">

                                <button
                                    className={activeFilter === "brand" ? "active" : ""}
                                    onClick={() => setActiveFilter("brand")}
                                >
                                    Brand
                                </button>

                                <button
                                    className={activeFilter === "type" ? "active" : ""}
                                    onClick={() => setActiveFilter("type")}
                                >
                                    Type
                                </button>

                                <button
                                    className={activeFilter === "size" ? "active" : ""}
                                    onClick={() => setActiveFilter("size")}
                                >
                                    Serving Size
                                </button>

                                <button
                                    className={activeFilter === "sort" ? "active" : ""}
                                    onClick={() => setActiveFilter("sort")}
                                >
                                    Sort By
                                </button>

                            </div>

                            {/* Right Side - Tab Content */}
                            <div className="filter-tab-content">

                                {activeFilter === "brand" && (
                                    <div>
                                        <h4>Brand</h4>
                                        <div className="filter-options-list">
                                            {brandOptions.map((option) => (
                                                <label key={option.value} className="filter-option">
                                                    <input
                                                        type="radio"
                                                        name="brand"
                                                        checked={currentValues.brand === option.value}
                                                        onChange={() => handleUpdate("brand", option.value)}
                                                    />
                                                    <span>{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeFilter === "type" && (
                                    <div>
                                        <h4>Type</h4>
                                        <div className="filter-options-list">
                                            {typeOptions.map((option) => (
                                                <label key={option.value} className="filter-option">
                                                    <input
                                                        type="radio"
                                                        name="type"
                                                        checked={currentValues.type === option.value}
                                                        onChange={() => handleUpdate("type", option.value)}
                                                    />
                                                    <span>{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeFilter === "size" && (
                                    <div>
                                        <h4>Serving Size</h4>
                                        <div className="filter-options-list">
                                            {sizeOptions.map((option) => (
                                                <label key={option.value} className="filter-option">
                                                    <input
                                                        type="radio"
                                                        name="size"
                                                        checked={currentValues.size === option.value}
                                                        onChange={() => handleUpdate("size", option.value)}
                                                    />
                                                    <span>{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeFilter === "sort" && (
                                    <div>
                                        <h4>Sort By</h4>
                                        <div className="filter-options-list">
                                            {SORT_OPTIONS.map((option) => (
                                                <label key={option.value} className="filter-option">
                                                    <input
                                                        type="radio"
                                                        name="sort"
                                                        checked={currentValues.sort === option.value}
                                                        onChange={() => handleUpdate("sort", option.value)}
                                                    />
                                                    <span>{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
