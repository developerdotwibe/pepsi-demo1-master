import ProductDetail from "@/app/components/ProductDetail/ProductDetail";
import Header from "@/app/components/header/Header";
import Footer from "@/app/components/footer/Footer";
import type { ApiProductDetail } from "@/app/components/ProductDetail/ProductDetail";

interface ProductPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;

    let product: ApiProductDetail | null = null;

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/product/${encodeURIComponent(slug)}`,
            {
                cache: "no-store",
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch product");
        }

        product = await response.json();
    } catch (error) {
        console.error("Product detail API error:", error);
    }

    return (
        <>
            <Header />

            {product ? (
                <ProductDetail product={product} />
            ) : (
                <main className="product-page">
                    <div className="container">
                        <h2>Unable to load product details.</h2>
                    </div>
                </main>
            )}

            <Footer />
        </>
    );
}