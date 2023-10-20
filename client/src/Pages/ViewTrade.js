import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { getUserById, toDisplayName } from "../Helpers/APIHelpers";
import "./ViewTrade.css";
import CardTable from "../Components/CardTable";
import InfoBox from "../Components/InfoBox";
import ProfileCard from "../Components/ProfileCard";
import EmoteReplacer from "../Components/EmoteReplacer";

function ViewTrade() {
    const { trade } = useLoaderData();
    const user = JSON.parse(sessionStorage.getItem("user"));
    const [tradeActionMessage, setTradeActionMessage] = useState("");
    const [user1Full, setUser1Full] = useState(false);
    const [user2Full, setUser2Full] = useState(false);

    useEffect(() => {
        const user1FullPromise = getUserById(trade?.user1?.id);
        const user2FullPromise = getUserById(trade?.user2?.id);
        Promise.all([user1FullPromise, user2FullPromise]).then(([user1FullNew, user2FullNew]) => {
            setUser1Full(user1FullNew);
            setUser2Full(user2FullNew);
        });
    }, [trade]);

    let cannotModifyReason;
    if (trade?.user2?.id !== user?.id && trade?.user1?.id !== user?.id) {
        cannotModifyReason = "it's not your trade";
    } else if (trade?.status !== "Pending") {
        cannotModifyReason = `it's closed with status ${trade?.status}`;
    } else if (trade?.user1?.id === user?.id) {
        cannotModifyReason = `you have to wait for ${toDisplayName(trade?.user2)} to accept, reject, or modify the trade`;
    }

    let showPostTradeButtons = false;
    let whichUser;
    let otherUser;
    if (trade?.user1?.id === user?.id) {
        showPostTradeButtons = trade?.status === "Accepted";
        whichUser = "user1";
        otherUser = "user2";
    } else if (trade?.user2?.id === user?.id) {
        showPostTradeButtons = trade?.status === "Accepted";
        whichUser = "user2";
        otherUser = "user1";
    }

    const canModifyTrade = typeof cannotModifyReason === "undefined";

    async function simpleTradeAction(action, verb) {
        try {
            const result = await fetch("/trades", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action,
                    user: trade?.[otherUser],
                    tradeId: trade?._id,
                }),
            });
            if (result.ok) {
                setTradeActionMessage(`${verb} successful! Refreshing...`);
                setTimeout(() => {
                    window.location.href = "/view-trade/" + trade?._id;
                }, 3000);
            } else {
                setTradeActionMessage(`Failed to ${verb}. Error: ${(await result.json()).error_message}`);
            }
        } catch (error) {
            setTradeActionMessage(`Failed to ${verb} trade. Error: ${error}`);
        }
    }

    async function acceptTrade() {
        await simpleTradeAction("accept", "Accept");
    }

    async function rejectTrade() {
        await simpleTradeAction("reject", "Reject");
    }

    async function validateTrade() {
        await simpleTradeAction("validate", "Validate");
    }

    async function updateInventory() {
        await simpleTradeAction("inventory", "Update");
    }

    function gotoTrade() {
        window.location.href = "/trades/" + trade.user1.id;
    }

    const columnsUser1 = [
        {
            title: "📬",
            hoverText: `${toDisplayName(trade.user1)} is sending these to ${toDisplayName(trade.user2)}`,
            field: "qty",
            className: "small-column right-column inv-column",
        },
        {
            field: "Name",
        },
        {
            title: "R/C",
            field: "Rarity",
            className: "small-column center-column",
        },
    ];
    const columnsUser2 = [
        {
            title: "📬",
            hoverText: `${toDisplayName(trade.user2)} is sending these to ${toDisplayName(trade.user1)}`,
            field: "qty",
            className: "small-column right-column inv-column",
        },
        {
            field: "Name",
        },
        {
            title: "R/C",
            field: "Rarity",
            className: "small-column center-column",
        },
    ];
    const columnsMessages = [
        {
            title: "📆",
            hoverText: "Date of message",
            field: "timestamp",
            className: "right-column small-column",
            renderer: ({ timestamp }) => {
                const date = new Date(timestamp);
                const month = date.getMonth() + 1;
                const day = date.getDate();
                const year = date.getFullYear();
                return `${month}/${day}/${year}`;
            },
        },
        {
            title: "User",
            hoverText: "User who sent the message",
            field: "user",
            className: "small-column",
            renderer: ({ user }) => {
                if (user.id === trade.user1.id) {
                    return toDisplayName(trade.user1);
                } else if (user.id === trade.user2.id) {
                    return toDisplayName(trade.user2);
                } else {
                    return "Unknown";
                }
            },
        },
        {
            title: "Message",
            hoverText: "Message text",
            field: "message",
            renderer: ({ message }) => {
                return <EmoteReplacer>{message}</EmoteReplacer>;
            },
        },
    ];

    return (
        <div className="view-trade-page">
            <h1>
                Trade between {toDisplayName(trade.user1)} and {toDisplayName(trade.user2)} ({trade.status})
            </h1>
            <div className="view-trade">
                {user ? (
                    <>
                        <InfoBox className="trade-actions">
                            <h2>Trade Actions</h2>
                            {cannotModifyReason ? (
                                <>
                                    You can't modify this trade because {cannotModifyReason}.<br />
                                </>
                            ) : null}
                            <button className="action-button" onClick={acceptTrade} disabled={!canModifyTrade}>
                                Accept Trade ✅
                            </button>
                            <button className="action-button" onClick={gotoTrade} disabled={!canModifyTrade}>
                                Send Counteroffer ✉
                            </button>
                            <button className="action-button" onClick={rejectTrade} disabled={!canModifyTrade}>
                                Reject Trade 🚫
                            </button>
                            {tradeActionMessage ? <p>{tradeActionMessage}</p> : null}
                        </InfoBox>
                        {showPostTradeButtons ? (
                            <InfoBox className="trade-actions">
                                <h2>Post-Trade Actions</h2>
                                {trade?.[whichUser + "Validated"] ? (
                                    <>
                                        You have already validated this trade.
                                        <br />
                                    </>
                                ) : (
                                    <>
                                        Press "Validate Trade" once you have received the cards.
                                        <br />
                                    </>
                                )}
                                {trade?.[whichUser + "Inventory"] ? (
                                    <>
                                        You have already updated your inventory for this trade.
                                        <br />
                                    </>
                                ) : (
                                    <>
                                        Press "Update Inventory" to update the cards in your inventory from the trade.
                                        <br />
                                    </>
                                )}
                                <button className="action-button" onClick={validateTrade} disabled={trade?.[whichUser + "Validated"]}>
                                    Validate Trade ✅
                                </button>
                                <button className="action-button" onClick={updateInventory} disabled={trade?.[whichUser + "Inventory"]}>
                                    Update Inventory 📦
                                </button>
                            </InfoBox>
                        ) : null}
                        {trade.messages?.length > 0 ? (
                            <InfoBox className="trade-actions">
                                <h2>Trade Messages</h2>
                                <div className="trade-table">
                                    <CardTable
                                        columns={columnsMessages}
                                        cards={trade.messages.map((t) => {
                                            return { ...t, _id: t.timestamp };
                                        })}
                                        initialSort="timestamp"
                                        initialReverse
                                    />
                                </div>
                            </InfoBox>
                        ) : null}
                    </>
                ) : null}
                <InfoBox>
                    <h2>
                        From {toDisplayName(user1Full)} to {toDisplayName(user2Full)}
                    </h2>
                    <CardTable columns={columnsUser1} cards={trade.user1Cards} />
                </InfoBox>
                <InfoBox>
                    <h2>
                        From {toDisplayName(user2Full)} to {toDisplayName(user1Full)}
                    </h2>
                    <CardTable columns={columnsUser2} cards={trade.user2Cards} />
                </InfoBox>
                <ProfileCard user={user1Full} />
                <ProfileCard user={user2Full} />
            </div>
        </div>
    );
}

export default ViewTrade;
