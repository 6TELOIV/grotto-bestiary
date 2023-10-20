import { useState } from "react";
import InfoBox from "../Components/InfoBox";
import ProfileCard from "../Components/ProfileCard";
import "./UserLookup.css";

function UserLookup () {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null); 
    const [username, setUsername] = useState(null);

    async function search() {
        let searchParams = new URLSearchParams({ username });
        if (username.indexOf("#") === -1) {
            searchParams.set("username", username + "#0");
        }
        const result = await fetch(`/user?${searchParams}`);
        if (result.ok) {
            setUser(await result.json());
            setError(undefined);
        } else {
            setUser(undefined);
            if (result.status === 404) {
                setError(<>User <code>{searchParams.get("username")}</code> not found.</>);
            } else {
                setError(JSON.stringify(await result.json()));
            }
        }
    }

    return (
        <div className="user-lookup-page">
            <h2>User Lookup</h2>
            <div className="user-lookup">
                <InfoBox>
                    <h2>🔍 Search for a user</h2>
                    <p>Enter a Discord <code>username</code> or a <code>username#discriminator</code> to see their profile.</p>
                    <form onSubmit={(e) => { e.preventDefault(); search(); }}>
                        <input type="text" placeholder={'try "6teloiv"'} value={username} onChange={(e) => { setUsername(e.target.value) }} />
                        <input type="submit" value="Search" />
                    </form>
                </InfoBox>
                {user && <ProfileCard user={user} />}
                {error && <InfoBox>
                    <h2>🚫 Error</h2>
                    {error}
                </InfoBox>}
            </div>
        </div>
    );
}

export default UserLookup;
