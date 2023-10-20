import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { RouterProvider, createBrowserRouter, redirect } from "react-router-dom";
import CardSearch from "./Pages/CardSearch";
import TTSDeckExport from "./Pages/TTSDeckExport";
import Login from "./Pages/Login";
import Account from "./Pages/Account";
import CardDetails from "./Pages/CardDetails";
import NoMatch from "./Pages/NoMatch";
import App from "./App";
import { getCards, getUser, getSearchResults, login, toUsername, getLoginURL, getUserById, getTradesWithUser, getTradeById } from "./Helpers/APIHelpers";
import { parseStringToRegex } from "./Helpers/SearchHelpers";
import Inventory from "./Pages/Inventory";
import Trades from "./Pages/Trades";
import Donate from "./Pages/Donate";
import TradesWithUser from "./Pages/TradesWithUser";
import ViewTrade from "./Pages/ViewTrade";
import UserLookup from "./Pages/UserLookup";
import BulkImport from "./Pages/BulkImport";
import About from "./StaticPages/About";
import EmotesList from "./StaticPages/EmotesList";
import AutoInventory from "./StaticPages/AutoInventory";
import CardCreator from "./Pages/CardCreator";
import Decks from "./Pages/Decks";

const root = ReactDOM.createRoot(document.getElementById("root"));

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "",
                loader: () => {
                    return redirect("/search");
                },
            },
            {
                path: "donate",
                element: <Donate />,
            },
            {
                path: "search",
                element: <CardSearch />,
                loader: async ({ request }) => {
                    const s = new URL(request.url).searchParams;
                    return await getSearchResults(s);
                },
            },
            {
                path: "tts",
                element: <TTSDeckExport />,
            },
            {
                path: "login",
                element: <Login />,
                loader: async ({ request }) => {
                    const s = new URL(request.url).searchParams;
                    const code = s.get("code");
                    const state = s.get("state");
                    const redirectURL = state?.substring(state.indexOf("GOTO") + 4);
                    const error = s.get("error");
                    const error_description = s.get("error_description");
                    if (code && state) {
                        try {
                            const user = await login(code, state);
                            sessionStorage.setItem("user", JSON.stringify(user));
                            return redirect(redirectURL);
                        } catch (e) {
                            return e;
                        }
                    } else {
                        if (error && error_description) {
                            return new Error(`${error} - (${error_description})`);
                        } else {
                            return null;
                        }
                    }
                },
            },
            {
                path: "account",
                element: <Account />,
                loader: async ({ request }) => {
                    let user = JSON.parse(sessionStorage.getItem("user"));
                    const s = new URL(request.url).searchParams;
                    const username = s.get("username");
                    const tag = s.get("tag");
                    if (username) {
                        const userInfo = {
                            username,
                            discriminator: tag ?? 0,
                        };
                        return {
                            user: await getUser({
                                username,
                                discriminator: tag,
                            }),
                            editable: toUsername(userInfo) === toUsername(user),
                        };
                    } else if (sessionStorage.getItem("user")) {
                        return redirect(
                            `/account?${new URLSearchParams({
                                username: user.username,
                                tag: user.discriminator,
                            })}`
                        );
                    } else {
                        return redirect(getLoginURL());
                    }
                },
            },
            {
                path: "card-details",
                element: <CardDetails />,
                loader: async ({ request }) => {
                    const cardName = new URL(request.url).searchParams.get("cardName");
                    const cards = await getCards({
                        Name: `^${parseStringToRegex(`"${cardName}"`)}$`,
                    });
                    if (cards.length !== 1) {
                        return redirect("/404/" + cardName);
                    } else {
                        return cards[0];
                    }
                },
            },
            {
                path: "deck-manager",
                element: <Decks />,
                loader: async () => {
                    const user = JSON.parse(sessionStorage.getItem("user"));
                    if (user) {
                        const decks = await fetch("/decks", {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                            },
                        });
                        return { decks: await decks.json() };
                    } else {
                        return redirect(getLoginURL("/deck-manager"));
                    }
                },
            },
            {
                path: "deck-manager/:deckId",
                element: <Decks />,
                loader: async ({ params }) => {
                    document.body.setAttribute("class", "loading");
                    const sessionUser = JSON.parse(sessionStorage.getItem("user"));
                    const deckRes = await fetch(`/decks/${params.deckId}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                    const deck = await deckRes.json();
                    if (deck.ownerID !== sessionUser?.id) {
                        return redirect(`/decks-explorer/${deck.ownerID}/${deck._id}`)
                    }
                    let currentUser = null;
                    let decks = null;
                    if (sessionUser) {
                        currentUser = await getUserById(sessionUser.id);
                        const decksRes = await fetch("/decks", {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                            },
                        });
                        decks = await decksRes.json();
                    }
                    const owner = await getUserById(deck.ownerID);
                    const cards = (await getCards({})).sort((a, b) => a.Number - b.Number);
                    const cardOptions = cards.map((card) => {
                        return {
                            value: card,
                            label: card.Number + " " + card.Name,
                        };
                    });
                    const challengerOptions = cards.filter((card) => card.Type === 'Challenger').map((card) => {
                        return {
                            value: card,
                            label: card.Number + " " + card.Name,
                        };
                    })
                    document.body.setAttribute("class", "");
                    return { decks, deck, owner, currentUser, cardOptions, challengerOptions };
                }
            },
            {
                path: "decks-explorer/:userId",
                element: <Decks linkViewer />,
                loader: async ({ params }) => {
                    const sessionUser = JSON.parse(sessionStorage.getItem("user"));
                    if (sessionUser?.id === params.userId) {
                        return redirect("/deck-manager");
                    }
                    const decks = await fetch(`/decks?id=${params.userId}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                    const user = await getUserById(params.userId);
                    return { decks: await decks.json(), userId: params.userId, user };
                },
            },
            {
                path: "decks-explorer/:userId/:deckId",
                element: <Decks linkViewer />,
                loader: async ({ params }) => {
                    const sessionUser = JSON.parse(sessionStorage.getItem("user"));
                    if (sessionUser?.id === params.userId) {
                        return redirect(`/deck-manager/${params.deckId}`);
                    }
                    let currentUser = null;
                    if (sessionUser) {
                        currentUser = await getUserById(sessionUser.id);
                    }
                    document.body.setAttribute("class", "loading");
                    const deckRes = await fetch(`/decks/${params.deckId}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                    const deck = await deckRes.json();
                    const owner = await getUserById(deck.ownerID);
                    const decksRes = await fetch(`/decks?id=${params.userId}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                    let decks = await decksRes.json();
                    const cards = (await getCards({})).sort((a, b) => a.Number - b.Number);
                    const cardOptions = cards.map((card) => {
                        return {
                            value: card,
                            label: card.Number + " " + card.Name,
                        };
                    });
                    const challengerOptions = cards.filter((card) => card.Type === 'Challenger').map((card) => {
                        return {
                            value: card,
                            label: card.Number + " " + card.Name,
                        };
                    })
                    const user = await getUserById(params.userId);
                    document.body.setAttribute("class", "");
                    return { decks, deck, owner, currentUser, cardOptions, challengerOptions, userId: params.userId, user };
                }
            },
            {
                path: "inventory",
                element: <Inventory />,
                loader: async ({ request }) => {
                    let storageUser = JSON.parse(sessionStorage.getItem("user"));
                    const username = new URL(request.url).searchParams.get("username");
                    const tag = new URL(request.url).searchParams.get("tag");
                    if (username) {
                        document.body.setAttribute("class", "loading");
                        const userInfo = {
                            username,
                            discriminator: tag ?? 0,
                        };
                        const user = await getUser(userInfo);
                        document.body.setAttribute("class", "");
                        return {
                            user,
                            editable: toUsername(userInfo) === toUsername(storageUser),
                        };
                    } else if (storageUser) {
                        return redirect(
                            `/inventory?${new URLSearchParams({
                                username: storageUser.username,
                                tag: storageUser.discriminator,
                            })}`
                        );
                    } else {
                        return redirect(getLoginURL("/inventory"));
                    }
                },
            },
            {
                path: "trades",
                element: <Trades />,
                loader: async () => {
                    if (sessionStorage.getItem("user")) {
                        return null;
                    } else {
                        return redirect(getLoginURL("/trades"));
                    }
                },
            },
            {
                path: "trades/:otherUserId",
                element: <TradesWithUser />,
                loader: async ({ request, params }) => {
                    const user = JSON.parse(sessionStorage.getItem("user"));
                    const s = new URL(request.url).searchParams;
                    if (user) {
                        const currentUserPromise = getUserById(user.id);
                        const otherUserPromise = getUserById(params.otherUserId);
                        const tradesPromise = getTradesWithUser(params.otherUserId);
                        const currentUser = await currentUserPromise;
                        const otherUser = await otherUserPromise;
                        const trades = await tradesPromise;
                        if (currentUser && otherUser) {
                            return {
                                currentUser,
                                otherUser,
                                trades,
                            };
                        } else {
                            return redirect("/404/" + params.otherUserId);
                        }
                    } else {
                        return redirect(getLoginURL("/trades/" + params.otherUserId + "?" + s));
                    }
                },
            },
            {
                path: "view-trade/:tradeId",
                element: <ViewTrade />,
                loader: async ({ params }) => {
                    const user = JSON.parse(sessionStorage.getItem("user"));
                    if (user) {
                        const trade = await getTradeById(params.tradeId);
                        if (!trade) {
                            return redirect("/404/" + params.tradeId);
                        }
                        const cards = await getCards({});
                        trade.user1Cards = trade.user1Cards.map((card) => {
                            return { ...cards.find((c) => c._id === card._id), ...card };
                        });
                        trade.user2Cards = trade.user2Cards.map((card) => {
                            return { ...cards.find((c) => c._id === card._id), ...card };
                        });
                        return {
                            trade,
                        };
                    } else {
                        return redirect(getLoginURL("/view-trade/" + params.tradeId));
                    }
                },
            },
            {
                path: "users",
                element: <UserLookup />,
                loader: async () => {
                    const user = JSON.parse(sessionStorage.getItem("user"));
                    if (user) {
                        return null;
                    } else {
                        return redirect(getLoginURL("/users"));
                    }
                },
            },
            {
                path: "import",
                element: <BulkImport />,
                loader: async () => {
                    const user = JSON.parse(sessionStorage.getItem("user"));
                    if (user) {
                        return null;
                    } else {
                        return redirect(getLoginURL("/import"));
                    }
                }
            },
            {
                path: "about",
                element: <About />,
            },
            {
                path: "emotes",
                element: <EmotesList />,
            },
            {
                path: "autoinv",
                element: <AutoInventory />,
                loader: async () => {
                    const user = JSON.parse(sessionStorage.getItem("user"));
                    if (user) {
                        // get the user and load their current autoinv settings
                        const currentUser = await getUserById(user.id);
                        return {
                            currentUser,
                        };
                    } else {
                        return redirect(getLoginURL("/autoinv"));
                    }
                }
            },
            {
                path: "create",
                element: <CardCreator />,
                loader: async () => {
                    const user = JSON.parse(sessionStorage.getItem("user"));
                    if (user) {
                        return null;
                    } else {
                        return redirect(getLoginURL("/create"));
                    }
                }
            },
            {
                path: "*",
                element: <NoMatch />,
            },
        ],
    },
]);

root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
