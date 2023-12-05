import { useLocation } from "react-router-dom";
import "./NoMatch.css";

function NoMatch() {
    const location = useLocation();

    return (
        <div className="no-match">
            <img src="https://grotto-beast-cards-images.s3.us-east-2.amazonaws.com/image-missing.webp" alt="Jerma Sludge in despair" />
            <h2>404: <code>{location.pathname}</code> not found!</h2>
        </div>
    );
}

export default NoMatch;
