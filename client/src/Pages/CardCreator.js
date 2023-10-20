/* eslint-disable no-fallthrough */
import { useState } from "react";
import InfoBox from "../Components/InfoBox";
import "./CardCreator.css"
import "../Fonts/Amethyst.css"
import { useEffect } from "react";
import { useRef } from "react";
import { Helmet } from "react-helmet";

function CardCreator() {

    const [artFile, setArtFile] = useState("No file selected");
    const [iconFile, setIconFile] = useState("No file selected");

    /** @type {[HTMLImageElement, (HTMLImageElement) => void]} */
    const [artImg, setArtImg] = useState(null);
    const [iconImg, setIconImg] = useState(null);
    const [loadingArt, setLoadingArt] = useState(false);

    const [canvas, setCanvas] = useState(null);
    const [cardImg, setCardImg] = useState(null);
    const [rendered, setRendered] = useState(false);

    const canvasRef = useRef(null);
    const cardImgRef = useRef(null);

    useEffect(() => {
        setCanvas(canvasRef.current);
        setCardImg(cardImgRef.current);
    }, []);

    function setArt(e) {
        if (e.target.files.length === 0) return;
        setLoadingArt(true);
        setArtFile(e.target.files[0].name);
        const fr = new FileReader();
        fr.onload = () => {
            const img = new Image();
            img.onload = () => {
                setArtImg(img);
                setLoadingArt(false);
            }
            img.src = fr.result;
        }
        fr.readAsDataURL(e.target.files[0]);
    }

    function setIcon(e) {
        if (e.target.files.length === 0) return;
        setLoadingArt(true);
        setIconFile(e.target.files[0].name);
        const fr = new FileReader();
        fr.onload = () => {
            const img = new Image();
            img.onload = () => {
                setIconImg(img);
                setLoadingArt(false);
            }
            img.src = fr.result;
        }
        fr.readAsDataURL(e.target.files[0]);
    }

    function createCard(e) {
        // draw the base of the card, then draw the art, then any assets, then the text
        /** @type {CanvasRenderingContext2D} */
        const ctx = canvas.getContext("2d");
        ctx.shadowBlur = 7;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowColor = "rgba(0,0,0,0)";

        function drawAsset(asset) {
            ctx.drawImage(document.getElementById(asset), 154, 16, 700, 980, 0, 0, 1000, 1400);
        }

        function drawIcon(icon) {
            ctx.drawImage(icon, 775, 1185, 150, 150);
        }

        function getCroppedPosition(img, w, h) {
            const imgRatio = img.width / img.height;
            const targetRatio = w / h;
            let x = 0;
            let y = 0;
            let width = img.width;
            let height = img.height;
            if (imgRatio > targetRatio) {
                // image is wider than target
                width = img.height * targetRatio;
                x = (img.width - width) / 2;
            }
            else if (imgRatio < targetRatio) {
                // image is taller than target
                height = img.width / targetRatio;
                y = (img.height - height) / 2;
            }
            return { x, y, width, height };
        }

        function _getLines(ctx, text, maxWidth) {
            var words = text.split(" ");
            var lines = [];
            var currentLine = words[0];

            for (var i = 1; i < words.length; i++) {
                var word = words[i];
                var width = ctx.measureText(currentLine + " " + word).width;
                if (width < maxWidth) {
                    currentLine += " " + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            lines.push(currentLine);
            return lines;
        }

        function getLines(ctx, text, maxWidth) {
            const preSplit = text.split("\n");
            const lines = [];
            for (const block of preSplit) {
                lines.push(..._getLines(ctx, block, maxWidth));
            }
            return lines;
        }

        function writeBody(effect, funLines, fontSize, stroke = false, maxHeight = 340, centerText = true) {
            ctx.save();
            ctx.font = `${fontSize}px Amethysta`;
            const lineSize = 1.2 * fontSize;
            const paragraphs = effect.split("\n\n");
            const lineGroups = [];
            let totalLines = 0;
            for (const [i, paragraph] of paragraphs.entries()) {
                lineGroups[i] = getLines(ctx, paragraph, 750);
                totalLines += lineGroups[i].length;
            }
            const totalMetaLines = totalLines + (Math.max(lineGroups.length - 1, 0) * 0.3);
            const height = totalMetaLines * lineSize;
            const funLinesHeight = funLines === 0 ? 0 : ((funLines * 30) + 20);
            if (height > maxHeight - funLinesHeight) {
                writeBody(effect, funLines, fontSize - 1, stroke, maxHeight, centerText);
            } else {
                let center = (maxHeight - funLinesHeight) / 2;
                let currentLine = -totalMetaLines / 2;
                if (!centerText) {
                    center = 0;
                    currentLine = -totalMetaLines;
                }
                for (const lineGroup of lineGroups) {
                    for (const line of lineGroup) {
                        if (stroke) {
                            ctx.strokeText(line, 125, 1330 - center - funLinesHeight + (currentLine * lineSize), 750);
                        }
                        ctx.fillText(line, 125, 1330 - center - funLinesHeight + (currentLine * lineSize), 750);
                        currentLine++;
                    }
                    currentLine += 0.3;
                }
            }
            ctx.restore();
        }

        function writeName(name, x, y, fontSize) {
            ctx.save();
            ctx.font = `bold ${fontSize}px Aclonica`;
            if (ctx.measureText(name).width > 610) {
                writeName(name, x, y, fontSize - 1);
            } else {
                ctx.strokeText(name, x, y, 610);
                ctx.fillText(name, x, y, 610);
            }
            ctx.restore();
        }

        e.preventDefault();
        const card = {
            name: e.target["card-name"].value,
            type: e.target["card-type"].value,
            beastType: e.target["card-beast-type"].value,
            artStyle: e.target["card-art-style"].value,
            icon: e.target["card-icon"].value,
            rarity: e.target["card-rarity"].value,
            number: e.target["card-number"].value,
            epic: e.target["card-epic"].value === "TRUE",
            power: e.target["card-power"].value,
            goal: e.target["card-goal"].value,
            cost: e.target["card-cost"].value,
            effect: e.target["card-effect"].value.replaceAll("~", e.target["card-name"].value),
            fun: e.target["card-fun"].value.replaceAll("~", e.target["card-name"].value),
            artist: e.target["card-artist"].value,
            copyright: e.target["card-copyright"].value.replaceAll("(c)", "©"),
        }

        ctx.lineJoin = 'round';

        switch (card.type) {
            case "Challenger":
                ctx.fillStyle = "#192544";
                break;
            case "Grotto":
                ctx.fillStyle = "#1e3617";
                break;
            case "Wish":
                ctx.fillStyle = "#a14c13";
                break;
            case "Beast":
                ctx.fillStyle = "#51241f";
                break;
            default:
                throw new Error("Invalid card type");
        }

        // canvas is 1000x1400
        // cards are 2.5x3.5 inches
        // 1 inch = 400 pixels
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // draw the art
        if (artImg) {
            if (card.artStyle === "full") {
                const { x, y, width, height } = getCroppedPosition(artImg, 1000, 1400);
                ctx.drawImage(artImg, x, y, width, height, 0, 0, 1000, 1400);
            } else {
                switch (card.type) {
                    case "Challenger": {
                        const { x, y, width, height } = getCroppedPosition(artImg, 815, 1115);
                        ctx.drawImage(artImg, x, y, width, height, 92.5, 205, 815, 1115);
                        break;
                    }
                    case "Grotto":
                    case "Wish":
                    case "Beast": {
                        const { x, y, width, height } = getCroppedPosition(artImg, 815, 740);
                        ctx.drawImage(artImg, x, y, width, height, 92.5, 80, 815, 740);
                        break;
                    }
                    default:
                        throw new Error("Invalid card type");
                }
            }
        }

        // draw the text-box overlay
        switch (card.type) {
            case "Challenger":
                break;
            case "Grotto":
            case "Wish":
            case "Beast": {
                if (card.artStyle === "full") {
                    ctx.fillStyle = "rgba(0,0,0,0.25)"
                } else {
                    ctx.fillStyle = "#d3893f";
                }
                ctx.fillRect(92.5, 850, 815, 470);
                break;
            }
            default:
                throw new Error("Invalid card type");
        }

        // draw the overlay
        switch (card.type) {
            case "Challenger":
                drawAsset("challenger-overlay");
                break;
            case "Grotto":
            case "Wish":
                drawAsset("grotto-wish-overlay");
                break;
            case "Beast":
                drawAsset("beast-overlay");
                break;
            default:
                throw new Error("Invalid card type");
        }

        switch (card.icon) {
            case "jerm":
                drawIcon(document.getElementById("jerma-jerm"));
                break;
            case "gb":
                drawIcon(document.getElementById("gb"));
                break;
            case "custom":
                drawIcon(iconImg);
                break;
            case "none":
                break;
            default:
                throw new Error("Invalid card icon");
        }

        // draw the card stats
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 7;
        ctx.textAlign = "center";
        ctx.fillStyle = 'white';
        switch (card.type) {
            case "Challenger": {
                // draw the goal
                ctx.font = "bold 70px Merriweather";
                let x = 134.5, y = 287;
                ctx.strokeText(card.goal, x, y);
                ctx.fillText(card.goal, x, y);
                // draw the power
                ctx.font = "bold 105px Merriweather";
                x = 134.5;
                y = 170;
                ctx.strokeText(card.power, x, y);
                ctx.fillText(card.power, x, y);
                break;
            }
            case "Beast": {
                // draw the power
                ctx.font = "Bold 105px Merriweather";
                const x = 139, y = 168;
                ctx.strokeText(card.power, x, y);
                ctx.fillText(card.power, x, y);
            }
            case "Grotto":
            case "Wish":
                if (card.type !== "Challenger") {
                    // draw the cost
                    ctx.font = "bold 115px Merriweather";
                    const x = 134, y = 915;
                    ctx.strokeText(card.cost, x, y);
                    ctx.fillText(card.cost, x, y);
                }
                break;
            default:
                throw new Error("Invalid card type");
        }

        ctx.font = "bold 65px Aclonica";
        ctx.lineWidth = 5;
        ctx.fillStyle = '#1d0d08';
        ctx.strokeStyle = 'white';
        ctx.textAlign = "left";

        // draw card name
        switch (card.type) {
            case "Challenger":
                writeName(card.name, 225, 145, 65);
                break;
            case "Grotto":
            case "Wish":
            case "Beast":
                writeName(card.name, 225, 885, 65);
                break;
            default:
                throw new Error("Invalid card type");
        }

        // draw card text
        ctx.font = "23px Amethysta";
        switch (card.type) {
            case "Challenger": {
                ctx.textAlign = "right";
                ctx.fillText(card.rarity, 893, 113);
                ctx.fillText("#" + card.number.padStart(3, '0'), 893, 143);

                ctx.textAlign = "left";
                ctx.font = "italic 30px Amethysta";
                const typeLine = [];
                if (card.epic) {
                    typeLine.push("Epic  ");
                }
                if (card.beastType !== "") {
                    typeLine.push(card.beastType);
                }
                typeLine.push(card.type);
                ctx.fillText(typeLine.join(" "), 225, 193);

                if (card.epic) {
                    ctx.save();
                    ctx.fillStyle = 'white';
                    ctx.font = "30px Amethysta";
                    ctx.fillText("✦", 292, 193);
                    ctx.restore();
                }

                ctx.textAlign = "right";
                ctx.font = "30px Amethysta";
                ctx.fillText(card.artist, 847, 193);

                ctx.textAlign = "center";
                ctx.font = "italic 30px Amethysta";
                ctx.fillStyle = 'white';
                ctx.shadowColor = "rgba(0,0,0,0.5)";
                const funLines = []
                if (card.fun !== "") {
                    funLines.push(...getLines(ctx, card.fun, 750));
                }
                for (let i = 0; i < funLines.length; i++) {
                    ctx.fillText(funLines[i], 500, 1330 - (funLines.length * 30) + (i * 30), 750);
                }
                if (card.fun !== "") {
                    ctx.save();
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(250, 1330 - (funLines.length * 30) - 35);
                    ctx.lineTo(750, 1330 - (funLines.length * 30) - 35);
                    ctx.stroke();
                    ctx.restore();
                }
                ctx.textAlign = "left";
                ctx.font = "40px Amethysta";
                ctx.lineWidth = 4;
                writeBody(card.effect, funLines.length, 40, false, 400, false);
                ctx.shadowColor = "rgba(0,0,0,0)";
                break;
            }
            case "Grotto":
            case "Wish":
            case "Beast": {
                ctx.textAlign = "right";
                ctx.fillText(card.rarity, 893, 857);
                ctx.fillText("#" + card.number.padStart(3, '0'), 893, 887);

                ctx.textAlign = "left";
                ctx.font = "italic 30px Amethysta";
                const typeLine = [];
                if (card.epic) {
                    typeLine.push("Epic  ");
                }
                if (card.beastType !== "") {
                    typeLine.push(card.beastType);
                }
                typeLine.push(card.type);
                ctx.fillText(typeLine.join(" "), 225, 937);

                if (card.epic) {
                    ctx.save();
                    ctx.fillStyle = 'white';
                    ctx.font = "30px Amethysta";
                    ctx.fillText("✦", 292, 937);
                    ctx.restore();
                }

                ctx.textAlign = "right";
                ctx.font = "30px Amethysta";
                ctx.fillText(card.artist, 847, 937);

                if (card.artStyle === "full") {
                    ctx.fillStyle = 'white';
                    ctx.strokeStyle = 'black';
                }
                ctx.textAlign = "center";
                ctx.font = "italic 30px Amethysta";
                if (card.artStyle === "full") {
                    ctx.shadowColor = "rgba(0,0,0,0.5)";
                }
                const funLines = []
                if (card.fun !== "") {
                    funLines.push(...getLines(ctx, card.fun, 750));
                }
                for (let i = 0; i < funLines.length; i++) {
                    ctx.fillText(funLines[i], 500, 1330 - (funLines.length * 30) + (i * 30), 750);
                }
                if (card.fun !== "") {
                    ctx.save();
                    ctx.strokeStyle = ctx.fillStyle;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(250, 1330 - (funLines.length * 30) - 35);
                    ctx.lineTo(750, 1330 - (funLines.length * 30) - 35);
                    ctx.stroke();
                    ctx.restore();
                }
                ctx.textAlign = "left";
                ctx.font = "40px Amethysta";
                writeBody(card.effect, funLines.length, 40);
                ctx.shadowColor = "rgba(0,0,0,0)";
                break;
            }
            default:
                throw new Error("Invalid card type");
        }

        // draw copyright at 90 degrees
        ctx.save();
        ctx.translate(920, 1000);
        ctx.rotate(Math.PI / 2);
        ctx.font = "20px Amethysta";
        switch (card.type) {
            case "Challenger":
                ctx.fillStyle = '#9a8e88';
                break;
            case "Grotto":
                ctx.fillStyle = '#908250';
                break;
            case "Wish":
                ctx.fillStyle = '#eab165';
                break;
            case "Beast":
                ctx.fillStyle = '#b38e5e';
                break;
            default:
                throw new Error("Invalid card type");
        }
        ctx.fillText(card.copyright, 0, 0);
        ctx.restore();

        // draw the shape of the card (rounded rectangle with 1/8in=50px radius)
        ctx.beginPath();
        ctx.moveTo(50, 0);
        ctx.lineTo(950, 0);
        ctx.arcTo(1000, 0, 1000, 50, 50);
        ctx.lineTo(1000, 1350);
        ctx.arcTo(1000, 1400, 950, 1400, 50);
        ctx.lineTo(50, 1400);
        ctx.arcTo(0, 1400, 0, 1350, 50);
        ctx.lineTo(0, 50);
        ctx.arcTo(0, 0, 50, 0, 50);
        ctx.closePath();
        ctx.globalCompositeOperation = 'destination-in';
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        //copy the canvas contents to the card img as it's src
        cardImg.src = canvas.toDataURL();
        setRendered(true);
    }
    return (
        <div className="card-creator-page">
            <Helmet>
                <title>Card Creator - Grotto Bestiary</title>
            </Helmet>
            <div className="font-loader">
                <span className="Amethysta">.</span>
                <span className="Amethysta italic">.</span>
                <span className="Aclonica">.</span>
                <span className="Aclonica bold">.</span>
                <span className="Merriweather">.</span>
                <span className="Merriweather bold">.</span>
            </div>
            <h1>Card Creator</h1>
            <div className="assets">
                <img id="challenger-overlay" src="/images/card-creator-assets/challenger-overlay.png" alt="challenger-overlay" />
                <img id="beast-overlay" src="/images/card-creator-assets/beast-overlay.png" alt="beast-overlay" />
                <img id="grotto-wish-overlay" src="/images/card-creator-assets/grotto-wish-overlay.png" alt="grotto-wish-overlay" />
                <img id="jerma-jerm" src="/images/card-creator-assets/jerma-jerm.png" alt="jerma-jerm" />
                <img id="gb" src="/images/card-creator-assets/gb.png" alt="gb" />
            </div>
            <div className="card-creator">
                <InfoBox className="design-form">
                    <h2>Design</h2>
                    <form onSubmit={createCard}>
                        <label htmlFor="card-name">Name:</label>
                        <input type="text" id="card-name" name="card-name" />
                        <label htmlFor="card-type">Type:</label>
                        <select id="card-type" name="card-type">
                            <option value="Challenger">Challenger</option>
                            <option value="Grotto">Grotto</option>
                            <option value="Wish">Wish</option>
                            <option value="Beast">Beast</option>
                        </select>
                        <label htmlFor="card">Beast Type:</label>
                        <input type="text" id="card-beast-type" name="card-beast-type" />
                        <label>Art:</label>
                        <label htmlFor="card-art" className="file">
                            <input type="file" id="card-art" name="card-art" accept="image/*" onChange={setArt} />
                            <span>{artFile}</span>
                        </label>
                        <label htmlFor="card-art-style">Art Style:</label>
                        <select id="card-art-style" name="card-art-style">
                            <option value="regular">Regular</option>
                            <option value="full">Full Art</option>
                        </select>
                        <label htmlFor="card-icon">Icon:</label>
                        <select id="card-icon" name="card-icon">
                            <option value="none">None</option>
                            <option value="jerm">Jerma Jerm</option>
                            <option value="gb">GrottoBeasts</option>
                            <option value="custom">Custom</option>
                        </select>
                        <label htmlFor="card-icon-custom">Custom Icon:</label>
                        <label htmlFor="card-icon-custom" className="file">
                            <input type="file" id="card-icon-custom" name="card-icon-custom" accept="image/*" onChange={setIcon} />
                            <span>{iconFile}</span>
                        </label>
                        <label htmlFor="card-rarity">Rarity:</label>
                        <select id="card-rarity" name="card-rarity">
                            <option value="C">Common</option>
                            <option value="R">Rare</option>
                        </select>
                        <label htmlFor="card-number">Number:</label>
                        <input type="number" id="card-number" name="card-number" />
                        <label htmlFor="card-epic">Epic:</label>
                        <select id="card-epic" name="card-epic">
                            <option value="FALSE">No</option>
                            <option value="TRUE">Yes</option>
                        </select>
                        <label htmlFor="card-power">Power:</label>
                        <input type="number" id="card-power" name="card-power" />
                        <label htmlFor="card-goal">Goal:</label>
                        <input type="number" id="card-goal" name="card-goal" />
                        <label htmlFor="card-cost">Cost:</label>
                        <input type="number" id="card-cost" name="card-cost" />
                        <label htmlFor="card-effect">Effect:</label>
                        <textarea id="card-effect" name="card-effect" />
                        <i>Use ~ for card name.</i>
                        <i>New lines are preserved.</i>
                        <i>Two new lines cause a paragraph break.</i><br />
                        <label htmlFor="card-fun">Fun:</label>
                        <textarea placeholder="Use ~ for card name" id="card-fun" name="card-fun" />
                        <i>Use ~ for card name.</i>
                        <i>New lines are preserved.</i><br />
                        <label htmlFor="card-artist">Artist:</label>
                        <input type="text" id="card-artist" name="card-artist" />
                        <label htmlFor="card-copyright">Copyright:</label>
                        <input type="text" id="card-copyright" name="card-copyright" />
                        <i>(c) for ©</i>
                        <button disabled={loadingArt} type="submit">Create!</button>
                    </form>
                </InfoBox>
                <InfoBox className="card-preview">
                    <h2>Your Card</h2>
                    <img ref={cardImgRef} id="card-preview-img" style={{ display: rendered ? "block" : "none" }} src="" alt="card img" />
                    <canvas ref={canvasRef} id="card-preview-canvas" width="1000" height="1400" />
                </InfoBox>
            </div>
        </div>
    );
}

export default CardCreator;
