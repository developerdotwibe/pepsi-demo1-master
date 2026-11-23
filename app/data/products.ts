export interface ApiProduct {
    id: number;
    title: string;
    slug: string;
    type: "simple" | "variable";
    link: string;
    image: string | null;
    price: string;
    price_range?: {
        min: string;
        max: string;
    } | null;
    regular_price: number;
    sale_price: number | null;
    stock_status: string;
    brand?: string;
    packaging?: string;
    "wck-meta"?: {
        subtitle_product?: string[];
        fb_brand?: string[];
        total_sales?: string[];
    };
}

export interface ApiCategory {
    id: number;
    name: string;
    slug: string;
    count: number;
    image: string | null;
    products: ApiProduct[];
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    desc: string;
    image: string;
    brand: string;
    type: "simple" | "variable";
    category: string;
    size: string;
    price: number;
    priceRange?: {
        min: number;
        max: number;
    } | null;
    link: string;
    totalSales: number;
}

export interface ProductCategory {
    id: number;
    name: string;
    slug: string;
    products: Product[];
}

export function mapCategoryProducts(categories: ApiCategory[]): ProductCategory[] {
    return categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        products: (category.products || []).map((item) => ({
            id: item.id,
            name: item.title,
            slug: item.slug,
            desc: item["wck-meta"]?.subtitle_product?.[0] || "",
            image: item.image || "/images/product-placeholder.png",
            brand: (
                item.brand ||
                item["wck-meta"]?.fb_brand?.[0] ||
                ""
            )
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-"),
            type: item.type,
            category: category.slug,
            size: item.packaging || "",
            price: Number(item.price) || 0,
            priceRange: item.price_range
                ? {
                    min: Number(item.price_range.min) || 0,
                    max: Number(item.price_range.max) || 0,
                }
                : null,
            link: item.link,
            totalSales: Number(item["wck-meta"]?.total_sales?.[0]) || 0,
        })),
    }));
}

export interface FilteredProduct extends ApiProduct {
    categories: {
        id: number;
        name: string;
        slug: string;
    }[];
    attributes?: {
        name: string;
        slug: string;
        options: {
            slug: string;
            label: string;
        }[];
    }[];
}

export interface FilteredProductsResponse {
    status: boolean;
    pagination: {
        current_page: number;
        per_page: number;
        total_products: number;
        total_pages: number;
        has_next_page: boolean;
        has_prev_page: boolean;
    };
    products: FilteredProduct[];
}

export function mapFilteredProducts(
    response: FilteredProductsResponse
): ProductCategory[] {
    return [
        {
            id: 0,
            name: "",
            slug: "filtered-products",
            products: response.products.map((item) => ({
                id: item.id,
                name: item.title,
                slug: item.slug,
                desc: item["wck-meta"]?.subtitle_product?.[0] || "",
                image: item.image || "/images/product-placeholder.png",
                brand: (
                    item.attributes?.find(
                        (attribute) => attribute.slug === "pa_brand"
                    )?.options?.[0]?.slug ||
                    item["wck-meta"]?.fb_brand?.[0] ||
                    ""
                )
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, "-"),
                type: item.type,
                category: item.categories?.[0]?.slug || "",
                size:
                    item.attributes?.find(
                        (attribute) => attribute.slug === "pa_packaging"
                    )?.options?.[0]?.slug || "",
                price: Number(item.price) || 0,
                priceRange: item.price_range
                    ? {
                        min: Number(item.price_range.min) || 0,
                        max: Number(item.price_range.max) || 0,
                    }
                    : null,
                link: item.link,
                totalSales: Number(item["wck-meta"]?.total_sales?.[0]) || 0,
            })),
        },
    ];
}
