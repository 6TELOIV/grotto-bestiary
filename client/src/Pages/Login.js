import { useLoaderData, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import "./Login.css";
import { getLoginURL } from "../Helpers/APIHelpers";

function Login() {
    const loginError = useLoaderData();
    const [searchParams] = useSearchParams();

    function discordAuth() {
        window.location.href = getLoginURL(searchParams.get('goto') ?? '/account');
    }

    return (
        <div className="login-container">
            <Helmet>
                <title>Login - Grotto Bestiary</title>
            </Helmet>
            <div className="login-card">
                {loginError ? (
                    <p className="login-error">
                        Error logging in: {loginError.message}
                    </p>
                ) : (
                    ""
                )}
                <p>
                    A Discord account is required for account creation to
                    facilitate trades and user communication. No information is
                    collected from Discord besides your basic acount information
                    (
                    <i>
                        your email address is <u>not</u> collected
                    </i>
                    ). Your card list is stored on this site's database and is
                    associated with your discord account information.
                </p>
                <button className="login-with" onClick={discordAuth}>
                    <img src="/images/discord-mark-white.svg" alt="" />
                    Sign in with Discord
                </button>
            </div>
        </div>
    );
}

export default Login;
