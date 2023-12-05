import { useState } from "react";
import { cardNameToCardImageURL, cardNameToDigitalImageURL } from "../Helpers/APIHelpers";
import ButtonGroup from "./ButtonGroup";
import "./CardGallery.css"
import { doSort } from "../Helpers/SearchHelpers";
import { NavLink } from "react-router-dom";
import { hasDigitalArtList } from "../Helpers/Constants";

function CardGallery({ cards }) {
    const [sort, setSort] = useState("Number");
    const [reverseSort, setReverseSort] = useState(false);
    const [zoom, setZoom] = useState(250);

    function getLabel(sortBy) {
        if (sort === sortBy) {
            return sortBy + (reverseSort ? "↓" : "↑");
        } else {
            return sortBy;
        }
    }

    function setSortAndReverse(sortBy) {
        if (sort === sortBy) {
            setReverseSort(!reverseSort);
        } else {
            setSort(sortBy);
            setReverseSort(false);
        }
    }

    // display a grid of card images in pages of 20
    return (
        <div className="card-gallery">
            <div className="card-gallery-controls">
                <label>Sort by:</label>
                <ButtonGroup
                    selected={sort}
                    onSelect={setSortAndReverse}
                    options={[
                        {
                            label: getLabel("Number"),
                            value: "Number",
                        },
                        {
                            label: getLabel("Name"),
                            value: "Name",
                        },
                        {
                            label: getLabel("Power"),
                            value: "Power",
                        },
                        {
                            label: getLabel("Goal"),
                            value: "Goal",
                        },
                        {
                            label: getLabel("Cost"),
                            value: "Cost",
                        },
                    ]} />
                <label>Zoom:</label>
                <input
                    type="range"
                    onChange={(e) => setZoom(e.target.value)}
                    min="50" max={window.screen.availWidth} value={zoom} step="1"
                />
            </div>
            <div className="card-gallery-images" style={{
                "--gallery-zoom": zoom + "px",
            }}>
                {cards.sort((a, b) => doSort(a, b, sort, reverseSort)).map((card) => {
                    let cardImgSrc = cardNameToCardImageURL(card.Name);
                    if (hasDigitalArtList.includes(card.Name)) {
                        cardImgSrc = cardNameToDigitalImageURL(card.Name);
                    }
                    return <NavLink to={`/card-details?${new URLSearchParams({ cardName: card.Name }).toString()}`}>
                        <img src={cardImgSrc} alt={card.name} />
                    </NavLink>
                })}
            </div>
        </div>
    );
}

export default CardGallery;