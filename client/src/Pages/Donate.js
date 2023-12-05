import { Helmet } from "react-helmet";
import Twemoji from "react-twemoji";
import "./Donate.css";
import InfoBox from "../Components/InfoBox";

function Donate() {
    const user = JSON.parse(sessionStorage.getItem("user"));

    return (
        <div className="donate-container">
            <Helmet>
                <title>Donate - Grotto Bestiary</title>
            </Helmet>
            <InfoBox>
                <h2>
                    ♥ Like the app?
                </h2>
                <p>
                    Hi, I'm Violet, the creator of this site. If you like it, I
                    appreciate donations! It was never my goal to profit off of
                    this site, so any donations are first used to pay for the
                    site hosting fees (approximately $5 to $25 USD per month),
                    and any extra money at the end of the month is donated to{" "}
                    <a href="https://www.thetrevorproject.org/">
                        The Trevor Project
                    </a>
                    .
                </p>
                <p>
                    <b>
                        {user ? (
                            <>
                                Include the following text anywhere in the
                                donation message to get the "Supporter" badge:{" "}
                                <code className="select-all">KO&{user.id}&FI</code>
                            </>
                        ) : (
                            `If you want to get the "Supporter" badge for your profile, login before donating.`
                        )}
                    </b>
                </p>
                <span className="flags">
                    🏳️‍🌈
                    <Flag variant="lesbian" />
                    🏳️‍⚧️
                    <Flag variant="nonbinary" />
                    <Flag variant="asexual" />
                    <Flag variant="bisexual" />
                    <Flag variant="pansexual" />
                </span>
            </InfoBox>
            <iframe
                id="kofiframe"
                src="https://ko-fi.com/6teloiv/?hidefeed=true&widget=true&embed=true&preview=true"
                height="712"
                title="6teloiv"
            ></iframe>
        </div>
    );
}

export default Donate;

function Flag({ variant }) {
    return (
        <img
            draggable="false"
            class="emoji"
            alt={variant}
            src={`/images/flags/${variant}.svg`}
        />
    );
}
