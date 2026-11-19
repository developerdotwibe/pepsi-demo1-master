"use client";

import { useEffect, useRef, useState } from "react";
import "./ContactUsPanel.css";

const CLOSE_DURATION_MS = 1600; // keep in step with the CSS transition

type ContactInfo = {
    icon: string;
    content: string;
};

type ContactUsPanelProps = {
    openOnMount?: boolean;
    onClose?: () => void;
    contactContent: string;
    contactInfo: ContactInfo[];
};

export default function ContactUsPanel({
    openOnMount = false,
    onClose,
    contactContent,
    contactInfo,
}: ContactUsPanelProps) {
    const [open, setOpen] = useState(false);
    const atBottomRef = useRef(false);
    const closeTimerRef = useRef<number | null>(null);

    // Open on mount when this is its own page (/contact).
    useEffect(() => {
        if (!openOnMount) return;
        const frame = requestAnimationFrame(() => setOpen(true));
        return () => cancelAnimationFrame(frame);
    }, [openOnMount]);

    // Otherwise open once each time the user scrolls to the bottom of the page.
    useEffect(() => {
        if (openOnMount) return;

        const onScroll = () => {
            const reachedBottom =
                window.innerHeight + window.scrollY >=
                document.documentElement.scrollHeight - 8;

            if (reachedBottom && !atBottomRef.current) {
                setOpen(true);
            }
            atBottomRef.current = reachedBottom;
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [openOnMount]);

    const close = () => {
        setOpen(false);
        if (onClose) {
            closeTimerRef.current = window.setTimeout(onClose, CLOSE_DURATION_MS);
        }
    };

    // Clear a pending onClose if the component unmounts.
    useEffect(() => {
        return () => {
            if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
        };
    }, []);

    // Lock page scroll while open, and close with the Escape key.
    useEffect(() => {
        if (!open) return;

        const html = document.documentElement;
        const body = document.body;
        const prevHtml = html.style.overflow;
        const prevBody = body.style.overflow;
        html.style.overflow = "hidden";
        body.style.overflow = "hidden";

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        window.addEventListener("keydown", onKey);

        return () => {
            html.style.overflow = prevHtml;
            body.style.overflow = prevBody;
            window.removeEventListener("keydown", onKey);
        };
        // close is recreated each render but only reads stable state/props here
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    return (
        <div
            className={`cup${open ? " is-open" : ""}`}
            onClick={close}
            aria-hidden={!open}
        >
            <div
                className="cup-dialog"
                role="dialog"
                aria-modal="true"
                aria-label="Contact us"
                onClick={(e) => e.stopPropagation()}
            >
                <button type="button" className="cup-close" onClick={close} aria-label="Close">
                    &times;
                </button>

                <div className="cup-inner" data-lenis-prevent>

                    {/* <div className="cover-scroll"> */}
                        <div className="cup-left">
                            <div className="cont-box">
                                <span>Contact us</span>
                                {contactContent && (
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: contactContent,
                                        }}
                                    />
                                )}
                            </div>
                            <div className="cup-social">
                                <a href="#" aria-label="Facebook">
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                    </svg>
                                </a>
                                <a href="#" aria-label="Instagram">
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="5" />
                                        <circle cx="12" cy="12" r="4" />
                                        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div className="cup-right">
                            <h3>Pepsi Cola C-U Bottling Co.</h3>

                            <div className="cup-map">
                                <iframe
                                    title="Map showing Pepsi Cola C-U Bottling Co."
                                    src="https://www.google.com/maps?q=1306%20W%20Anthony%20Dr%2C%20Champaign%2C%20IL%2061821&output=embed"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    allowFullScreen
                                />
                            </div>

                            <ul className="cup-info">
                                {contactInfo.map((item, index) => (
                                    <li key={index}>
                                        {item.icon && (
                                            <img
                                                src={item.icon}
                                                alt=""
                                                width={16}
                                                height={16}
                                            />
                                        )}

                                        <div
                                            className={index === 2 ? "email" : undefined}
                                            dangerouslySetInnerHTML={{
                                                __html: item.content,
                                            }}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>

                    {/* </div> */}
                </div>
            </div>
        </div >
    );
}