import "./HoloCard.css";
import { useEffect, useRef, useState } from "react";

const HoloCard = ({ card, cardImgSrc, fullart = false }) => {
    const isFirefox = window.navigator.userAgent.toLowerCase().includes("firefox");

    const cardImgRef = useRef(null);

    const [cardImg, setCardImg] = useState(null);
    const [x, setX] = useState(-1);
    const [y, setY] = useState(-1);
    const [xPercent, setXPercent] = useState(0.5);
    const [yPercent, setYPercent] = useState(0.5);
    const [showHolo, setShowHolo] = useState(false);

    const [showBack, setShowBack] = useState(false);

    useEffect(() => {
        setCardImg(cardImgRef.current);
    }, []);

    useEffect(() => {
        if (!cardImg) {
            return;
        }
        setXPercent(x / cardImg?.clientWidth);
        setYPercent(y / cardImg?.clientHeight);
        if (x === -1) {
            setXPercent(0.5);
        }
        if (y === -1) {
            setYPercent(0.5);
        }
    }, [cardImg, x, y]);

    function resetXY() {
        if (!cardImg) {
            return;
        }
        setX(cardImg.clientWidth / 2);
        setY(cardImg.clientHeight / 2);
        setShowHolo(false);
    }

    /** @param {MouseEvent} event */
    function hovered(event) {
        if (!cardImg) {
            return;
        }
        const rect = cardImg.getBoundingClientRect();
        setX(event.clientX - rect.left);
        setY(event.clientY - rect.top);
        setShowHolo(true);
        event.preventDefault();
    }

    /** @param {TouchEvent} event */
    function touched(event) {
        if (!cardImg) {
            return;
        }
        const rect = cardImg.getBoundingClientRect();
        const x = event.touches[0].clientX;
        const y = event.touches[0].clientY;
        setShowHolo(true);
        // if outside of image, set to middle of image
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            resetXY();
        } else {
            setX(x - rect.left);
            setY(y - rect.top);
        }
        event.preventDefault();
    }

    function leave() {
        if (!cardImg) {
            return;
        }
        resetXY();
    }

    const classes = ["holo-card"];

    if (!isFirefox) {
        classes.push("holo-card-3d");
    }

    switch (card.HoloType) {
        case "Wave":
            classes.push("holo-wave");
            break;
        case "Bubble":
            classes.push("holo-bubble");
            break;
        case "Dots":
            classes.push("holo-dots");
            break;
        case "Shatter":
            classes.push("holo-shatter");
            break;
        case "Promo":
            classes.push("holo-promo");
            break;
        default:
            classes.push("holo-wave");
            break;
    }

    const masks = [];

    const maskFolder = fullart ? "/images/card-generic-masks-fullart" : "/images/card-generic-masks";

    switch (card.Type) {
        case "Challenger":
            classes.push("holo-challenger");
            masks.push(maskFolder + `/card-mask-challenger.png`);
            break;
        case "Grotto":
            classes.push("holo-grotto");
            masks.push(maskFolder + `/card-mask.png`);
            break;
        case "Wish":
            classes.push("holo-wish");
            masks.push(maskFolder + `/card-mask.png`);
            break;
        case "Promotional":
            break;
        default:
            classes.push("holo-beast");
            masks.push(maskFolder + `/card-mask-beast.png`);
            break;
    }

    if (showBack) {
        classes.push("holo-flipped");
    }

    const maskedCards = ["Jerma"];

    if (!fullart && maskedCards.includes(card.Name)) {
        masks.push(`/images/card-masks/${card.Name.replaceAll(":", "")}.png`);
    }

    let cardBackSrc = "/images/digital-cards/Card Back.jpg";
    if (card.Type === "Promotional") {
        cardImgSrc = "/images/digital-cards/Launch Card Base.png";
        cardBackSrc = "/images/digital-cards/Launch Card Back.png";
    }

    return (
        <>
            <div
                className={classes.join(" ")}
                style={{
                    "--x": `${x}px`,
                    "--y": `${y}px`,
                    "--x-percent": xPercent,
                    "--y-percent": yPercent,
                    "--background-x": xPercent * 0.3,
                    "--background-y": yPercent * 0.3,
                    "--holo-opacity": showHolo ? 1 : 0,
                }}
                onMouseMove={hovered}
                onTouchMove={touched}
                onMouseLeave={leave}
            >
                <img ref={cardImgRef} src={cardImgSrc} alt={card.Name} />
                
                <div
                    className="card__shine"
                    style={{
                        WebkitMaskImage: masks.map((mask) => `url(${mask})`).join(", "),
                        maskImage: masks.map((mask) => `url(${mask})`).join(", "),
                    }}
                />
                <div
                    className="card__shine2"
                    style={{
                        WebkitMaskImage: masks.map((mask) => `url(${mask})`).join(", "),
                        maskImage: masks.map((mask) => `url(${mask})`).join(", "),
                    }}
                />
                <div
                    className="card__shine3"
                    style={{
                        WebkitMaskImage: masks.map((mask) => `url(${mask})`).join(", "),
                        maskImage: masks.map((mask) => `url(${mask})`).join(", "),
                    }}
                />
                <img className="holo-card-back" src={cardBackSrc} alt="Card Back" />
            </div>
            <button className="holo-card__flip" onClick={() => setShowBack(!showBack)}>
                Flip Card 🔁
            </button>
            {isFirefox ? <span>⚠ The 3D card effect doesn't work on Firefox; please try Chrome, Edge, or Safari to see the full holographic effect.</span> : null}
        </>
    );
};

export default HoloCard;
