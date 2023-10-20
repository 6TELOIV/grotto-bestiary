import "./App.css";
import { NavLink, Outlet, useLocation, useNavigate, useNavigation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from 'react-hot-toast';
import Modal from 'react-modal';
import InfoBox from "./Components/InfoBox";

Modal.setAppElement('#root');

function App() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const [menuClosed, setMenuClosed] = useState(true);
    const sludge = ["bi", "gay", "lesbian", "nonbinary", "trans"][Math.floor(Math.random() * 5)];

    const { state: navState } = useNavigation();
    const location = useLocation();
    const navigate = useNavigate();

    const onDetailsFromSearch = location.pathname === "/card-details" && document.referrer?.indexOf("https://www.grotto-bestiary.com/") === 0;
    const hideOnDetails = onDetailsFromSearch ? " hide" : "";
    const showOnDetails = onDetailsFromSearch ? "" : " hide";

    useEffect(() => {
        if (navState === "idle") {
            setMenuClosed(true);
        }
    }, [navState]);

    function toggleMenu() {
        setMenuClosed(!menuClosed);
    }

    const [patchNotes, setPatchNotes] = useState(null);
    useEffect(() => {
        fetch("/patch-notes/latest").then(async (res) => {
            if (res.ok) {
                const lastPatchNotesRead = localStorage.getItem("lastPatchNotesRead");
                const latestPatchNotes = await res.json();
                if (lastPatchNotesRead !== latestPatchNotes._id) {
                    setPatchNotes(latestPatchNotes);
                }
            }
        });
    }, []);

    return (
        <>
            <div className="loading-overlay"></div>
            <div className="loader"></div>
            {patchNotes ? (
                <div className="patch-notes-container">
                    <InfoBox className="patch-notes">
                        <h2>{patchNotes.title + " - " + patchNotes.version}</h2>
                        <h3>Changes:</h3>
                        <ul>
                            {patchNotes.changes.map((change, i) => (
                                <li key={i}>{change}</li>
                            ))}
                        </ul>
                        <button
                            className="action-button"
                            onClick={() => {
                                localStorage.setItem("lastPatchNotesRead", patchNotes._id);
                                setPatchNotes(null);
                            }}
                        >
                            Dismiss
                        </button>
                    </InfoBox>
                </div>
            ) : null}
            <div className="App">
                <Toaster
                    position="bottom-center"
                    toastOptions={{
                        style: {
                        background: '#333',
                        color: '#fff',
                        }
                    }}
                />
                <nav>
                    <button className={"back-button" + showOnDetails} onClick={() => navigate(-1)}>
                        <div className="arrow" />
                    </button>
                    <NavLink to="/donate" className={"donate" + (menuClosed ? " closed" : "") + hideOnDetails}>
                        <img alt={"Donate Button"} src={`/images/emotes/sludge_${sludge}.png`} />
                    </NavLink>
                    <NavLink to="/search" className={(menuClosed ? "closed" : "") + hideOnDetails}>
                        Search
                    </NavLink>
                    <NavLink to="/create" className={menuClosed ? "closed" : ""}>
                        Creator
                    </NavLink>
                    <NavLink to="/deck-manager" className={menuClosed ? "closed" : ""}>
                        Decks
                    </NavLink>
                    <NavLink to="/inventory" className={menuClosed ? "closed" : ""}>
                        Inventory
                    </NavLink>
                    <NavLink to="/trades" className={menuClosed ? "closed" : ""}>
                        Trades
                    </NavLink>
                    <NavLink to="/users" className={menuClosed ? "closed" : ""}>
                        Users
                    </NavLink>
                    {user ? (
                        <NavLink to="/account" className={"profile" + (menuClosed ? " closed" : "")}>
                            <p className="hide-on-mobile">Account</p>
                            <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`} alt="Profile" />
                        </NavLink>
                    ) : (
                        <NavLink to={`/login?goto=${encodeURIComponent(location.pathname)}`} className={"profile" + (menuClosed ? " closed" : "")}>
                            Login
                        </NavLink>
                    )}
                    <button className={"menu-toggle" + (menuClosed ? "" : " opened")} aria-label="menu toggle" onClick={toggleMenu}>
                        <div />
                        <div />
                        <div />
                    </button>
                </nav>
                <div className="page">
                    <Outlet />
                </div>
                <div className="footer">
                    <div className="footer-group">
                        <h3>About</h3>
                        <NavLink to="/about">About Page</NavLink>
                        <NavLink to="/donate">Donate</NavLink>
                        <NavLink to="/emotes">Emotes List</NavLink>© Violet 2023
                    </div>
                    <div className="footer-group">
                        <h3>Links</h3>
                        <h4>Tabletop Sim</h4>
                        <NavLink to="/tts">TTS Export Tool</NavLink>
                        <h4>Discord</h4>
                        <a href="https://discord.gg/6Z3BVbe2dJ" target="_blank" rel="noreferrer">
                            Discord Server
                        </a>
                        <a
                            href="https://discord.com/api/oauth2/authorize?client_id=1107766147484491796&permissions=264192&scope=bot"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Add bot to a Discord server
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}

export default App;
