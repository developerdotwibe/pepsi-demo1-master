import Delivery from "../components/Delivery/Delivery";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";

export const metadata = {
    title: "Delivery or Warehouse Pick Up",
};

interface DeliveryApiResponse {
    title: string;
    "wck-meta"?: {
        del_warehose_intro?: string[];
        homedeliveryheading?: string[];
        warehouseheading?: string[];
        freehome_delivery_content?: string[];
        freehome_delivery_content_1?: string[];
        freehome_delivery_content_2?: string[];
        freepickupcontent?: string[];
        freepickupcontent_1?: string[];
        freepickupcontent_2?: string[];
    };
}

export default async function DeliveryPage() {
    let deliveryData: DeliveryApiResponse | null = null;

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/page/delivery`,
            {
                cache: "no-store",
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch delivery page");
        }

        deliveryData = await response.json();
    } catch (error) {
        console.error("Delivery API error:", error);
    }

    const meta = deliveryData?.["wck-meta"] || {};

    const deliveryProps = {
        pageTitle: deliveryData?.title || "Delivery or Warehouse Pick Up",
        deliveryIntro: meta.del_warehose_intro?.[0] || "",
        homeDeliveryHeading: meta.homedeliveryheading?.[0] || "Free Home Delivery",
        warehouseHeading: meta.warehouseheading?.[0] || "Free Warehouse Pick Up",
        homeDeliveryContent: [
            meta.freehome_delivery_content?.[0] || "",
            meta.freehome_delivery_content_1?.[0] || "",
            meta.freehome_delivery_content_2?.[0] || "",
        ],
        warehousePickupContent: [
            meta.freepickupcontent?.[0] || "",
            meta.freepickupcontent_1?.[0] || "",
            meta.freepickupcontent_2?.[0] || "",
        ],
    };

    return (
        <>
            <Header />
            <Delivery {...deliveryProps} />
            <Footer />
        </>
    );
}