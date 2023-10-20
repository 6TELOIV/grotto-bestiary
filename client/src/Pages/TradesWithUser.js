import { useLoaderData } from "react-router-dom";
import "./TradesWithUser.css";
import { getCards, toDisplayName } from "../Helpers/APIHelpers";
import { useEffect, useState } from "react";
import ProfileCard from "../Components/ProfileCard";
import ButtonGroup from "../Components/ButtonGroup";
import CardTable from "../Components/CardTable";
import AutoSelect from "../Components/AutoSelect";
import InfoBox from "../Components/InfoBox";

function TradesWithUser() {
    const { currentUser: currentUserInit, otherUser: otherUserInit, trades } = useLoaderData();
    const [currentUser, setCurrentUser] = useState(currentUserInit);
    const [otherUser, setOtherUser] = useState(otherUserInit);

    const [cardOptions, setCardOptions] = useState([]);

    const [sendTradesFilter, setSendTradesFilter] = useState("trades");
    const [receiveTradesFilter, setReceiveTradesFilter] = useState("trades");

    const [sendCardFilter, setSendCardFilter] = useState();
    const [receiveCardFilter, setReceiveCardFilter] = useState();

    const [canModifyTrade, setCanModifyTrade] = useState(true);
    const [cannotModifyReason, setCannotModifyReason] = useState();
    const [tradeActionMessage, setTradeActionMessage] = useState();

    const [tradeMessage, setTradeMessage] = useState();

    useEffect(() => {
        getCards({}).then((cards) => {
            setCardOptions(
                cards
                    .sort((a, b) => a.Number - b.Number)
                    .map((card) => {
                        return {
                            value: card,
                            label: card.Number + " " + card.Name,
                        };
                    })
            );
        });
    }, []);

    useEffect(() => {
        const s = new URLSearchParams(window.location.search);
        const preSelectCard = s.get("card");
        const preSelectHolo = (s.get("holo") === "true");
        if (preSelectCard) {
            const card = otherUser.inventory.find((c) => (c._id === preSelectCard) && (!c.holo === !preSelectHolo));
            if (card) {
                selectUserCard(otherUser, card, true, setOtherUser);
            }
        }
        if (trades) {
            let currentUserTrades = trades.user2Cards;
            let otherUserTrades = trades.user1Cards;
            if (trades.user1.id === currentUser.id) {
                setCanModifyTrade(false);
                setCannotModifyReason(`you have to wait for ${toDisplayName(trades.user2)} to accept, reject, or modify the trade`);
                currentUserTrades = trades.user1Cards;
                otherUserTrades = trades.user2Cards;
            }
            for (const card of currentUserTrades) {
                selectUserCard(currentUser, card, card.qty, () => {});
            }
            for (const card of otherUserTrades) {
                selectUserCard(otherUser, card, card.qty, () => {});
            }
        }
        setCurrentUser({
            ...currentUser,
            inventory: [...currentUser.inventory],
        });
        setOtherUser({
            ...otherUser,
            inventory: [...otherUser.inventory],
        });
    }, [trades]);

    function selectUserCard(user, card, value, setUser) {
        const theCard = user?.inventory?.find((c) => c._id === card._id && (!c.holo === !card.holo));
        if (theCard) {
            if (typeof value === "boolean") {
                theCard.TradeDealQty = value ? 1 : 0;
                theCard.selected = value;
            } else {
                theCard.TradeDealQty = value;
                theCard.selected = value > 0;
            }
            setUser({
                ...user,
                inventory: [...user.inventory],
            });
        }
    }

    async function createTrade() {
        try {
            const sendSelected = getTradeInventory(currentUser, otherUser).filter((card) => card.selected) ?? [];
            const receiveSelected = getTradeInventory(otherUser, currentUser).filter((card) => card.selected) ?? [];
            const result = await fetch("/trades", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "update",
                    user: {
                        id: otherUser.id,
                        username: otherUser.username,
                        discriminator: otherUser.discriminator,
                        global_name: otherUser.global_name,
                    },
                    user1Cards: sendSelected.map((card) => {
                        return {
                            _id: card._id,
                            qty: card.TradeDealQty,
                            holo: card.holo,
                        };
                    }),
                    user2Cards: receiveSelected.map((card) => {
                        return {
                            _id: card._id,
                            qty: card.TradeDealQty,
                            holo: card.holo,
                        };
                    }),
                    tradeMessage,
                }),
            });
            if (result.ok) {
                setTradeActionMessage("Trade created successfully! Redirecting to trades...");
                setTimeout(() => {
                    window.location.href = "/trades";
                }, 3000);
            } else {
                setTradeActionMessage("Failed to create trade. Error: " + (await result.json()).error_message);
            }
        } catch (error) {
            setTradeActionMessage("Failed to create trade. Error: " + error);
        }
    }
    const columnsSend = [
        {
            title: "🗃️",
            field: "Qty",
            hoverText: "You have this many",
            className: "small-column right-column inv-column",
        },
        {
            title: "📤",
            field: "TradeQty",
            hoverText: "You are willing to trade this many",
            className: "small-column right-column trade-column",
        },
        {
            title: "📥",
            field: "WishQty",
            hoverText: "They want this many",
            className: "small-column right-column wish-column",
        },
        {
            field: "Name",
            className: "left-break-column",
        },
        {
            title: "R/C",
            field: "Rarity",
        },
    ];
    const columnsReceive = [
        {
            title: "🗃️",
            field: "Qty",
            hoverText: "They have this many",
            className: "small-column right-column inv-column",
        },
        {
            title: "📤",
            field: "TradeQty",
            hoverText: "They are willing to trade this many",
            className: "small-column right-column trade-column",
        },
        {
            title: "📥",

            field: "WishQty",
            hoverText: "You want this many",
            className: "small-column right-column wish-column",
        },
        {
            field: "Name",
            className: "left-break-column",
        },
        {
            title: "R/C",
            field: "Rarity",
            className: "small-column center-column",
        },
    ];

    const columnsReceiveSelected = [
        {
            title: "📬",
            field: "TradeDealQty",
            hoverText: "You will receive this many",
            className: "small-column right-column",
            editable: canModifyTrade,
            onChange: (card, e) => {
                if (e.target.value === "") {
                    return;
                } else {
                    const newValue = parseInt(e.target.value);
                    if (typeof newValue === "number" && newValue >= 0) {
                        selectUserCard(otherUser, card, newValue, setOtherUser);
                    } else {
                        e.preventDefault();
                    }
                }
            },
        },
        {
            title: "🗃️",
            field: "Qty",
            hoverText: "They have this many",
            className: "small-column right-column inv-column",
        },
        {
            title: "📤",
            field: "TradeQty",
            hoverText: "They are willing to trade this many",
            className: "small-column right-column trade-column",
        },
        {
            title: "📥",
            field: "WishQty",
            hoverText: "You want this many",
            className: "small-column right-column wish-column",
        },
        {
            field: "Name",
            className: "left-break-column",
        },
        {
            title: "R/C",
            field: "Rarity",
            className: "small-column center-column",
        },
    ];
    const columnsSendSelected = [
        {
            title: "📬",
            field: "TradeDealQty",
            hoverText: "You will send this many",
            className: "small-column right-column",
            editable: canModifyTrade,
            onChange: (card, e) => {
                if (e.target.value === "") {
                    return;
                } else {
                    const newValue = parseInt(e.target.value);
                    if (typeof newValue === "number" && newValue >= 0) {
                        selectUserCard(currentUser, card, newValue, setCurrentUser);
                    } else {
                        e.preventDefault();
                    }
                }
            },
        },
        {
            title: "🗃️",
            field: "Qty",
            hoverText: "You have this many",
            className: "small-column right-column inv-column",
        },
        {
            title: "📤",
            field: "TradeQty",
            hoverText: "You are willing to trade this many",
            className: "small-column right-column trade-column",
        },
        {
            title: "📥",
            field: "WishQty",
            hoverText: "They want this many",
            className: "small-column right-column wish-column",
        },
        {
            field: "Name",
            className: "left-break-column",
        },
        {
            title: "R/C",
            field: "Rarity",
        },
    ];

    const sendSelected = getTradeInventory(currentUser, otherUser).filter((card) => card.selected) ?? [];
    const receiveSelected = getTradeInventory(otherUser, currentUser).filter((card) => card.selected) ?? [];

    const sendCommons = sendSelected.filter(card => !card.holo && card.Rarity === "C").reduce((a, b) => a + b.TradeDealQty, 0);
    const sendRares = sendSelected.filter(card => !card.holo && card.Rarity === "R").reduce((a, b) => a + b.TradeDealQty, 0);
    const sendHoloCommons = sendSelected.filter(card => card.holo && card.Rarity === "C").reduce((a, b) => a + b.TradeDealQty, 0);
    const sendHoloRares = sendSelected.filter(card => card.holo && card.Rarity === "R").reduce((a, b) => a + b.TradeDealQty, 0);

    const receiveCommons = receiveSelected.filter(card => !card.holo && card.Rarity === "C").reduce((a, b) => a + b.TradeDealQty, 0);
    const receiveRares = receiveSelected.filter(card => !card.holo && card.Rarity === "R").reduce((a, b) => a + b.TradeDealQty, 0);
    const receiveHoloCommons = receiveSelected.filter(card => card.holo && card.Rarity === "C").reduce((a, b) => a + b.TradeDealQty, 0);
    const receiveHoloRares = receiveSelected.filter(card => card.holo && card.Rarity === "R").reduce((a, b) => a + b.TradeDealQty, 0);

    return (
        <div className="trades-with-page">
            <h1>Trades with {toDisplayName(otherUser)}</h1>
            <div className="trades-with">
                <ProfileCard user={otherUser} />
                {
                    // if user hasn't been online in over a week, display a warning that their inventory might be out of date
                    otherUser.last_online && new Date(otherUser.last_online) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? null : (
                        <InfoBox className="trade-actions">
                            <h2>⚠ Warning</h2>
                            <p>{toDisplayName(otherUser)} has not logged in to the site in over a week. Their inventory may be out of date.</p>
                        </InfoBox>
                    )
                }
                <InfoBox className="trade-actions">
                    <h2>Trade Actions</h2>
                    {canModifyTrade ? (
                        <>
                            <label>
                                Message <b>(Do not share sensitive information here)</b> (200 character limit)
                            </label>
                            <textarea className="trade-message" value={tradeMessage} onChange={(e) => setTradeMessage(e.target.value.substring(0, 200))} />
                        </>
                    ) : (
                        <p>You can't modify this trade because {cannotModifyReason}</p>
                    )}
                    <p>
                        <b>⚠ Warning:</b> Be sure to check the trade carefully before sending. Once you send a trade,{" "}
                        <i>you will not be able to modify it until the other user sends you a counter offer.</i>
                    </p>
                    <button className="action-button" onClick={createTrade} disabled={!canModifyTrade}>
                        Offer Trade
                    </button>
                    {canModifyTrade ? (
                        <button
                            className="action-button"
                            onClick={() => {
                                for (const card of getTradeInventory(currentUser, otherUser)) {
                                    if (card.WishQty > 0) {
                                        selectUserCard(currentUser, card, Math.min(card.TradeQty, card.WishQty), setCurrentUser);
                                    }
                                }
                                for (const card of getTradeInventory(otherUser, currentUser)) {
                                    if (card.WishQty > 0) {
                                        selectUserCard(otherUser, card, Math.min(card.TradeQty, card.WishQty), setOtherUser);
                                    }
                                }
                            }}
                        >
                            Auto select all trade/wishlist matches
                        </button>
                    ) : null}
                    {tradeActionMessage ? <p>{tradeActionMessage}</p> : null}
                </InfoBox>
                <InfoBox className="trade-tables">
                    <h2>Send Selected</h2>
                    <p className="info-box-note">💡 Cards that you send {toDisplayName(otherUser)} in a trade.</p>
                    <p className="info-box-info">
                        ℹ <i>Subtotals</i><br />
                        { sendCommons > 0 || receiveCommons > 0 ? <span>Commons: {sendCommons}<br /></span> : null }
                        { sendRares > 0 || receiveRares > 0 ? <span>Rares: {sendRares}<br /></span> : null }
                        { sendHoloCommons > 0 || receiveHoloCommons > 0 ? <span>Holo Commons ✨: {sendHoloCommons}<br /></span> : null }
                        { sendHoloRares > 0 || receiveHoloRares > 0 ? <span>Holo Rares ✨: {sendHoloRares}</span> : null }
                    </p>
                    <div className="trade-table">
                        <CardTable cards={sendSelected} columns={columnsSendSelected} />
                    </div>
                    {canModifyTrade ? (
                        <>
                            <h2>Send Available</h2>
                            <p className="info-box-note">
                                🔍 Showing cards that
                                {sendTradesFilter === "trades" ? ` ${toDisplayName(otherUser)} wants and you are willing to trade` : ` you own`}
                                {sendCardFilter ? ` and are called ${sendCardFilter.Name}` : null}
                                <br />
                            </p>
                            <ButtonGroup
                                options={[
                                    {
                                        label: "Trades",
                                        value: "trades",
                                    },
                                    {
                                        label: "All",
                                        value: "all",
                                    },
                                ]}
                                onSelect={(value) => setSendTradesFilter(value)}
                                selected={sendTradesFilter}
                            />
                            <AutoSelect
                                options={cardOptions}
                                onChange={(card) => setSendCardFilter(card)}
                                placeholder="Search for a card"
                                className="search-bar"
                            />
                            <p>
                                🗃️: you have this many
                                <br />
                                📤: you are willing to trade this many
                                <br />
                                📥: {toDisplayName(otherUser)} wants this many
                            </p>
                            <div className="trade-table">
                                <CardTable
                                    cards={(sendTradesFilter === "trades"
                                        ? getTrades(currentUser, otherUser)
                                        : getTradeInventory(currentUser, otherUser)
                                    )?.filter((card) => {
                                        if (!sendCardFilter) return true;
                                        return card._id === sendCardFilter._id;
                                    })}
                                    columns={columnsSend}
                                    selectable={canModifyTrade}
                                    showSelect
                                    onSelected={(card, value) => {
                                        selectUserCard(currentUser, card, value, setCurrentUser);
                                    }}
                                />
                            </div>
                        </>
                    ) : null}
                </InfoBox>
                <InfoBox className="trade-tables">
                    <h2>Receive Selected</h2>
                    <p className="info-box-note">💡 Cards that {toDisplayName(otherUser)} sends you in a trade.</p>
                    <p className="info-box-info">
                        ℹ <i>Subtotals</i><br />
                        { sendCommons > 0 || receiveCommons > 0 ? <span>Commons: {receiveCommons}<br /></span> : null }
                        { sendRares > 0 || receiveRares > 0 ? <span>Rares: {receiveRares}<br /></span> : null }
                        { sendHoloCommons > 0 || receiveHoloCommons > 0 ? <span>Holo Commons ✨: {receiveHoloCommons}<br /></span> : null }
                        { sendHoloRares > 0 || receiveHoloRares > 0 ? <span>Holo Rares ✨: {receiveHoloRares}</span> : null }
                    </p>
                    <div className="trade-table">
                        <CardTable cards={receiveSelected} columns={columnsReceiveSelected} />
                    </div>
                    {canModifyTrade ? (
                        <>
                            <h2>Receive Available</h2>
                            <p className="info-box-note">
                                🔍 Showing cards that
                                {receiveTradesFilter === "trades"
                                    ? ` you want and ${toDisplayName(otherUser)} is willing to trade`
                                    : ` ${toDisplayName(otherUser)} owns`}
                                {receiveCardFilter ? ` and are called ${receiveCardFilter.Name}` : null}
                                <br />
                            </p>
                            <ButtonGroup
                                options={[
                                    {
                                        label: "Trades",
                                        value: "trades",
                                    },
                                    {
                                        label: "All",
                                        value: "all",
                                    },
                                ]}
                                onSelect={(value) => setReceiveTradesFilter(value)}
                                selected={receiveTradesFilter}
                            />
                            <AutoSelect
                                options={cardOptions}
                                onChange={(card) => setReceiveCardFilter(card)}
                                placeholder="Search for a card"
                                className="search-bar"
                            />
                            <p>
                                🗃️: {toDisplayName(otherUser)} has this many
                                <br />
                                📤: {toDisplayName(otherUser)} is willing to trade this many
                                <br />
                                📥: you want this many
                            </p>
                            <div className="trade-table">
                                <CardTable
                                    cards={(receiveTradesFilter === "trades"
                                        ? getTrades(otherUser, currentUser)
                                        : getTradeInventory(otherUser, currentUser)
                                    )?.filter((card) => {
                                        if (!receiveCardFilter) return true;
                                        return card._id === receiveCardFilter._id;
                                    })}
                                    columns={columnsReceive}
                                    selectable={canModifyTrade}
                                    showSelect
                                    onSelected={(card, value) => {
                                        selectUserCard(otherUser, card, value, setOtherUser);
                                    }}
                                />
                            </div>
                        </>
                    ) : null}
                </InfoBox>
            </div>
        </div>
    );
}

export default TradesWithUser;

function getTrades(userA, userB) {
    const tradelist = userA.inventory?.filter((c) => c.TradeQty > 0);
    const wishlist = userB.inventory?.filter((c) => c.WishQty > 0);

    const newTrades = [];
    if (tradelist === undefined || wishlist === undefined) return newTrades;
    for (const tCard of tradelist) {
        const wCard = wishlist.find((wCard) => wCard._id === tCard._id && !wCard.holo === !tCard.holo);
        if (wCard) {
            newTrades.push({
                ...tCard,
                WishQty: wCard.WishQty,
                TradeQty: tCard.TradeQty,
            });
        }
    }
    return newTrades;
}

function getTradeInventory(userA, userB) {
    // return inventory but with WishQty from userB, and both Qty and TradeQty from userA
    const inventory = userA.inventory?.filter((c) => c.Qty > 0);
    const wishlist = userB.inventory;
    return (
        inventory?.map((card) => {
            const wishCard = wishlist.find((c) => c._id === card._id && !c.holo === !card.holo);
            return {
                ...card,
                WishQty: wishCard?.WishQty || 0,
            };
        }) ?? []
    );
}
