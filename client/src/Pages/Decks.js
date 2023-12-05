import { NavLink, useLoaderData, useNavigate } from 'react-router-dom';
import './Decks.css';
import { useEffect, useState } from 'react';
import Deck from './Deck';
import { getUserById, toDisplayName } from '../Helpers/APIHelpers';

function Decks({ linkViewer = false }) {
    const { userId: viewUserId, user: viewUser, decks: initDecks, deck, owner, currentUser, cardOptions, challengerOptions } = useLoaderData();
    const [decks, setDecks] = useState(initDecks);
    const [menuState, setMenuState] = useState(!deck);

    const navigate = useNavigate();

    async function createNewDeck() {
        const response = await fetch('/decks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'New Deck',
                cards: []
            })
        });

        if (response.ok) {
            const newDeck = {
                name: 'New Deck',
                _id: (await response.json())._id
            };
            setDecks([...decks, newDeck]);
            navigate(`/deck-manager/${newDeck._id}`);
        }
    }

    function onDeckNameChange(name, _id) {
        setDecks(decks.map(deck => {
            if (deck._id === _id) {
                return {
                    ...deck,
                    name
                }
            } else {
                return deck;
            }
        }));
    }

    function onDeckDelete(_id) {
        setDecks(decks.filter(deck => deck._id !== _id));
        navigate("/deck-manager")
    }

    return (
        <div className='decks-page-container'>
            <div className='decks-page'>
                <ul className={`decks-list ${menuState ? "" : "closed"}`}>
                    {
                        linkViewer ?
                            <li className='deck-list-user-view'>
                                Viewing {toDisplayName(viewUser)}'s decks
                            </li>
                            :
                            null
                    }
                    {
                        decks ?
                            <>
                                {
                                    decks.map(
                                        deck =>
                                            <NavLink key={deck._id} to={linkViewer ? `/decks-explorer/${viewUserId}/${deck._id}` : `/deck-manager/${deck._id}`}>
                                                <li className='deck'>
                                                    {deck.name}
                                                </li>
                                            </NavLink>
                                    )
                                }
                            </>
                            :
                            null
                    }{
                        linkViewer ?
                            null
                            :
                            <li className='add-deck'>
                                <button onClick={createNewDeck}>
                                    + New Deck
                                </button>
                            </li>
                    }
                </ul>
                <div className='deck-view'>
                    {
                        deck ?
                            <Deck
                                key={deck._id}
                                initDeck={deck}
                                owner={owner}
                                currentUser={currentUser}
                                cardOptions={cardOptions}
                                challengerOptions={challengerOptions}
                                onDeckNameChange={onDeckNameChange}
                                onDeckDelete={onDeckDelete}
                            />
                            :
                            null
                    }
                </div>
            </div >
            <button className={`decks-menu-button ${menuState ? "open" : "close"}`} onClick={() => setMenuState(!menuState)}>
                <div />
                <div />
                <div />
            </button>
        </div>
    )
}

export default Decks;