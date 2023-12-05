
import { useSearchParams } from 'react-router-dom';
import './CardSearchForm.css';
import { useState } from 'react';
import EmoteReplacer from './EmoteReplacer';

function CardSearchForm({ search, collapsed }) {
    const [params] = useSearchParams();

    const [nameRaw, setNameRaw] = useState(params.get("nameRaw"));
    const [nameMatch, setNameMatch] = useState(params.get("nameMatch"));
    const [typeRaw, setTypeRaw] = useState(params.get("typeRaw"));
    const [typeMatch, setTypeMatch] = useState(params.get("typeMatch"));
    const [effectRaw, setEffectRaw] = useState(params.get("effectRaw"));
    const [effectMatch, setEffectMatch] = useState(params.get("effectMatch"));
    const [powerRaw, setPowerRaw] = useState(params.get("powerRaw"));
    const [goalRaw, setGoalRaw] = useState(params.get("goalRaw"));
    const [costRaw, setCostRaw] = useState(params.get("costRaw"));
    const [isEpic, setIsEpic] = useState(params.get("isEpic"));

    function handleSubmit(e) {
        e.preventDefault();

        const searchParams = {
            nameRaw,
            nameMatch,
            typeRaw,
            typeMatch,
            effectRaw,
            effectMatch,
            powerRaw,
            goalRaw,
            costRaw,
            isEpic
        };

        for (const key in searchParams) {
            if (!searchParams[key]) {
                delete searchParams[key];
            }
        }

        search(new URLSearchParams(searchParams));
    }

    return (
        <form onSubmit={handleSubmit} className={collapsed ? "hide" : ""}>
            <div className="form-row">
                <div className={`input-group`}>
                    <label htmlFor="name">Name</label>
                    <input size="1" type="text" name="name" defaultValue={nameRaw} onChange={e => setNameRaw(e.target.value)}></input>
                    <select name="nameMatch" defaultValue={nameMatch} onChange={e => setNameMatch(e.target.value)}>
                        <option value="">Any</option>
                        <option value="All">All</option>
                        <option value="None">None</option>
                    </select>
                </div>
                <p>Match on <i>any/all/none</i> of the words separated by space, use double quotes " to consider quoted text 1 word.</p>
            </div>
            <div className="form-row">
                <div className={`input-group`}>
                    <label htmlFor="type">Type</label>
                    <input size="1" type="text" name="type" defaultValue={typeRaw} onChange={e => setTypeRaw(e.target.value)}></input>
                    <select name="typeMatch" defaultValue={typeMatch} onChange={e => setTypeMatch(e.target.value)}>
                        <option value="">Any</option>
                        <option value="All">All</option>
                        <option value="None">None</option>
                    </select>
                </div>
                <div className={`input-group`}>
                    <label htmlFor="epic">Epic?</label>
                    <select name="epic" defaultValue={isEpic} onChange={e => setIsEpic(e.target.value)}>
                        <option value="">Any</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
                </div>
                <p>Match on <i>any/all/none</i> of the words separated by space, use double quotes " to consider quoted text 1 word.</p>
            </div>
            <div className="form-row">
                <EmoteReplacer>
                    <div className={`input-group`}>
                        <label htmlFor="power">:power:</label>
                        <input size="1" className={`small-input`} type="text" name="power" defaultValue={powerRaw} onChange={e => setPowerRaw(e.target.value)} placeholder='Combat Power'></input>
                    </div>
                    <div className={`input-group`}>
                        <label htmlFor="goal">:goal:</label>
                        <input size="1" className={`small-input`} type="text" name="goal" defaultValue={goalRaw} onChange={e => setGoalRaw(e.target.value)} placeholder='Challenger Goal'></input>
                    </div>
                    <div className={`input-group`}>
                        <label htmlFor="cost">:cost:</label>
                        <input size="1" className={`small-input`} type="text" name="cost" defaultValue={costRaw} onChange={e => setCostRaw(e.target.value)} placeholder='Summoning Cost'></input>
                    </div>
                </EmoteReplacer>
                <p>ex: 3, =3, &gt;3, &lt;3, &gt;=3, or &lt;=3</p>
            </div>
            <div className="form-row">
                <div className={`input-group`}>
                    <label htmlFor="effect">Effect</label>
                    <input size="1" type="text" name="effect" defaultValue={effectRaw} onChange={e => setEffectRaw(e.target.value)}></input>
                    <select name="effectMatch" defaultValue={effectMatch} onChange={e => setEffectMatch(e.target.value)}>
                        <option value="">Any</option>
                        <option value="All">All</option>
                        <option value="None">None</option>
                    </select>
                </div>
                <p>Match on <i>any/all/none</i> of the words separated by space, use double quotes " to consider quoted text 1 word.</p>
            </div>
            <input type="submit"></input>
        </form>
    );
}

export default CardSearchForm;
