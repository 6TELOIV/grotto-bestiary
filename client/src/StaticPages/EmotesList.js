import InfoBox from "../Components/InfoBox";
import "./EmotesList.css"

function EmotesList() {

    const emotes = [
        {
            name: "Jeff!",
            emotes: [
                "dogorb",
                "sobearth",
                "pensivepluto",
                "truegleberry",
                "pepetoadstool",
                "greenmegalul",
                "gbheart",
                "jermasludge",
                "jermasludgeanguish",
                "snailsboy",
                "fritos",
                "greedykisser",
                "sussycola",
                "wahptical_illusion",
                "wallguy",
                "keepgambling",
                "live_sludge_reaction",
                "protoJAM"
            ]
        },
        {
            name: "kitpidgeon",
            emotes: [
                "jellyMonkaS",
                "razzleshades",
                "praygeist",
                "dustbunny_pleading",
                "naturalist_slayingston"
            ]
        },
        {
            name: "JacoTomo",
            emotes: [
                "pogaxos",
                "Leofard",
                "SmugMimic",
                "UpsetEarth",
            ]
        },
        {
            name: "Everglass",
            emotes: [
                "expressionlesshydralotl",
            ]
        },
        {
            name: "Slushy",
            emotes: [
                "piropoint",
                "sludge_bi",
                "sludge_gay",
                "sludge_lesbian",
                "sludge_nonbinary",
                "sludge_trans",
                "sheetGO"
            ]
        },
        {
            name: "Brandon",
            emotes: [
                "DRHanRat",
                "snailsman",
            ]
        },
        {
            name: "oveabandon",
            emotes: [
                "JermaGlueless",
            ]
        },
        {
            name: "Sturner",
            emotes: [
                "meowdygarf",
                "sludge_jon",
            ]
        },
        {
            name: "Jerma985",
            emotes: [
                "heartman",
                "Jermach",
            ]
        },
        {
            name: "Unknown",
            emotes: [
                "juice",
                "power",
                "goal",
                "cost",
            ]
        }
    ]

    return <div className="static-page">
        <h1>Emotes List</h1>
        <div>
            <InfoBox>
                <h2>About</h2>
                <p>
                    This is a list of all the emotes that are currently available on the site.
                    You can use them in your bio and messages, though they will not be rendered in messages sent to users on Discord.
                    Each sections contains the emotes made by that user.
                </p>
                <p>
                    If you would like to add an emote to the site, have your emotes removed, or provide correct credits for an emote, please let me know in the <code>#suggestions</code> channel in the <a href="https://discord.gg/6Z3BVbe2dJ" target="_blank" rel="noreferrer">Discord server</a>.
                </p>
            </InfoBox>
            {emotes.map((emote) => {
                return <InfoBox key={emote.name}>
                    <h2>{emote.name}</h2>
                    <p className="emotes-list">
                        {emote.emotes.map((emote) => `:${emote}:`)}
                    </p>
                </InfoBox>
            })}
        </div>
    </div>
}

export default EmotesList;