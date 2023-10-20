import { useLoaderData } from "react-router-dom";
import "./CardDetails.css";
import { cardNameToCardImageURL, cardNameToDigitalImageURL } from "../Helpers/APIHelpers";
import { Helmet } from "react-helmet";
import Twemoji from "react-twemoji";
import { twemojiOptions } from "../Helpers/TwemojiHelper";
import ButtonGroup from "../Components/ButtonGroup";
import { useState } from "react";
import HoloCard from "../Components/HoloCard";
import { hasDigitalArtList } from "../Helpers/Constants";
import EmoteReplacer from "../Components/EmoteReplacer";

function CardDetails() {
    const card = useLoaderData();

    const hasDigitalArt = hasDigitalArtList.includes(card.Name);

    const [cardImageType, setCardImageType] = useState(hasDigitalArt ? "digital" : "scan");
    const [isFullart, setIsFullart] = useState(false);

    let cardImgSrc = cardNameToCardImageURL(card.Name);
    if (cardImageType === "digital" || cardImageType === "holo") {
        if (isFullart) {
            cardImgSrc = cardNameToDigitalImageURL(card.Name, true);
        } else {
            cardImgSrc = cardNameToDigitalImageURL(card.Name);
        }
    }

    return (
        <Twemoji options={twemojiOptions} className="card-details-container">
            <Helmet>
                <title>{`${card.Name} - Grotto Bestiary`}</title>
            </Helmet>
            <div className={"card-img" + (card.Type === "Promotional" ? " card-promo" : "")}>
                {cardImageType === "holo" ? (
                    <>
                        <HoloCard fullart={isFullart} card={card} cardImgSrc={cardImgSrc} />
                        <br />
                    </>
                ) : (
                    <img src={cardImgSrc} alt={card.Name} />
                )}
                {
                    hasDigitalArt ? null : "Digital art is not available for this card."
                }
                <ButtonGroup
                    selected={cardImageType}
                    onSelect={setCardImageType}
                    options={[
                        {
                            value: "digital",
                        },
                        {
                            value: "holo",
                        },
                        {
                            value: "scan",
                        },
                    ]}
                    disabled={
                        hasDigitalArt ? [] : ["digital", "holo"]
                    }
                />
                {(cardImageType === "holo" || cardImageType === "digital") && card.Type === "Challenger" ? (
                    <>
                        <input type="checkbox" id="full-art" name="full-art" onChange={(e) => setIsFullart(e.target.checked)} />
                        <label htmlFor="full-art">Show Full Art?</label>
                    </>
                ) : null}
            </div>
            <div className="card-text">
                <h1>
                    {card.Name}
                    {card.Epic === "TRUE" ? "✦" : ""}
                    <EmoteReplacer>
                        {card.Cost !== "-" ? ` (${card.Cost}:cost:)` : ""}
                    </EmoteReplacer>
                </h1>
                <p>{card.Effect}</p>
                <p>
                    <i>{card.Fun}</i>
                </p>
                {card.Power !== "-" || card.Goal !== "-" ? (
                    <p>
                        <EmoteReplacer>
                            {card.Power !== "-" ? `${card.Power}:power:` : ""}
                            {card.Goal !== "-" ? `${card.Goal}:goal:️` : ""}
                        </EmoteReplacer>
                    </p>
                ) : (
                    ""
                )}
                <p>
                    {card.Artists.map((a, i) => <>🎨 <ArtistLink artist={a} />{i !== card.Artists.length - 1 ? <br /> : ""}</>)}
                </p>
            </div>
        </Twemoji>
    );
}

export default CardDetails;

function ArtistLink({ artist, noMirror = false }) {
    return (
        <>
            <a href={artist.Link} rel="noreferrer" target="_blank">
                {artist.Artist}
            </a>&nbsp;
            {
                (!noMirror) && artist.Link.indexOf("https://twitter.com/" === 0) ?
                    <a href={artist.Link.replace("twitter.com", "nitter.net")} rel="noreferrer" target="_blank">
                        (Mirror)
                    </a>
                    : null
            }
        </>
    );
}
