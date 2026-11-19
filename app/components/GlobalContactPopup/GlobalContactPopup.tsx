"use client";

import { useEffect, useState } from "react";
import ContactUsPanel from "../ContactUsPanel/ContactUsPanel";

export default function GlobalContactPopup() {
    const [showPopup, setShowPopup] = useState(false);
    const [contactContent, setContactContent] = useState("");
    type ContactInfo = {
        icon: string;
        content: string;
    };
    const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);

    useEffect(() => {
        const fetchContactPage = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/page/contact-us`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch contact page");
                }

                const data = await response.json();
                const meta = data["wck-meta"] || {};
                setContactContent(meta.contact_leftsidecontent?.[0] || "");
                setContactInfo([
                    {
                        icon: meta.contactinfoicon?.[0] || "",
                        content: meta.cnt_contact?.[0] || "",
                    },
                    {
                        icon: meta.contactinfoicon_1?.[0] || "",
                        content: meta.cnt_contact_1?.[0] || "",
                    },
                    {
                        icon: meta.contactinfoicon_2?.[0] || "",
                        content: meta.cnt_contact_2?.[0] || "",
                    },
                ]);
            } catch (error) {
                console.error("Contact API error:", error);
            }
        };

        fetchContactPage();
    }, []);

    useEffect(() => {
        const openPopup = () => setShowPopup(true);

        const handleGlobalClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const link = target.closest("a");

            if (!link) return;

            const url = new URL(link.href, window.location.origin);

            if (
                url.pathname.replace(/\/+$/, "") === "/contact" &&
                url.origin === window.location.origin
            ) {
                event.preventDefault();
                setShowPopup(true);
            }
        };

        window.addEventListener("open-contact-popup", openPopup);
        document.addEventListener("click", handleGlobalClick);

        return () => {
            window.removeEventListener("open-contact-popup", openPopup);
            document.removeEventListener("click", handleGlobalClick);
        };
    }, []);

    if (!showPopup) return null;

    return (
        <ContactUsPanel
            openOnMount
            contactContent={contactContent}
            contactInfo={contactInfo}
            onClose={() => setShowPopup(false)}
        />
    );
}