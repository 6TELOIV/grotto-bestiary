import { useState } from "react";
import { Tooltip } from "react-tooltip";

function Emote({ emote, noTooltip = false }) {
    // render an emote with a tooltip
    // if the image is not found, it will be replaced with the /images/iamges/MissingTexture.png image
    const [imgError, setImgError] = useState(false);

    const tooltipId = emote + Math.random();
    return <>
        { noTooltip ? null : <Tooltip id={tooltipId} /> }
        <img
            className="emoji"
            src={imgError ? `/images/emotes/MissingTexture.png` : `/images/emotes/${emote}.png`}
            alt={emote}
            data-tooltip-content={`:${emote}:`}
            data-tooltip-id={tooltipId}
            onError={() => { setImgError(true); }}
        />
    </>
}

export default Emote;