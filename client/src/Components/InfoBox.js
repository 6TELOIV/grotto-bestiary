import Twemoji from "react-twemoji";
import "./InfoBox.css";
import { twemojiOptions } from '../Helpers/TwemojiHelper';
import EmoteReplacer from "./EmoteReplacer";

function InfoBox({ children, className }) {
    return (
        <Twemoji options={twemojiOptions} noWrapper>
            <div className={`info-box ${className}`}>
                <EmoteReplacer>{children}</EmoteReplacer>
            </div>
        </Twemoji>
    );
}

export default InfoBox;