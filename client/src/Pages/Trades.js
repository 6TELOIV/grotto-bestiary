import { useEffect, useMemo, useState } from "react";
import AutoSelect from "../Components/AutoSelect";
import CardTable from "../Components/CardTable";
import "./Trades.css";
import { Helmet } from "react-helmet";
import { getCards, getTrades, toDisplayName } from "../Helpers/APIHelpers";
import Twemoji from "react-twemoji";
import InfoBox from "../Components/InfoBox";
import { twemojiOptions } from "../Helpers/TwemojiHelper";
import { debounce } from "lodash";

function Trades() {
    const [cardOptions, setCardOptions] = useState([]);
    const [tradeSearchResults, setTrades] = useState([]);
    const [openTrades, setOpenTrades] = useState([]);
    const [searchHolo, setSearchHolo] = useState("either");
    const [card, setCard] = useState(null);
    const [loadingTradeResults, setLoadingTradeResults] = useState(false);
    const [loadingOpenTrades, setLoadingOpenTrades] = useState(true);

    const currentUser = JSON.parse(sessionStorage.getItem("user"));

    useEffect(() => {
        fetch(
            `/trades?${new URLSearchParams({
                getAll: true,
            })}`
        ).then(async (response) => {
            if (response.ok) {
                setOpenTrades(await response.json());
            } else {
                throw new Error(`Trade Fetch Failed: ${response.status} - ${response.statusText}`);
            }
            setLoadingOpenTrades(false);
        });
    }, []);

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

    const debouncedLoadTrades = useMemo(() => debounce(async (card, holo) => {
        setTrades(await getTrades(card._id, holo));
        setLoadingTradeResults(false);
    }, 500), [setTrades, setLoadingTradeResults]);

    useEffect(() => {
        if (card?._id) {
            setLoadingTradeResults(true);
            debouncedLoadTrades(card, searchHolo === "holo" ? true : (searchHolo === "nonholo" ? false : undefined));
        }
    }, [card, searchHolo, debouncedLoadTrades]);


    const tradeSearchColumns = [
        {
            title: "📤",
            field: "owned",
            hoverText: "They have this many of the card",
            className: "small-column right-column trade-column",
        },
        {
            title: "📥",
            field: "wanted",
            hoverText: "You have this many cards they want",
            className: "small-column right-column wish-column",
        },
        {
            title: "Username",
            field: "user",
            className: "left-break-column",
            linker: ({ user }) => `/trades/${encodeURIComponent(user.id)}?${new URLSearchParams({card: card._id})}`,
            renderer: ({ user }) => toDisplayName(user),
        },
    ];

    const reduceTrade = (total, card) => {
        return total + card.qty;
    };

    const openTradeColumns = [
        {
            title: "📤",
            field: "owned",
            renderer: (trade) => {
                if (trade.user1.id === currentUser.id) {
                    return trade.user1Cards.reduce(reduceTrade, 0);
                } else {
                    return trade.user2Cards.reduce(reduceTrade, 0);
                }
            },
            className: "small-column right-column trade-column hide-on-mobile",
            hoverText: "You are sending this many cards",
        },
        {
            title: "📥",
            field: "wanted",
            renderer: (trade) => {
                if (trade.user1.id === currentUser.id) {
                    return trade.user2Cards.reduce(reduceTrade, 0);
                } else {
                    return trade.user1Cards.reduce(reduceTrade, 0);
                }
            },
            className: "small-column right-column wish-column hide-on-mobile",
            hoverText: "You are receiving this many cards",
        },
        {
            title: "Username",
            field: "user",
            className: "left-break-column",
            linker: ({ user1, user2, _id }) => {
                return `/view-trade/${encodeURIComponent(_id)}`;
            },
            renderer: ({ user1, user2 }) => {
                const user = user1.id === currentUser.id ? user2 : user1;
                return toDisplayName(user);
            },
        },
        {
            title: "Status",
            field: "status",
            renderer: ({ user1, status }) => {
                if (status === "Pending") {
                    return "Pending" + (user1.id === currentUser.id ? " (Waiting for them)" : " (Waiting for you)");
                } else {
                    return status;
                }
            },
        },
        {
            title: "Last Modified",
            field: "lastAction",
            renderer: ({ lastAction }) => {
                // get MM/DD/YYYY from ISO string
                if (!lastAction) return "6/28/2023";
                const date = new Date(lastAction);
                return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
            },
        },
    ];

    return (
        <div className="trades-page">
            <Helmet>
                <title>Trades - Grotto Bestiary</title>
            </Helmet>
            <div className="trades">
                <div className="info-boxes">
                    <h2>Find Trades</h2>
                    <InfoBox>
                        <h2>🔍 Search</h2>
                        <label>Holo: </label>
                        <button
                            key={`holo-toggle-${searchHolo}`}
                            role="checkbox"
                            aria-checked={searchHolo}
                            className={`action-button holo-toggle ${searchHolo}-selected`}
                            onClick={() => {
                                switch (searchHolo) {
                                    case "holo":
                                        setSearchHolo("nonholo");
                                        break;
                                    case "nonholo":
                                        setSearchHolo("either");
                                        break;
                                    case "either":
                                        setSearchHolo("holo");
                                        break;
                                    default:
                                        setSearchHolo("holo");
                                        break;
                                }
                            }}
                        >
                            {searchHolo === "holo" ? "🌕 Holo" : (searchHolo === "either" ? "🌓 Any" : "🌑 Non-Holo")}
                        </button><br />
                        <label>Card:</label>
                        <AutoSelect options={cardOptions} onChange={setCard} placeholder="Search for a card..." />
                    </InfoBox>
                    <InfoBox>
                        <h2>💡 Key</h2>
                        <ul>
                            <li>
                                📤: Tradelist hits (number of cards on their tradelist matching your <i>search</i>)
                            </li>
                            <li>
                                📥: Wishlist hits (number of cards on their wishlist matching your <i>tradelist</i>)
                            </li>
                        </ul>
                    </InfoBox>
                    <CardTable
                        cards={tradeSearchResults}
                        columns={tradeSearchColumns}
                        getId={({ user }) => user.id}
                        loading={loadingTradeResults}
                    />
                </div>
                <div className="info-boxes">
                    <h2>Existing Trades</h2>
                    <InfoBox>
                        <Twemoji options={twemojiOptions} tag="span">
                            <h2>💡 Key</h2>
                            <ul>
                                <li>📤: Number of cards you are sending them</li>
                                <li>📥: Number of cards they are sending you</li>
                            </ul>
                        </Twemoji>
                    </InfoBox>
                    <InfoBox>
                        <h2>Open Trades</h2>
                        <div className="table-container">
                            <CardTable
                                cards={openTrades.filter((trade) => trade.status === "Pending")}
                                columns={openTradeColumns}
                                getId={({ user1, user2 }) => user1?.id + user2?.id}
                                initialSort="lastAction"
                                initialReverse
                                loading={loadingOpenTrades}
                            />
                        </div>
                    </InfoBox>
                    <InfoBox>
                        <h2>Closed Trades</h2>
                        <div className="table-container">
                            <CardTable
                                cards={openTrades.filter((trade) => trade.status !== "Pending")}
                                columns={openTradeColumns}
                                getId={({ user1, user2 }) => user1?.id + user2?.id}
                                initialSort="lastAction"
                                initialReverse
                                loading={loadingOpenTrades}
                            />
                        </div>
                    </InfoBox>
                </div>
            </div>
        </div>
    );
}

export default Trades;
