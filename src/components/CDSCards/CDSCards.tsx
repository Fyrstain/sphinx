import React from "react";
import styles from "./CDSCards.module.css";

export interface CDSCardProps {
    card: {
        indicator?: "critical" | "warning" | "info" | string;
        summary: string;
        detail?: string;
        source?: {
            url: string;
            label: string;
        };
        suggestions?: Array<{
            uuid?: string;
            label: string;
            actions?: Array<{
                description: string;
            }>;
        }>;
        links?: Array<{
            url: string;
            label: string;
        }>;
        uuid?: string;
    };
}

export interface CDSCardsProps {
    cards: CDSCardProps["card"][];
}

function CDSCard({ card }: CDSCardProps) {
    const indicatorEmoji =
        card.indicator === "critical"
            ? "❗"
            : card.indicator === "warning"
            ? "⚠️"
            : "ℹ️";

    const headerClass =
        card.indicator === "critical"
            ? styles.cardHeaderCritical
            : card.indicator === "warning"
            ? styles.cardHeaderWarning
            : styles.cardHeaderInfo;

    return (
        <div className={styles.cardWrapper}>
            <div className={`${styles.cardHeader} ${headerClass}`}>
                <span className="me-2 fs-4">{indicatorEmoji}</span>
                <h5 className="mb-0">{card.summary}</h5>
            </div>
            <div className={styles.cardBody}>
                <div>
                    {card.detail && <p>{card.detail}</p>}

                    {card.source && (
                        <p className={styles.cardSource}>
                            Source:{" "}
                            <a
                                href={card.source.url}
                                className="text-decoration-underline text-primary"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {card.source.label}
                            </a>
                        </p>
                    )}

                    {card.suggestions && card.suggestions.length > 0 && (
                        <div className="mb-2">
                            <strong>💡 Suggestions:</strong>
                            <ul className="mt-2 mb-0 ps-3">
                                {card.suggestions.map((s, idx) => (
                                    <li key={s.uuid || idx}>
                                        {s.label}
                                        {s.actions && s.actions.length > 0 && (
                                            <ul>
                                                {s.actions.map((a, i) => (
                                                    <li key={i}>{a.description}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {card.links && card.links.length > 0 && (
                    <div className={styles.cardLinks}>
                        {card.links.map((link, idx) => (
                            <a
                                key={idx}
                                href={link.url}
                                className="text-primary text-decoration-underline me-2"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                🔗 {link.label}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CDSCards({ cards }: CDSCardsProps | { cards: { cards: CDSCardProps["card"][] } }) {
    const list = Array.isArray((cards as any)?.cards)
        ? (cards as any).cards
        : (Array.isArray(cards) ? cards : []);

    if (list.length === 0) {
        return <p className="text-muted fst-italic">No cards to display.</p>;
    }

    return (
        <div className={styles.cardsContainer}>
            {list.map((card: CDSCardProps["card"], idx: number) => (
                <CDSCard card={card} key={card.uuid || idx} />
            ))}
        </div>
    );
}