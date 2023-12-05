import { NavLink, useLoaderData } from "react-router-dom";
import { Helmet } from "react-helmet";
import "./Inventory.css";
import { useCallback, useEffect, useState } from "react";
import CardTable from "../Components/CardTable";
import { getCards, getUser, modifyInventory, toDisplayName } from "../Helpers/APIHelpers";
import { debounce } from "lodash";
import AutoSelect from "../Components/AutoSelect";
import ButtonGroup from "../Components/ButtonGroup";
import ProfileCard from "../Components/ProfileCard";
import InfoBox from "../Components/InfoBox";

function Inventory() {
    const { user, editable } = useLoaderData();

    const [inventory, setInventory] = useState(user.inventory);
    const [saving, setSaving] = useState(false);
    const [pendingChanges, setPendingChanges] = useState([]);
    const [cardOptions, setCardOptions] = useState([]);
    const [selectedCard, setSelectedCard] = useState();
    const [filterCard, setFilterCard] = useState();
    const [filterType, setFilterType] = useState();
    const [filterRarity, setFilterRarity] = useState();
    const [filters, setFilter] = useState(editable ? [] : ["tradelist", "wishlist"]);

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
        setInventory(user.inventory);
    }, [user]);

    function onFilterSelect(selectedFilter) {
        if (filters.includes(selectedFilter)) {
            setFilter(filters.filter((filter) => filter !== selectedFilter));
        } else {
            setFilter([...filters, selectedFilter]);
        }
    }

    function onFilterTypeSelect(selectedFilterType) {
        if (filterType === selectedFilterType) {
            setFilterType(undefined);
        } else {
            setFilterType(selectedFilterType);
        }
    }

    function onFilterRaritySelect(selectedFilterRarity) {
        if (filterRarity === selectedFilterRarity) {
            setFilterRarity(undefined);
        } else {
            setFilterRarity(selectedFilterRarity);
        }
    }

    function updatePendingChanges(card, fieldName, newValue) {
        const change = pendingChanges.find((change) => change._id === card._id && !change.holo === !card.holo);
        if (change) {
            change[fieldName] = newValue;
        } else {
            const newChange = { _id: card._id, holo: card.holo };
            newChange[fieldName] = newValue;
            pendingChanges.push(newChange);
        }
        setPendingChanges([...pendingChanges]);
        debouncedSaveChanges([...pendingChanges]);
    }

    function incrementCard(card) {
        const invItem = inventory.find((invItem) => invItem._id === card._id && !invItem.holo === !card.holo);
        updatePendingChanges(card, "Qty", 1 + (invItem?.Qty ?? 0));
    }

    function onChange(card, e, { field }) {
        const newValue = parseInt(e.target.value);
        if (typeof newValue === "undefined" || newValue < 0) {
            e.preventDefault();
        } else {
            updatePendingChanges(card, field, newValue);
        }
    }

    const saveChanges = async (pendingChanges, delta = false) => {
        setSaving(true);
        setPendingChanges([]);
        await modifyInventory(pendingChanges, delta);
        setInventory((await getUser(user)).inventory);
        setSaving(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSaveChanges = useCallback(debounce(saveChanges, 750), []);

    const columns = [
        {
            title: "✨",
            hoverText: "Holographic",
            field: "holo",
            className: "small-column center-column left-break-column",
            renderer: (card) => (card.holo ? "✨" : "-"),
        },
        {
            title: "#",
            field: "Number",
            className: (filters.length > 0 && !editable ? "" : "hide-on-mobile") + " small-column right-column",
        },
        {
            field: "Name",
            linker: (card) =>
                `/card-details?${new URLSearchParams({
                    cardName: card.Name,
                }).toString()}`,
        },
        {
            title: "R/C",
            field: "Rarity",
            className: (filters.length > 0 && !editable ? "" : "hide-on-mobile") + " small-column center-column",
        },
    ];

    let filteredInventory = [...inventory];
    let filteredSearchOptions = [...cardOptions];

    if (filterCard) {
        filteredInventory = filteredInventory.filter((card) => filterCard._id === card._id);
    }

    if (filterType) {
        filteredInventory = filteredInventory.filter((card) => card.Type.includes(filterType));
        filteredSearchOptions = filteredSearchOptions.filter(({ value }) => value.Type.includes(filterType));
    }

    if (filterRarity) {
        filteredInventory = filteredInventory.filter((card) => card.Rarity === filterRarity);
        filteredSearchOptions = filteredSearchOptions.filter(({ value }) => value.Rarity === filterRarity);
    }

    if (filters.length > 0) {
        //filter inventory to all selected categories
        filteredInventory = filteredInventory.filter((card) => {
            return filters.some((filter) => {
                switch (filter) {
                    case "inventory":
                        return card.Qty > 0;
                    case "tradelist":
                        return card.TradeQty > 0;
                    case "wishlist":
                        return card.WishQty > 0;
                    default:
                        return false;
                }
            });
        });
        
        if (editable || filters.includes("wishlist")) {
            columns.unshift({
                title: "📥",
                hoverText: "Wishlist Quantity",
                field: "WishQty",
                className: "small-column wish-column right-column",
                editable,
                onChange,
            });
        }
        if (editable || filters.includes("tradelist")) {
            columns.unshift({
                title: "📤",
                hoverText: "Tradelist Quantity",
                field: "TradeQty",
                className: "small-column trade-column right-column",
                editable,
                onChange,
            });
        }
        if (editable || filters.includes("inventory")) {
            columns.unshift({
                title: "🗃️",
                hoverText: "Inventory Quantity",
                field: "Qty",
                className: "small-column inv-column right-column",
                editable,
                onChange,
            });
        }
    } else {
        columns.unshift(
            {
                title: "🗃️",
                hoverText: "Inventory Quantity",
                field: "Qty",
                className: "small-column inv-column right-column",
                editable,
                onChange,
            },
            {
                title: "📤",
                hoverText: "Tradelist Quantity",
                field: "TradeQty",
                className: "small-column trade-column right-column",
                editable,
                onChange,
            },
            {
                title: "📥",
                hoverText: "Wishlist Quantity",
                field: "WishQty",
                className: "small-column wish-column right-column",
                editable,
                onChange,
            }
        );
    }

    return (
        <div className="inventory-page">
            <Helmet>
                <title>Inventory - Grotto Bestiary</title>
            </Helmet>
            {editable ? (
                <h1>
                    {toDisplayName(user)}'s {filters.length > 0 ? filters.map(filter => filter.charAt(0).toUpperCase() + filter.slice(1)).sort().join("/") : "Inventory"}
                    <span className="saving-note">{saving ? " (Saving...)" : pendingChanges.length > 0 ? " (Unsaved...)" : " (Saved.)"}</span>
                </h1>
            ) : (
                null
            )}
            <div className="inventory">
                <div className="inventory-table">
                    <CardTable cards={filteredInventory} columns={columns} initialSort="Number" />
                </div>
                <div className="info-boxes">
                    {editable ? null : <ProfileCard user={user} />}
                    <InfoBox>
                        <h2>🔍 Filters</h2>
                        <ButtonGroup
                            options={[
                                {
                                    value: "inventory",
                                },
                                {
                                    value: "tradelist",
                                },
                                {
                                    value: "wishlist",
                                },
                            ]}
                            onSelect={onFilterSelect}
                            selected={filters}
                        />
                        <ButtonGroup
                            options={[
                                {
                                    value: "Challenger",
                                },
                                {
                                    value: "Grotto",
                                },
                                {
                                    value: "Wish",
                                },
                                {
                                    value: "Beast",
                                },
                            ]}
                            onSelect={onFilterTypeSelect}
                            selected={filterType}
                        />
                        <div className="button-group">
                            <div>
                                <input type="checkbox" id="rare" name="filterRarity" checked={filterRarity === "R"} onClick={() => onFilterRaritySelect("R")} />
                                <label for="rare">Rare</label>
                            </div>
                            <div>
                                <input
                                    type="checkbox"
                                    id="common"
                                    name="filterRarity"
                                    checked={filterRarity === "C"}
                                    onClick={() => onFilterRaritySelect("C")}
                                />
                                <label for="common">Common</label>
                            </div>
                        </div>
                        <AutoSelect options={filteredSearchOptions} onChange={setFilterCard} placeholder="Search for a card..." />
                    </InfoBox>
                    {editable ? (
                        <>
                            <InfoBox>
                                <h2>➕ Add New Cards</h2>
                                <p>
                                    You can import your inventory from spreadsheets and text on the <a href='/import'>bulk import page</a>. Bulk export is accessable from your <a href='/account'>profile page</a>.
                                </p>
                                <p>
                                    Select a card, and hit either of the buttons to add one to your inventory. If it is already there, it will be incremented.
                                    Otherwise, a new entry is created.
                                </p>
                                <AutoSelect options={cardOptions} onChange={setSelectedCard} placeholder="Search for a card..." />
                                <button
                                    onClick={() => {
                                        incrementCard(selectedCard);
                                    }}
                                    disabled={!selectedCard || saving || pendingChanges.length > 0}
                                    className="action-button"
                                >
                                    ➕ Add Regular
                                </button>
                                <button
                                    onClick={() => {
                                        incrementCard({
                                            ...selectedCard,
                                            holo: true,
                                        });
                                    }}
                                    disabled={!selectedCard || saving || pendingChanges.length > 0}
                                    className="action-button"
                                >
                                    ➕ Add Holo ✨
                                </button>
                            </InfoBox>
                            <InfoBox>
                                <h2>💡 Auto List Trades</h2>
                                <p>
                                    This feature has been moved to the <NavLink to="/autoinv">Auto Inventory Update configuration page</NavLink>
                                </p>
                                <h3 style={{
                                    margin: "0",
                                    marginBottom: "0.5rem",
                                }}>Helper buttons</h3>
                                <button className="action-button" onClick={() => {
                                    const newChanges = [];
                                    for (const card of cardOptions) {
                                        // add a change to add 0 to the qty of the card
                                        newChanges.push({
                                            _id: card.value._id,
                                            Qty: 0,
                                        });
                                    }
                                    setPendingChanges(newChanges);
                                    saveChanges(newChanges, true);
                                }}>Run rules for all non-holos</button><br />
                                <button className="action-button" onClick={() => {
                                    const newChanges = [];
                                    for (const card of cardOptions) {
                                        // add a change to add 0 to the qty of the card
                                        newChanges.push({
                                            _id: card.value._id,
                                            Qty: 0,
                                            holo: true,
                                        });
                                    }
                                    // execute the changes
                                    setPendingChanges(newChanges);
                                    saveChanges(newChanges, true);
                                }}>Run rules for all ✨ holos</button><br />
                            </InfoBox>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default Inventory;
