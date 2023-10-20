import { NavLink } from "react-router-dom";
import InfoBox from "../Components/InfoBox";
import { Helmet } from "react-helmet";

function About() {
    return (
        <div className="static-page">
            <Helmet>
                <title>About - Grotto Bestiary</title>
            </Helmet>
            <h1>About</h1>
            <div>
                <InfoBox>
                    <h2>❔ What is this site</h2>
                    <p>
                        This website is inspired by <a href="https://scryfall.com/" target="_blank" rel="noreferrer">Scryfall</a>.
                        I wanted to make something similar for Grotto Beasts cards and this is the result.
                        It started out as a simple card search with a single page, but I added on many more features over time.
                        The site now has <NavLink to="/account">accounts</NavLink>, <NavLink to="/inventory">an inventory manager</NavLink>, <NavLink to="/trades">trade searching</NavLink>, and more!
                        A appreciate everyone who uses the site and I hope you enjoy it!
                        A special thanks to the following people, who helped with the original card scanning efforts:
                    </p>
                    <ul style={{
                        listStyleType: "none",
                    }}>
                        <li>:jeffsludge: Jeff</li>
                        <li>:dogorb: Paul</li>
                        <li>:greenmegalul: ConvoBreaker</li>
                        <li>:dustbunny_pleading: DreamyTracker</li>
                        <li>:piropoint: Cylosis</li>
                        <li>:meowdygarf: SpookyBoogie</li>
                        <li>:pogaxos: godofgubgub</li>
                        <li>:praygeist: quirky.</li>
                        <li>:razzleshades: TheDangerDog</li>
                        <li>:JermaGlueless: randomCaribou</li>
                    </ul>
                    <p>And an extra special thanks to Nick, who created the original <a href="https://drive.google.com/file/d/1loyNEtfEnRf5sGdIxAu3QslEmUNn2gTD/view?usp=sharing" target="_blank" rel="noreferrer">photoshop design</a> for the card template used on the <NavLink to="/create">card creator</NavLink> :heartman::heartman::heartman:</p>
                </InfoBox>
                <InfoBox>
                    <h2>:piropoint: Who are you</h2>
                    <p>
                        I'm Violet, <NavLink to="/account?username=6teloiv&tag=0">the trans woman who made this site</NavLink> 🏳️‍⚧️<br />
                        I'm a software engineer who loves TCGs and is a big fan of Jerma985 :heartman:<br />
                        I also play vidya games sometimes, you can find me on <a href="https://steamcommunity.com/id/6teloiv/" target="_blank" rel="noreferrer">Steam</a> and <a href="https://discordapp.com/users/187449099472076811/">Discord</a><br />
                    </p>
                </InfoBox>
            </div>
        </div>
    );
}

export default About;