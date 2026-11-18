
import { Suspense } from "react";
import FloatingCart from "./components/FloatingCart";
import Footer from "./components/footer/Footer";
import Header from "./components/header/Header";
import { HomeCont2 } from "./components/home-contn2/HomeCont2";
import HomeCont1 from "./components/home-contnt1/HomeCont1";
import PageLoader from "./components/PageLoader";
import PepsiHero from "./components/PepsiHero";
import ProductListHome from "./components/pruduct-list/product-home-list";
import SmoothScroll from "./components/SmoothScroll";
import type { HomePageData } from "./types/home";

async function HomeContent() {
    let data: HomePageData | null = null;

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/page/home`,
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch homepage data");
        }

        data = await response.json();
    } catch (error) {
        console.error("Error fetching homepage data:", error);
    }

    const meta = data?.["wck-meta"] || {};

    return (
        <>
            <SmoothScroll />
            <PageLoader />
            <main>
                <Header />
                <PepsiHero
                    bannerText={meta.banner_text_new?.[0] || ""}
                />
                <ProductListHome />
                <HomeCont1
                    description={meta.hmdescription?.[0] || ""}
                    videoUrl={meta.description_backgroundurl?.[0] || ""}
                />
                <HomeCont2
                    aboutContent={meta.home_about_content?.[0] || ""}
                    backgroundImage={meta.home_about_backgroundimg?.[0] || ""}
                />
                <FloatingCart count={2} />
                <Footer />
            </main>
        </>
    );
}

export default function Home() {
    return (
        <Suspense fallback={<main />}>
            <HomeContent />
        </Suspense>
    );
}
