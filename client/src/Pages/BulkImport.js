import { useState } from "react";
import InfoBox from "../Components/InfoBox";
import "./BulkImport.css";
import { getCards, modifyInventory } from "../Helpers/APIHelpers";
import ButtonGroup from "../Components/ButtonGroup";
import { NavLink } from "react-router-dom";
import { parseCardList } from "../Helpers/TextHelper";

function BulkImport() {
    const [list, setList] = useState(null);
    const [changesMade, setChangesMade] = useState(null);
    const [error, setError] = useState(null);
    const [parsing, setParsing] = useState(false);
    const [format, setFormat] = useState("tsv");

    const examples = {
        tsv: `Name	Count	Holo	Wish	Trade
Jerma	2	true	0	1
Otto	0	false	1	0`,
        csv: `Name,Count,Holo,Wish,Trade
Jerma,2,true,0,1
Otto,0,false,1,0`,
        decklist: `2 Jerma
1 Otto`
    }

    async function importInventory() {
        setParsing(true);
        try {
            const cards = (await parseCardList(list, format)).cards;
            const result = await modifyInventory(cards, true);
            if (!result.ok) {
                throw new Error((await result.json()).error_message);
            } else {
                setChangesMade(cards);
                setList("");
            }
            setError(null);
        } catch (e) {
            setError(e);
            setChangesMade(null);
        }
        setParsing(false);
    }

    async function undo() {
        const changes = changesMade.map((change) => {
            return {
                _id: change._id,
                Qty: -change.Qty,
                WishQty: -change.WishQty,
                TradeQty: -change.TradeQty,
                holo: change.holo,
                Name: change.Name,
            }
        });
        const result = await modifyInventory(changes, true);
        if (!result.ok) {
            setError((await result.json()).error_message);
        } else {
            setChangesMade(changes);
        }
    }

    return (
        <div className="bulk-import-page">
            <h1>Bulk Inventory Import</h1>
            <div className="bulk-import">
                {error ? <InfoBox>
                    <h2>🚫 Error</h2>
                    {error.toString()}
                </InfoBox>
                : null}
                {changesMade ? <InfoBox className="bulk-import-output">
                    <h2>✅ Success</h2>
                    <p>
                        {changesMade.reduce((total, card) => total += card.Qty, 0)} cards added to your inventory.
                    </p>
                    <ul>
                        {changesMade.map((change) => <li key={change._id + change.holo}>{change.Qty}x {change.holo ? "✨ " : ""}{change.Name} ({change.WishQty}x Wishlist, {change.TradeQty}x Tradelist)</li>)}
                    </ul>
                    <button className="action-button" onClick={undo}>
                        Undo
                    </button>
                </InfoBox>
                : null}
                <InfoBox>
                    <h2>📥 Import your inventory</h2>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            importInventory();
                        }}
                    >
                        <label>Fomat</label>
                        <ButtonGroup options={[{ value: 'tsv', label: 'tsv' }, { value: 'csv', label: 'csv' }, { value: 'decklist', label: 'Decklist' }]} selected={format} onSelect={setFormat} />
                        <textarea placeholder={examples[format]} value={list} onChange={(e) => setList(e.target.value)} />
                        <input disabled={parsing} type="submit" value="Import" />
                    </form>
                    <p>
                        <strong>Usage:</strong><br />
                        Paste a <code>.csv</code>, <code>.tsv</code>, or decklist style file to import your inventory.<br /><br />
                        <strong>Supported formats:</strong>
                        <ul>
                            <li>
                                <code>.csv</code>: Must start with header row, must include Name and Count columns; ex: <code>Name,Count,Holo,Wish,Trade</code>
                            </li>
                            <li>
                                <code>.tsv</code>: Must start with header row, must include Name and Count columns; ex: <code>Name&#9;Count&#9;Holo&#9;Wish&#9;Trade</code>
                            </li>
                            <li>
                                Decklist: all rows must be in the format <code>Count Name</code>; Holo, Wishlist count, and Tradelist count cannot be provided
                            </li>
                        </ul>
                        <strong>Notes:</strong>
                        <ul>
                            <li>
                                <strong>⚠ Warning:</strong> This does not overwrite your current inventory, but will add the changes on top it. If you want to replace your inventory, you must first nuke it on your <NavLink to="/account">account page</NavLink>.
                            </li>
                            <li>
                                <strong>⚠ Warning:</strong> Once you leave the page, this action cannot be undone. Be sure to review the changes made before leaving. An undo option is available below the list of changes made.
                            </li>
                            <li>
                                <code>Name</code> required and is case insensitive.
                            </li>
                            <li>
                                <code>Count</code> required.
                            </li>
                            <li>
                                <code>Holo</code> is <code>true</code> or <code>false</code> and is optional.
                            </li>
                            <li>
                                <code>Wish</code> and <code>Trade</code> must be provided if their headers are present. If the header is not persent, they default to 0.
                            </li>
                            <li>
                                For examples, see <a href="https://docs.google.com/spreadsheets/d/1gq-XKhj4lvy7BnbkM95GlN1kNpvNkpOQwclAg7XuTWQ/edit?usp=sharing" target="_blank" rel="noreferrer">this spreadsheet</a>.
                            </li>
                        </ul>
                    </p>
                </InfoBox>
            </div>
        </div>
    );
}

export default BulkImport;
