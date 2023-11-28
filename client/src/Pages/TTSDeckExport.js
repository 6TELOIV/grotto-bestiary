import { Helmet } from "react-helmet";
import "./TTSDeckExport.css";
import { NavLink } from "react-router-dom";


function TTSDeckExport() {
    return (
        <div className={`tts-deck-export-container`}>
            <Helmet>
                <title>TTS Export - Grotto Bestiary</title>
            </Helmet>
            TTS Export is no longer supported with the official TTS mod release.<br />
            <b>However,</b> you  can export decks from the <NavLink to="/deck-manager">Deck Manager</NavLink> to TTS dec codes for import with the <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=3098120281">official mod</a>.<br />
            Simply create a deck and export to TTS!
        </div>
    )
}

export default TTSDeckExport;