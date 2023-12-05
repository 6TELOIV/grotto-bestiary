import "./Account.css";
import { Helmet } from "react-helmet";
import { getUserById, modifyUser, toDisplayName } from "../Helpers/APIHelpers";
import { NavLink, useLoaderData } from "react-router-dom";
import ProfileCard from "../Components/ProfileCard";
import { useState } from "react";
import { getCountries } from "../Helpers/TextHelper";
import AutoSelect from "../Components/AutoSelect";
import { save } from "../Helpers/DownloadHelper";
import InfoBox from "../Components/InfoBox";

function Account() {
    const { user, editable } = useLoaderData();

    const [region, setRegion] = useState(user.region ?? null);
    const [dms, setDms] = useState(user.dms ?? null);
    const [collapseOnSearch, setCollapseOnSearch] = useState(user.collapseOnSearch ?? null);
    const [supporterBadge, setSupporterBadge] = useState(user.supporterBadge ?? null);
    const [userUpdates, setUserUpdates] = useState({});
    const [bio, setBio] = useState(user.bio ?? null);
    const [nukeConfirm, setNukeConfirm] = useState(false);
    const [nuked, setNuked] = useState(false);

    const regions = getCountries();

    const saved = Object.keys(userUpdates).length === 0;

    function onRegionChange(newRegion) {
        setUserUpdates({
            ...userUpdates,
            region: newRegion,
        });
        setRegion(newRegion);
    }
    const supporterBadgeOptions = [
        {
            value: "bi",
            label: "Bisexual Pride",
        },
        {
            value: "lesbian",
            label: "Lesbian Pride",
        },
        {
            value: "gay",
            label: "Gay Pride",
        },
        {
            value: "nonbinary",
            label: "Nonbinary Pride",
        },
        {
            value: "trans",
            label: "Transgender Pride",
        },
        {
            value: null,
            label: "❌ Hide",
        },
    ];
    function onSupporterBadgeChange(newBadge) {
        setUserUpdates({
            ...userUpdates,
            supporterBadge: newBadge,
        });
        setSupporterBadge(newBadge);
    }

    function onDmsChange(e) {
        setUserUpdates({
            ...userUpdates,
            dms: e.target.checked,
        });
        setDms(e.target.checked);
    }
    function onBioChange(e) {
        // take only first 500 characters
        const newBio = e.target.value.substring(0, 500);
        setUserUpdates({
            ...userUpdates,
            bio: newBio,
        });
        setBio(newBio);
    }
    function onCollapseOnSearchChange(e) {
        setUserUpdates({
            ...userUpdates,
            collapseOnSearch: e.target.checked,
        });
        setCollapseOnSearch(e.target.checked);
    }

    async function saveChanges() {
        await modifyUser(userUpdates);
        setUserUpdates({});
    }

    async function exportInventory(format) {
        const exportData = await getUserById(user.id);
        const filename = `${user.username}-inventory.${format}`;
        const delimiter = format === "csv" ? "," : "\t";
        let text = "Name" + delimiter + "Count" + delimiter + "Holo" + delimiter + "Wish" + delimiter + "Trade";
        for (const item of exportData.inventory) {
            text += "\n" + item.Name + delimiter + item.Qty + delimiter + !!item.holo + delimiter + item.WishQty + delimiter + item.TradeQty;
        }
        save(filename, text);
    }

    async function nukeInventory() {
        if (nukeConfirm) {
            const result = await fetch("/nuke", {
                method: "POST",
            });
            if (result.ok) {
                setNuked(true);
            } else {
                alert("Something went wrong! Inventory may or may not have been nuked.");
            }
        } else {
            setNukeConfirm(true);
        }
    }

    const modifiedUser = { ...user, region, dms, supporterBadge, bio };

    return (
        <div className="profile-page">
            <h1>{toDisplayName(user)}'s Profile</h1>
            <Helmet>
                <title>{toDisplayName(user)} - Grotto Bestiary</title>
            </Helmet>
            <div className="profile-container">
                {editable ? (
                    <InfoBox className="account-settings">
                        <h2>⚙️ Account Settings</h2>
                        <input type="checkbox" id="displayDiscord" checked={dms} onChange={onDmsChange} />
                        <label htmlFor="displayDiscord">Open to DMs?</label>
                        <br />
                        <input type="checkbox" id="collapseSearch" checked={collapseOnSearch} onChange={onCollapseOnSearchChange} />
                        <label htmlFor="collapseSearch">Collapse search query after searching?</label>
                        <br />
                        <label>Region</label>
                        <AutoSelect
                            options={getCountries()}
                            defaultValue={regions.find((reg) => reg.value === region)}
                            onChange={onRegionChange}
                            placeholder={"Select a Region..."}
                        />
                        {user.supporter ? (
                            <>
                                <label>Supporter Badge</label>
                                <AutoSelect
                                    options={supporterBadgeOptions}
                                    defaultValue={supporterBadgeOptions.find((b) => b.value === supporterBadge)}
                                    onChange={onSupporterBadgeChange}
                                    placeholder={"Select a Supporter Badge..."}
                                />
                            </>
                        ) : (
                            <>
                                <label>Supporter Badge (Preview only - Not a Supporter)</label>
                                <AutoSelect
                                    options={supporterBadgeOptions}
                                    defaultValue={supporterBadgeOptions.find((b) => b.value === supporterBadge)}
                                    onChange={onSupporterBadgeChange}
                                    placeholder={"Select a Supporter Badge..."}
                                />
                            </>
                        )}
                        <label>Bio (500 character limit)</label>
                        <textarea placeholder="Tell the world a little bit about yourself!" value={bio} onChange={onBioChange} />
                        <h2>:naturalist_slayingston: Advanced Features</h2>
                        <NavLink to="/autoinv">Auto Inventory Update Rules Configuration</NavLink><br />
                        <h2>🛬 Import tools</h2>
                        <a href='/import'>Bulk Import Page</a>
                        <h2>🚚 Export tools</h2>
                        <button onClick={() => exportInventory('csv')} className="action-button">📄 Export Inventory (CSV)</button>
                        <button onClick={() => exportInventory('tsv')} className="action-button">📄 Export Inventory (TSV)</button>
                        <p>
                            The following is not for the faint of heart! It will delete all of your inventory, and cannot be undone{" "}
                            <b>(forever is a long time!).</b>
                        </p>
                        <button onClick={nukeInventory} className="action-button nuke">
                            💣 Nuke Inventory{nukeConfirm ? " (Press Again to Confirm)" : ""}
                        </button>
                        {nuked ? <p>Inventory Nuked!</p> : null}
                        <button onClick={saveChanges} className="action-button primary save-profile" disabled={saved}>
                            {saved ? "Saved" : "Save Changes"}
                        </button>
                    </InfoBox>
                ) : (
                    null
                )}
                <ProfileCard user={modifiedUser} key={JSON.stringify(modifiedUser)} />
            </div>
        </div>
    );
}

export default Account;
