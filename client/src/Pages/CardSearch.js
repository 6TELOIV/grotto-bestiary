import "./CardSearch.css";
import CardSearchForm from "../Components/CardSearchForm";
import CardTable from "../Components/CardTable";
import { useLoaderData, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import CardGallery from "../Components/CardGallery";
import ButtonGroup from "../Components/ButtonGroup";
import InfoBox from "../Components/InfoBox"
import { useState } from "react";

function CardSearch() {
    const cards = useLoaderData();

    const navigate = useNavigate();

    const user = JSON.parse(sessionStorage.getItem("user"));

    /** @param {URLSearchParams} searchParams */
    function search(searchParams) {
        navigate(`/search?${searchParams.toString()}`);
        setQueryCollapsed(!!user?.collapseOnSearch);
    }

    const [view, setView] = useState("table");
    const [queryCollapsed, setQueryCollapsed] = useState(false);

    
    const columns = [
        {
            title: "#",
            field: "Number",
            className: "hide-on-mobile small-column right-column",
        },
        {
            field: "Name",
            className: "small-column",
            linker: (card) => `/card-details?${new URLSearchParams({ cardName: card.Name }).toString()}`
        },
        {
            title: "R/C",
            field: "Rarity",
            className: "hide-on-mobile small-column center-column",
        },
        {
            field: "Type",
            className: "hide-on-mobile",
        },
        {
            title: "✦",
            field: "Epic",
            className: "hide-on-mobile small-column center-column",
            renderer: (card) => card.Epic === "TRUE" ? "✦" : "-"
        },
        {
            title: ":power:",
            field: "Power",
            className: "hide-on-mobile small-column right-column",
        },
        {
            title: ":goal:️",
            field: "Goal",
            className: "hide-on-mobile small-column right-column",
        },
        {
            title: ":cost:",
            field: "Cost",
            className: "hide-on-mobile small-column right-column",
        },
        {
            field: "Effect"
        },
        {
            field: "Fun",
            className: "hide-on-small"
        },
        {
            field: "Artist",
            className: "hide-on-small",
            renderer: ({ Artists }) => Artists.map((a, i) => <><a href={a.Link} rel="noreferrer" target="_blank">{a.Artist}</a>{i !== Artists.length - 1 ? " & " : null}</>)
        },
    ]

    return (
        <div className={`card-search-container`}>
            <Helmet>
                <title>Card Search - Grotto Bestiary</title>
            </Helmet>
            <InfoBox className="query-container">
                <h2>Query</h2>
                <button className={"query-collapse"} onClick={() => setQueryCollapsed(!queryCollapsed)} role="checkbox" aria-checked={queryCollapsed}>
                    { queryCollapsed ? "Expand" : "Collapse "}
                </button>
                <CardSearchForm search={search} collapsed={queryCollapsed} />
            </InfoBox>
            <h2>Results ({cards.length} cards):</h2>
            <ButtonGroup
                selected={view}
                onSelect={setView}
                options={[
                    {
                        value: "table",
                    },
                    {
                        value: "gallery",
                    },
                ]} />
            <div className={`search-results ${queryCollapsed ? "query-collapsed" : ""}`}>
                {view === "table" ? <CardTable cards={cards} columns={columns} initialSort="Number" />
                    : <CardGallery cards={cards} />}
            </div>
        </div>
    );
}

export default CardSearch;
