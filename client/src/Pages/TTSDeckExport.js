import { Helmet } from "react-helmet";
import "./TTSDeckExport.css";
import { NavLink } from "react-router-dom";


function TTSDeckExport() {
    return (
        <div className={`tts-deck-export-container`}>
            <Helmet>
                <title>TTS Export - Grotto Bestiary</title>
            </Helmet>
            TTS Export has moved to the <NavLink to="/deck-manager">Deck Manager</NavLink>.<br />
            Simply create a deck and export to TTS!
        </div>
    )
}

export default TTSDeckExport;