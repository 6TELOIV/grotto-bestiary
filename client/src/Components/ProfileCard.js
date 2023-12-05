import "./ProfileCard.css";
import { getCards, toDisplayName } from "../Helpers/APIHelpers";
import Twemoji from "react-twemoji";
import copy from "copy-to-clipboard";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import { useCallback, useEffect, useState } from "react";
import { debounce, has } from "lodash";
import { getCountryName, getFlagEmoji } from "../Helpers/TextHelper";
import { NavLink } from "react-router-dom";
import InfoBox from "./InfoBox";
import { twemojiOptions } from '../Helpers/TwemojiHelper';

function ProfileCard({ user }) {
    const discordName =
        user.username +
        (user.discriminator !== "0" ? "#" + user.discriminator : "");
    const [tooltip, setTooltip] = useState("Copy to Clipboard");
    const [tooltipVariant, setTooltipVariant] = useState("dark");
    const [copiedIndex, setCopiedIndex] = useState(0);
    const copiedMessages = [
        "Copied!",
        "Double Copy!",
        "Triple Copy!",
        "Dominating!!",
        "Rampage!!",
        "Mega Copy!!",
        "Unstoppable!!",
        "Wicked Sick!!",
        "Monster Copy!!!",
        "GODLIKE!!!",
        "BEYOND GODLIKE!!!!",
    ];
    
    const [hasCollectorBadge, setHasCollectorBadge] = useState(false);
    const [hasFullSetBadge, setHasFullSetBadge] = useState(false);
    
    useEffect(() => {
        async function checkBadges() {
            let hasCollectorBadge = true;
            let hasFullSetBadge = true;
            const allCards = await getCards({});
            // count how many of each card the user has, and set badge status based on that
            for (const card of allCards) {
                const count = user.inventory.filter((c) => c._id === card._id).reduce((a, b) => a + b.Qty, 0);
                if (count < 1) {
                    hasCollectorBadge = false;
                    hasFullSetBadge = false;
                    break;
                }
                if (card.Type !== "Challenger") {
                    if (count < 3) {
                        hasFullSetBadge = false;
                    }
                }
            }
            setHasCollectorBadge(hasCollectorBadge);
            setHasFullSetBadge(hasFullSetBadge);
        }
        checkBadges();
    }, [user])

    function copyDiscord() {
        copy(discordName);
        setTooltip(
            copiedMessages[Math.min(copiedIndex, copiedMessages.length - 1)]
        );
        setCopiedIndex(copiedIndex + 1);
        setTooltipVariant("success");
        debouncedSaveChanges();
    }
    function clearTooltip() {
        setTooltip("Copy to Clipboard");
        setTooltipVariant("light");
        setCopiedIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSaveChanges = useCallback(debounce(clearTooltip, 1000), []);

    const profilepic = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}?size=1024`;
    const bannerUrl = `https://cdn.discordapp.com/banners/${user.id}/${user.banner}?size=1024`;
    const headerStyle = {
        backgroundColor: user.banner_color ?? "rgb(51, 1, 1)",
    };

    const regionEmoji = getFlagEmoji(user.region ?? "UN");

    return (
        <InfoBox className="profile-card">
            <div className="profile-header" style={headerStyle}>
                {user.banner ? (
                    <img
                        src={bannerUrl}
                        className="profile-header-image"
                        alt="Profile Banner"
                    />
                ) : (
                    null
                )}
                <img
                    src={profilepic}
                    className="profile-picture"
                    alt="Profile"
                />
                <p
                    className="profile-badges"
                >
                    <Badge emoji={regionEmoji} tooltip={getCountryName(user.region)} id={user.id + "region"} />
                    {
                        user.supporterBadge ?
                            <Badge image={`sludge_${user.supporterBadge}.png`} tooltip="Supporter" id={user.id + "supporter"} />
                            :
                            null
                    }
                    {
                        user.uniqueTradedUsers?.length >= 5 ?
                            <Badge emoji="🤝" tooltip="This user has traded with 5 unique users" id={user.id + "trusted"} />
                            :
                            null
                    }
                    {
                        hasCollectorBadge ?
                            <Badge emoji="🎖" tooltip="This user has collected 1 of every card" id={user.id + "collector"} />
                            :
                            null
                    }
                    {
                        hasFullSetBadge ?
                            <Badge emoji="🏆" tooltip="This user has collected 3 of every non-challenger card" id={user.id + "fullset"} />
                            :
                            null
                    }
                </p>
            </div>
            <div className="profile-detials">
                <p className="profile-name">{toDisplayName(user)}</p>
                <p>
                    <img
                        src="/images/discord-mark-white.svg"
                        alt=""
                        className="emoji"
                    />
                    &nbsp;
                    <span
                        data-tooltip-id={user.id + "copied"}
                        data-tooltip-content={tooltip}
                        data-tooltip-variant={tooltipVariant}
                        className="profile-discord-name"
                        onClick={copyDiscord}
                    >
                        {discordName}
                    </span>
                    &nbsp;({user.dms ? "Open to DMs" : "Closed to DMs"})
                    <Tooltip id={user.id + "copied"} />
                    <br />
                    🗃️&nbsp;
                    <NavLink
                        to={`/inventory?${new URLSearchParams({
                            username: user.username,
                            tag: user.discriminator,
                        })}`}
                    >
                        Inventory
                    </NavLink>
                    <br />
                    🃏&nbsp;
                    <NavLink
                        to={`/decks-explorer/${encodeURIComponent(user.id)}`}
                    >
                        View Decks ({user.decks?.length})
                    </NavLink>
                    <br />
                    ✉&nbsp;
                    <NavLink
                        to={`/trades/${encodeURIComponent(user.id)}`}
                    >
                        Create Trade
                    </NavLink>
                    <br />
                    🤝&nbsp;Completed <code>{user.completedTrades ?? 0}</code> validated trades with <code>{user.uniqueTradedUsers?.length ?? 0}</code> unique users
                    <br />
                    {<span className="bio">{user.bio?.length === 0 ? "No bio provided" : user.bio ?? "No bio provided."}</span>}
                </p>
            </div>
        </InfoBox>
    );
}

export default ProfileCard;

function Badge({ id, emoji, image, tooltip }) {
    if (emoji) {
        return (
            <Twemoji options={twemojiOptions} tag="span">
                <span
                    data-tooltip-id={id}
                    data-tooltip-content={tooltip}
                >
                    {emoji}
                </span>
                <Tooltip id={id} style={{ fontSize: "initial" }} />
            </Twemoji>
        );
    } else {
        return (<>
            <span
                data-tooltip-id={id}
                data-tooltip-content={tooltip}
            >
                <img
                    className="emoji"
                    src={`/images/emotes/${image}`}
                    alt={tooltip}
                />
            </span>
            <Tooltip id={id} style={{ fontSize: "initial" }} />
        </>)
    }
}
