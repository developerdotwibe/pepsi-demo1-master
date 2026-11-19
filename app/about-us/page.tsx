import AboutUs from "../components/AboutUs/AboutUs";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

export const metadata = {
    title: "About Us",
};

interface AboutApiResponse {
  title: string;
  "wck-meta"?: {
    abt_description?: string[];
    abt_feature?: string[];
    abt_feature_1?: string[];
    abt_feature_2?: string[];
    featurebottomcontent?: string[];
    abt_holidayscontent?: string[];
  };
}

export default async function AboutPage() {
    let aboutData: AboutApiResponse | null = null;

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/page/about-us`,
            {
                cache: "no-store",
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch About Us page");
        }

        aboutData = await response.json();
    } catch (error) {
        console.error("About Us API error:", error);
    }

    const aboutDescription = aboutData?.["wck-meta"]?.abt_description?.[0] || "";
    const aboutFeatures = [
        aboutData?.["wck-meta"]?.abt_feature?.[0] || "",
        aboutData?.["wck-meta"]?.abt_feature_1?.[0] || "",
        aboutData?.["wck-meta"]?.abt_feature_2?.[0] || "",
    ];
    const featureBottomContent = aboutData?.["wck-meta"]?.featurebottomcontent?.[0] || "";
    const holidaysContent = aboutData?.["wck-meta"]?.abt_holidayscontent?.[0] || "";

    return (
        <>
            <Header />
            <AboutUs
                aboutDescription={aboutDescription}
                aboutFeatures={aboutFeatures}
                featureBottomContent={featureBottomContent}
                holidaysContent={holidaysContent}
            />
            <Footer />
        </>
    );
}