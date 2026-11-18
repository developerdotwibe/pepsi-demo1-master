export interface ApiProduct {
    id: number;
    title: string;
    slug: string;
    link: string;
    image: string | null;
    price: string;
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
    desc: string;
    image: string;
    brand: string;
    type: string;
    size: string;
    price: number;
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
            type: category.slug,
            size: item.packaging || "",
            price: Number(item.price) || 0,
            link: item.link,
            totalSales: Number(item["wck-meta"]?.total_sales?.[0]) || 0,
        })),
    }));
}