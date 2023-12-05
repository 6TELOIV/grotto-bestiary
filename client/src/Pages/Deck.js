import { NavLink } from 'react-router-dom';
import './Deck.css'
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { cardNameToCardImageURL, toDisplayName } from '../Helpers/APIHelpers';
import AutoSelect from '../Components/AutoSelect';
import { Tooltip } from 'react-tooltip';
import Modal from 'react-modal';
import { parseCardList } from '../Helpers/TextHelper';
import copy from "copy-to-clipboard";
import ButtonGroup from '../Components/ButtonGroup';
import { save } from '../Helpers/DownloadHelper';

function Deck({ initDeck, owner, currentUser, cardOptions, challengerOptions, onDeckNameChange, onDeckDelete }) {
    const [deck, setDeck] = useState(initDeck);
    const profilepic = `https://cdn.discordapp.com/avatars/${owner.id}/${owner.avatar}?size=1024`;


    const [moreMenuOpen, setMoreMenuOpen] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [missingCardsModalOpen, setMissingCardsModalOpen] = useState(false);

    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState("decklist");

    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importText, setImportText] = useState("");
    const [importFormat, setImportFormat] = useState("decklist");

    useEffect(() => {
        const dismissMenu = () => setMoreMenuOpen(false);
        window.addEventListener("click", dismissMenu);
        return () => {
            window.removeEventListener("click", dismissMenu)
        }
    }, []);

    const [deckGroups, setDeckGroups] = useState([
        {
            name: 'Challengers',
            filter: (card) => card.Type === 'Challenger',
            type: 'cards'
        },
        {
            name: 'Grottos',
            filter: (card) => card.Type === 'Grotto',
            type: 'cards'
        },
        {
            name: 'Wishes',
            filter: (card) => card.Type === 'Wish',
            type: 'cards'
        },
        {
            name: 'Beasts',
            filter: (card) => card.Type.includes('Beast'),
            type: 'cards'
        },
    ]);

    const [focusedCard, setFocusedCard] = useState(null);
    const [focusedCardProps, setFocusedCardProps] = useState(null);
    useEffect(() => {
        if (focusedCard) {
            setFocusedCardProps(cardOptions.find((cardOption) => cardOption.value._id === focusedCard?._id)?.value);
        }
    }, [focusedCard]);

    const user = JSON.parse(sessionStorage.getItem('user'));
    const editable = user && user.id === deck.ownerID;
    const examples = {
        tsv: `Name	Count
Jerma	1
Radroot	3`,
        csv: `Name,Count
Jerma,1
Radroot,3`,
        decklist: `1 Jerma
3 Radroot`
    }

    function blurOnReturn(e) {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    }

    function deleteDeck() {
        const deleteDeckPromise = _deleteDeck();
        toast.promise(deleteDeckPromise, {
            loading: 'Deleting...',
            success: 'Deleted!',
            error: (e) => `Failed to delete: ${e.toString()}`
        });
    }

    async function _deleteDeck() {
        const deleteDeckResult = await fetch('/decks', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                _id: deck._id
            })
        });
        if (deleteDeckResult.status === 200) {
            onDeckDelete(deck._id);
        } else {
            throw new Error((await deleteDeckResult.json()).error);
        }
    }

    function updateCard(e, card) {
        let newQty = parseInt(e.target.value);
        // if field blank, set to 0
        if (isNaN(newQty)) {
            newQty = 0;
        }
        // check if newQty 0; if so, remove the card from the deck
        if (newQty === 0) {
            // clear focused card if it's this card
            if (card._id === focusedCard?._id) {
                setFocusedCard(null);
            }
            const newDeck = {
                ...deck,
                cards: deck.cards.filter((deckCard) => deckCard._id !== card._id)
            };
            updateDeck(newDeck);
            return;
        }
        // otherwise, update the card quantity
        const newDeck = {
            ...deck,
            cards: deck.cards.map((deckCard) => {
                if (deckCard._id === card._id) {
                    return {
                        ...deckCard,
                        Qty: newQty,
                        EditQty: undefined
                    };
                }
                return deckCard;
            })
        };
        updateDeck(newDeck);
    }

    function updateDeck(newDeck) {
        const updateDeckPromise = _updateDeck(newDeck);
        toast.promise(updateDeckPromise, {
            loading: 'Saving...',
            success: 'Saved!',
            error: (e) => `Failed to save: ${e.toString()}`
        });
    }

    async function _updateDeck(newDeck) {
        const updateDeckResult = await fetch('/decks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: newDeck.name,
                cards: newDeck.cards,
                format: newDeck.format,
                challenger: newDeck.challenger,
                _id: newDeck._id
            })
        });

        if (updateDeckResult.status === 200) {
            if (newDeck.name !== deck.name) {
                onDeckNameChange(newDeck.name, deck._id);
            }
            setDeck({
                ...newDeck,
                lastModified: Date.now()
            });
        } else {
            throw new Error((await updateDeckResult.json()).error);
        }
    }

    async function importDeck(passedText) {
        try {
            let text = passedText;
            if (!passedText) {
                text = importText;
            }

            let importedDeck = await parseCardList(text, importFormat);
            setImportModalOpen(false);

            let format = deck.format;
            let challenger = importedDeck.cards.find(c => c.Type === "Challenger");
            if (challenger) {
                importedDeck.cards.splice(importedDeck.cards.indexOf(challenger), 1);
                if (format !== "jerma") {
                    format = "rumble";
                }
            } else {
                format = "classic"
            }
            updateDeck({
                ...deck,
                format,
                challenger,
                edition: (deck.edition ?? 'v') === 'v' ? importedDeck.edition : deck.edition,
                cards: importedDeck.cards.map(c => {
                    return {
                        _id: c._id,
                        Qty: c.Qty,
                    }
                })
            })
        } catch (e) {
            alert(`Import Failed!\nReason: ${e}`);
        }
    }

    function importFromClipboard() {
        navigator.clipboard.readText().then((text) => {
            importDeck(text);
        });
    }

    function exportDeck(deck, exportFormat) {
        //Add challenger to deck if needed
        const cardsIncChallenger = deck.cards.map((c) => c);
        if (deck.challenger && deck.format === "rumble" || deck.format === "jerma") {
            cardsIncChallenger.unshift({
                ...deck.challenger,
                Qty: 1
            });
        }

        //Always need to add props to the deck cards
        const cardsWithDupes = cardsIncChallenger.map(card => {
            return {
                ...card,
                ...(cardOptions.find((cardOption) => cardOption.value._id === card._id)?.value)
            }
        }).sort((a, b) => a.Number - b.Number);

        //If someone has an illegal deck, we still want to export it properly, so combine multiple copies into 1 entry
        const cards = [];
        for (const card of cardsWithDupes) {
            const existingCard = cards.find((c) => c._id === card._id);
            if (!existingCard) {
                cards.push(card);
            } else {
                existingCard.Qty += card.Qty;
            }
        }
        //Export the deck
        if (exportFormat === "decklist" || exportFormat === "tts") {
            return cards.reduce(
                (acc, card) => acc += `${card.Qty} ${card.Name}\n`,
                ""
            );
        } else if (exportFormat === "code-v" || exportFormat === "code-m") {
            const lessThan3Values = { 1: 'i', 2: 'j', 3: 'l' }
            let exportDeck = "GB" + (exportFormat === "code-v" ? "v" : "!");
            cards.reduce(
                (acc, card) => {
                    exportDeck += (card.Number - acc) + (card.Qty <= 3 ? lessThan3Values[card.Qty] : `(${card.Qty})`);
                    return (card.Number);
                },
                0
            );
            return exportDeck;
        } else {
            throw new Error(`Unknown export format ${exportFormat}`);
        }
    }

    function exportToFile() {
        let decklist = exportDeck(deck, exportFormat);
        if (exportFormat === "decklist") {
            save(deck.name + '.txt', decklist);
        }
    }

    function exportToClipboard() {
        let decklist = exportDeck(deck, exportFormat);
        copy(decklist);
        toast.success("Copied!");
        setExportModalOpen(false);
    }

    // check deck legality and add fields to cards with legality issues only after cardOptions are loaded
    const legalityIssues = [];
    if (cardOptions.length > 0) {
        let epicsFound = 0;
        let totalCards = 0;
        for (const card of deck.cards) {
            const cardProps = cardOptions.find((cardOption) => cardOption.value._id === card._id)?.value;
            // if the card wasn't found, show an error for it and skip all other checks
            if (!cardProps) {
                legalityIssues.push({
                    _id: card._id,
                    LegalityTooltip: 'Card not found.'
                });
                continue;
            }
            // challenger cards are never legal in the main deck
            if (cardProps.Type === 'Challenger') {
                let message = 'Challenger cards are not legal in the main deck.';
                if (deck.format !== 'rumble' && deck.format !== 'jerma') {
                    message += ' Set deck type to "rumble" then select a challenger from the dropdown next to the deck format.';
                } else {
                    message += ' Select a challenger from the dropdown next to the deck format.';
                }
                legalityIssues.push({
                    _id: card._id,
                    LegalityTooltip: message
                });
            }
            // decks may only have 3 copies of a card (does not apply for Byeah Prime challenger)
            if (card.Qty > 3 && deck.challenger?.Name !== 'Byeah Prime') {
                legalityIssues.push({
                    _id: card._id,
                    LegalityTooltip: 'Decks may only have three copies of a card.'
                });
            }
            if (cardProps.Epic === 'TRUE') {
                epicsFound++;
            }
            totalCards += card.Qty;
        }
        // decks may only have one epic card (does not apply for JEX challenger)
        if (epicsFound > 1 && deck.challenger?.Name !== 'JEX') {
            for (const card of deck.cards) {
                const cardProps = cardOptions.find((cardOption) => cardOption.value._id === card._id)?.value;
                if (cardProps?.Epic === 'TRUE') {
                    legalityIssues.push({
                        _id: card._id,
                        LegalityTooltip: 'Decks may only have one epic card.'
                    });
                }
            }
        }
        // decks must have at exactly 40 cards (60 for decks with Byeah Prime challenger)
        if (totalCards !== 40 && deck.challenger?.Name !== 'Byeah Prime') {
            legalityIssues.push({
                _id: 'deck',
                LegalityTooltip: 'Decks must have exactly 40 cards (Current: ' + totalCards + ').'
            });
        }
        if (totalCards !== 60 && deck.challenger?.Name === 'Byeah Prime') {
            legalityIssues.push({
                _id: 'deck',
                LegalityTooltip: 'Byeah Prime decks must have exactly 60 cards.'
            });
        }
        // rumber and jerma decks must have a challenger
        if ((deck.format === 'rumble' || deck.format === 'jerma') && !deck.challenger) {
            legalityIssues.push({
                _id: 'deck',
                LegalityTooltip: 'Rumble decks must have a challenger.'
            });
        }
    }

    // Split the deck into groups for display
    const deckGroupCards = {};
    const cardsWithProps = deck.cards.map((card) => ({
        ...card,
        ...cardOptions.find((cardOption) => cardOption.value._id === card._id)?.value
    }));
    for (const deckGroup of deckGroups) {
        deckGroupCards[deckGroup.name] = cardsWithProps.filter(deckGroup.filter);
    }


    let missingCards;
    if (currentUser) {
        missingCards = exportDeck({
            cards: deck.cards.map(c => {
                return {
                    ...c,
                    Qty: c.Qty - currentUser.inventory.filter((invCard) => invCard._id === c._id).reduce((acc, invCard) => acc + invCard.Qty, 0)
                };
            }).filter((c) => c.Qty > 0)
        }, "decklist")
    };
    let missingDeckReport;
    if (missingCards) {
        missingDeckReport = missingCards.split("\n").filter(r => r !== "").map((r) => <>{r}<br /></>);
    } else {
        missingDeckReport = "You aren't missing anything to build this deck -- Congrats!";
    }

    return (
        <div className='deck-page'>
            {
                currentUser ?
                    <Modal
                        isOpen={missingCardsModalOpen}
                        onRequestClose={() => setMissingCardsModalOpen(false)}
                        className="deck-modal"
                        overlayClassName="deck-modal-overlay"
                    >
                        <h3>Missing Cards</h3>
                        <p>
                            You need the following cards to construct this deck:
                        </p>
                        <div style={{
                            userSelect: "all",
                            msUserSelect: "all",
                            MozUserSelect: "all",
                            WebkitUserSelect: "all",
                            backgroundColor: "#333",
                            borderRadius: "8px",
                            padding: "8px"
                        }}>
                            {missingDeckReport}
                        </div>
                        <div className='modal-buttons'>
                            <button onClick={() => setMissingCardsModalOpen(false)}>Dismiss</button>
                        </div>
                    </Modal>
                    :
                    null
            }
            <Modal
                isOpen={importModalOpen}
                onRequestClose={() => setImportModalOpen(false)}
                className="deck-modal"
                overlayClassName="deck-modal-overlay"
            >
                <h3>Import Deck</h3>
                <label>Format:</label><br />
                <ButtonGroup
                    options={[
                        {
                            value: "decklist",
                            label: "Decklist"
                        },
                        {
                            value: "csv",
                            label: ".csv"
                        },
                        {
                            value: "tsv",
                            label: ".tsv"
                        },
                        {
                            value: "code",
                            label: "Deck Code"
                        },
                    ]}
                    selected={importFormat}
                    onSelect={setImportFormat}
                />
                <label>Decklist:</label><br />
                <textarea placeholder={examples[importFormat]} onChange={(e) => setImportText(e.target.value)} /><br />
                <div className='modal-buttons'>
                    <button onClick={() => importDeck()} disabled={importFormat === "code"}>Import</button>
                    <button onClick={importFromClipboard}>Import from Clipboard</button>
                </div>
            </Modal>
            <Modal
                isOpen={exportModalOpen}
                onRequestClose={() => setExportModalOpen(false)}
                className="deck-modal"
                overlayClassName="deck-modal-overlay"
            >
                <h3>Export Deck</h3>
                <label>Format:</label><br />
                <ButtonGroup
                    options={[
                        {
                            value: "decklist",
                            label: "Decklist"
                        },
                        {
                            value: "code-v",
                            label: "Deck Code (Vintage)"
                        },
                        {
                            value: "code-m",
                            label: "Deck Code (Modern)"
                        },
                    ]}
                    selected={exportFormat}
                    onSelect={setExportFormat}
                />
                <label>Export to:</label><br />
                <div className='modal-buttons'>
                    <button onClick={exportToFile} disabled={exportFormat === "code-v" || exportFormat === "code-m"}>Export to file</button>
                    <button onClick={exportToClipboard} disabled={exportFormat === "tts"}>Export to Clipboard</button>
                </div>
            </Modal>
            <Modal
                isOpen={deleteModalOpen}
                onRequestClose={() => setDeleteModalOpen(false)}
                className="deck-modal"
                overlayClassName="deck-modal-overlay"
            >
                <h3>Export Deck</h3>
                <p>
                    Are you sure you want to delete the deck <i>"{deck.name}"</i> forever?
                </p>
                <div className='modal-buttons'>
                    <button onClick={() => deleteDeck()} className='deck-delete'>Delete</button>
                    <button onClick={() => setDeleteModalOpen(false)}>Cancel</button>
                </div>
            </Modal>
            <div className='deck-header-container'>
                <div className='deck-header'>
                    <div className='deck-owner'>
                        <NavLink to={`/account?${new URLSearchParams({
                            username: owner.username,
                            tag: owner.discriminator
                        })
                            }`}>
                            <img className='deck-owner-pic' src={profilepic} alt={toDisplayName(owner)} />
                        </NavLink>
                        <h2 className='deck-owner'>{toDisplayName(owner)}</h2>
                    </div>
                    <input
                        type='text'
                        enterKeyHint='done'
                        className='deck-title'
                        disabled={!editable}
                        defaultValue={deck.name}
                        onKeyUp={(e) => blurOnReturn(e)}
                        onBlur={(e) => updateDeck({
                            ...deck,
                            name: e.target.value
                        })
                        }
                    />
                    <div className={`deck-attributes ${editable ? '' : 'deck-attributes-pills'}`}>
                        <div className='deck-attribute-container'>
                            <div className='deck-attribute'>
                                <label htmlFor='deck-format'>Format:&nbsp;</label>
                                {
                                    editable ?
                                        <select
                                            className='deck-format'
                                            value={deck.format}
                                            onChange={(e) => {
                                                updateDeck({
                                                    ...deck,
                                                    format: e.target.value,
                                                    challenger: e.target.value === 'classic' ? undefined : deck.challenger
                                                });
                                            }}
                                        >
                                            <option value='classic'>Classic</option>
                                            <option value='rumble'>Rumble</option>
                                            <option value='jerma'>Jerma Rumble</option>
                                        </select>
                                        :
                                        <b className='deck-format'>{
                                            deck.format === 'jerma' ? 'Jerma Rumble' : (deck.format ?? "classic").charAt(0).toUpperCase() + (deck.format ?? "classic").slice(1)
                                        }</b>
                                }
                            </div>
                        </div>
                        {
                            deck.format === 'rumble' || deck.format === 'jerma' ? (
                                <div className='deck-attribute-container'>
                                    <div className='deck-attribute'>
                                        Challenger:&nbsp;
                                        {
                                            editable ? (
                                                <AutoSelect
                                                    className='deck-challenger-search'
                                                    placeholder='Select challenger...'
                                                    onChange={(card) => {
                                                        if (!card) {
                                                            updateDeck({
                                                                ...deck,
                                                                challenger: undefined
                                                            });
                                                        } else {
                                                            updateDeck({
                                                                ...deck,
                                                                challenger: {
                                                                    _id: card._id,
                                                                    Name: card.Name
                                                                }
                                                            });
                                                        }
                                                    }}
                                                    options={challengerOptions}
                                                    defaultValue={challengerOptions.find((option) => option.value._id === deck.challenger?._id)}
                                                />
                                            ) : <b className='deck-challenger'>{deck.challenger.Name}</b>
                                        }
                                    </div>
                                </div>
                            ) : null
                        }
                        <Tooltip id='deck-legality' />
                        <div
                            className='deck-attribute-container'
                            data-tooltip-id='deck-legality'
                            data-tooltip-content={
                                legalityIssues.filter((issue) => issue._id === 'deck').map((issue) => issue.LegalityTooltip).join('\n')
                            }
                        >
                            <div className='deck-attribute'>
                                <span
                                    className='deck-legality'
                                >
                                    Legality: <b>{legalityIssues.length > 0 ? 'Illegal ⛔' : 'Legal ✅'}</b>
                                </span>
                            </div>
                        </div>
                    </div>
                    <span className='deck-timestamp'>
                        Last updated {new Date(deck.lastModified).toLocaleDateString() + ' ' + new Date(deck.lastModified).toLocaleTimeString()}
                    </span>
                </div>
            </div>
            <div className='deck-toolbar'>
                {/* <NavLink to='bulk'>
                            Bulk Editor
                        </NavLink> */}
                {/* <button className="deck-delete" onClick={() => {

                        }}>Delete Deck 🗑️</button> */}
                <div className='deck-more-menu-button'>
                    <button onClick={(e) => { e.stopPropagation(); setMoreMenuOpen(true); }}>
                        More Options...
                    </button>
                    {
                        moreMenuOpen ?
                            <ul className='deck-more-menu'>
                                {
                                    editable ?
                                        <li onClick={() => setImportModalOpen(true)}>Import</li>
                                        :
                                        null
                                }
                                <li onClick={() => setExportModalOpen(true)}>Export</li>
                                {
                                    currentUser ?
                                        <li onClick={() => setMissingCardsModalOpen(true)}>Missing Cards</li>
                                        :
                                        null
                                }
                                {
                                    editable ?
                                        <li onClick={() => setDeleteModalOpen(true)} className='deck-more-menu-delete'>Delete</li>
                                        :
                                        null
                                }
                            </ul>
                            :
                            null
                    }
                </div>
                {
                    editable ?
                        <AutoSelect
                            className='deck-add-search'
                            disabled={!editable}
                            placeholder='Add card...'
                            onChange={(card) => {
                                if (!card) {
                                    return;
                                }
                                // check if the card is already in the deck
                                if (deck.cards.find((deckCard) => deckCard._id === card._id)) {
                                    // if so, increment the quantity
                                    updateDeck({
                                        ...deck,
                                        cards: deck.cards.map((deckCard) => {
                                            if (deckCard._id === card._id) {
                                                return {
                                                    ...deckCard,
                                                    Qty: deckCard.Qty + 1,
                                                    EditQty: undefined
                                                };
                                            }
                                            return deckCard;
                                        })
                                    });
                                } else {
                                    // otherwise, add the card to the deck
                                    updateDeck({
                                        ...deck,
                                        cards: [
                                            ...deck.cards,
                                            {
                                                _id: card._id,
                                                Name: card.Name,
                                                Qty: 1
                                            }
                                        ]
                                    });
                                }
                            }}
                            options={cardOptions}
                            neverChange
                        />
                        :
                        null
                }
            </div>
            <div className='deck-list-container'>
                <div className='deck-focused-card hide-on-mobile'>
                    {
                        focusedCard ?
                            <>

                                <img src={cardNameToCardImageURL(focusedCard?.Name)} alt='' />
                                <p>
                                    <b>Effect: </b>{focusedCardProps?.Effect}
                                </p>
                            </>
                            :
                            <>
                                <div className='deck-focused-card-placeholder'>
                                    Hover a card to see it's image and effect
                                </div>
                                <p>
                                    <b>Effect: </b>
                                </p>
                            </>
                    }
                </div>
                <ul className='deck-list'>
                    {
                        (deck.format === 'rumble' || deck.format === 'jerma') && deck.challenger ?
                            <li className='deck-list-group'>
                                <div className='deck-list-group-name'><h3>Challenger</h3></div>
                                <ul className='deck-list-group-items'>
                                    <li
                                        className='deck-list-item'
                                        onMouseOver={() => setFocusedCard(deck.challenger)}
                                    >
                                        <Tooltip id={`deck-list-item-challenger-quantity`} />
                                        <span
                                            className='deck-list-item-quantity'
                                            data-tooltip-id={`deck-list-item-challenger-quantity`}
                                            data-tooltip-content='Copies in deck'
                                        >
                                            🃏
                                            <span>1</span>
                                        </span>
                                        {
                                            currentUser ? (
                                                <>
                                                    <Tooltip id={`deck-list-item-challenger-inv-quantity`} />
                                                    <span
                                                        className='deck-list-inv-quantity'
                                                        data-tooltip-id={`deck-list-item-challenger-inv-quantity`}
                                                        data-tooltip-content='Copies you own'
                                                    >
                                                        📦
                                                        <span>{currentUser.inventory.filter((invCard) => invCard._id === deck.challenger._id).reduce((acc, invCard) => acc + invCard.Qty, 0)}</span>
                                                    </span>
                                                </>
                                            )
                                                :
                                                null
                                        }
                                        <span className='deck-list-item-name'>
                                            {deck.challenger.Name}
                                        </span>
                                    </li>
                                </ul>
                            </li>
                            :
                            null
                    }
                    {
                        deckGroups.map((deckGroup) => {
                            if (deckGroupCards[deckGroup.name].length > 0) {
                                return <li key={deckGroup.name} className='deck-list-group'>
                                    <div className='deck-list-group-name'>
                                        <h3>{deckGroup.name}</h3>
                                        <button className='deck-list-group-collapse' onClick={() => {
                                            setDeckGroups(deckGroups.map((group) => {
                                                if (group.name === deckGroup.name) {
                                                    return {
                                                        ...group,
                                                        collapsed: !group.collapsed
                                                    };
                                                }
                                                return group;
                                            }));
                                        }}>
                                            {deckGroup.collapsed ? '▶' : '▼'}
                                        </button>
                                    </div>
                                    {
                                        deckGroup.collapsed ?
                                            null
                                            :
                                            <ul className='deck-list-group-items'>
                                                {
                                                    deckGroupCards[deckGroup.name].sort((a, b) => a.Number - b.Number).map((card, i) =>
                                                        <li
                                                            key={card._id}
                                                            className='deck-list-item'
                                                            onMouseOver={() => setFocusedCard(card)}
                                                        >
                                                            <Tooltip id={`deck-list-item-${card._id}-quantity`} />
                                                            <span
                                                                className='deck-list-item-quantity'
                                                                data-tooltip-id={`deck-list-item-${card._id}-quantity`}
                                                                data-tooltip-content='Copies in deck'
                                                            >
                                                                {
                                                                    editable ?
                                                                        <>
                                                                            <label htmlFor={`deck-list-item-${card._id}-quantity-input`}>🃏</label>
                                                                            <input
                                                                                id={`deck-list-item-${card._id}-quantity-input`}
                                                                                type='number'
                                                                                min='0'
                                                                                onKeyDown={(e) => {
                                                                                    if (!/[0-9]/.test(e.key) && !e.key.startsWith('Arrow') && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                                                                                        e.preventDefault();
                                                                                    }
                                                                                }}
                                                                                onKeyUp={(e) => blurOnReturn(e)}
                                                                                onBlur={(e) => updateCard(e, card)}
                                                                                onChange={(e) => setDeck({
                                                                                    ...deck,
                                                                                    cards: deck.cards.map((deckCard) => {
                                                                                        if (deckCard._id === card._id) {
                                                                                            return {
                                                                                                ...deckCard,
                                                                                                EditQty: parseInt(e.target.value)
                                                                                            };
                                                                                        }
                                                                                        return deckCard;
                                                                                    })
                                                                                })}
                                                                                value={card.EditQty ?? card.Qty}
                                                                            />
                                                                        </>
                                                                        :
                                                                        <>🃏<span>{card.Qty}</span></>
                                                                }
                                                            </span>
                                                            {
                                                                currentUser ? (
                                                                    <>
                                                                        <Tooltip id={`deck-list-item-${card._id}-inv-quantity`} />
                                                                        <span
                                                                            className='deck-list-inv-quantity'
                                                                            data-tooltip-id={`deck-list-item-${card._id}-inv-quantity`}
                                                                            data-tooltip-content='Copies you own'
                                                                        >
                                                                            📦
                                                                            <span>{currentUser.inventory.filter((invCard) => invCard._id === card._id).reduce((acc, invCard) => acc + invCard.Qty, 0)}</span>
                                                                        </span>
                                                                    </>
                                                                )
                                                                    :
                                                                    null
                                                            }
                                                            <span className='deck-list-item-name'>
                                                                {card.Name}
                                                            </span>
                                                            <Tooltip id={`deck-list-item-${card._id}-legality`} />
                                                            <span
                                                                className='deck-list-item-legality'
                                                                data-tooltip-id={`deck-list-item-${card._id}-legality`}
                                                                data-tooltip-content={
                                                                    legalityIssues.filter((issue) => issue._id === card._id).map((issue) => issue.LegalityTooltip).join('\n')
                                                                }
                                                            >
                                                                {legalityIssues.filter((issue) => issue._id === card._id).length > 0 ? '⛔' : null}
                                                            </span>
                                                        </li>
                                                    )
                                                }
                                            </ul>
                                    }
                                </li>
                            }
                        })
                    }
                </ul>
            </div>
        </div>
    );
}

export default Deck;