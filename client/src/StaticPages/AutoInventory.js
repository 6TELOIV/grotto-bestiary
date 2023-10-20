import { useEffect, useState } from "react";
import ButtonGroup from "../Components/ButtonGroup";
import InfoBox from "../Components/InfoBox";
import "./AutoInventory.css"
import { useLoaderData } from "react-router-dom";

function AutoInventory() {

    const { currentUser } = useLoaderData();

    const [selectedExampleRules, setSelectedExampleRules] = useState(null);
    const [currentRules, _setCurrentRules] = useState({ rules: currentUser.autoInventoryRules ?? [] });

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const intTestRegex = /^-?\d+$/;

    function setCurrentRules(rules) {
        // limit to 200 rules
        if (rules.rules.length > 400) {
            return;
        }
        _setCurrentRules(rules);
    }

    useEffect(() => {
        if (selectedExampleRules) {
            setCurrentRules(selectedExampleRules);
        }
    }, [selectedExampleRules]);

    const fullSetRules = {
        "rules": [
            {
                "name": "One of each card",
                "filter": {
                    "holo": false,
                },
                "tradeQty": [
                    {
                        "case": "qty=0",
                        "value": 0,
                    },
                    {
                        "case": "default",
                        "value": "qty-1",
                    },
                ],
                "wishQty": [
                    {
                        "case": "qty=0",
                        "value": 1,
                    },
                    {
                        "case": "default",
                        "value": 0,
                    },
                ],
            },
        ],
    }

    const playSetRules = {
        "rules": [
            {
                "name": "One of each challenger card",
                "filter": {
                    "type": "Challenger",
                    "holo": false,
                },
                "tradeQty": [
                    {
                        "case": "qty=0",
                        "value": 0,
                    },
                    {
                        "case": "default",
                        "value": "qty-1",
                    },
                ],
                "wishQty": [
                    {
                        "case": "qty=0",
                        "value": 1,
                    },
                    {
                        "case": "default",
                        "value": 0,
                    },
                ],
            },
            {
                "name": "Three of each non-challenger card",
                "filter": {
                    "holo": false,
                },
                "tradeQty": [
                    {
                        "case": "qty<3",
                        "value": 0,
                    },
                    {
                        "case": "default",
                        "value": "qty-3",
                    },
                ],
                "wishQty": [
                    {
                        "case": "qty>=3",
                        "value": 0,
                    },
                    {
                        "case": "default",
                        "value": "3-qty",
                    },
                ],
            },
        ],
    }

    const examples = [
        {
            label: "Full Set Rules",
            value: fullSetRules
        },
        {
            label: "Playset Rules",
            value: playSetRules,
        }
    ]

    function updateFilterField(index, field, value) {
        setCurrentRules(
            {
                rules: currentRules.rules.map((r, i) => {
                    if (i === index) {
                        return {
                            ...r,
                            filter: {
                                ...r.filter,
                                [field]: value === "" ? undefined : value,
                            }
                        }
                    } else {
                        return r;
                    }
                })
            }
        )
    }

    return (
        <div className="static-page">
            <h1>Auto Update Inventory Configuration</h1>
            <div>
                <InfoBox>
                    <h2>🤔 Help! What is this thing???</h2>
                    <p>
                        This page allows you to configure how your inventory is updated when you receive a trade or a wish is granted. An <a href="https://docs.google.com/document/d/1zff0JkiV6kGHRu6k73AmTqYMkb65ApFIWhfm0s3ypU0/edit?usp=sharing">extensive document</a> is available which explains in great detail how to use it.
                    </p>
                </InfoBox>
                <InfoBox>
                    <h2>Load Preset Rules</h2>
                    <ButtonGroup options={examples} selected={selectedExampleRules} onSelect={setSelectedExampleRules} />
                </InfoBox>
                <InfoBox>
                    <h2>Your Inventory Rules</h2>
                    <div className="rules">
                        {
                            currentRules?.rules?.map((rule, index) => {
                                return (
                                    <div className="rule" key={"rule" + index}>
                                        <h3>{rule.name ?? `Rule #${index + 1}`}</h3>
                                        <button className="delete" onClick={() => {
                                            setCurrentRules(
                                                {
                                                    rules: currentRules.rules.filter((r, i) => i !== index)
                                                }
                                            )
                                        }}>❌</button>
                                        <span className="row-end-buttons">
                                            <button className="move-up" onClick={() => {
                                                if (index === 0) {
                                                    return;
                                                }
                                                setCurrentRules(
                                                    {
                                                        rules: currentRules.rules.map((r, i) => {
                                                            if (i === index - 1) {
                                                                return rule;
                                                            } else if (i === index) {
                                                                return currentRules.rules[index - 1];
                                                            } else {
                                                                return r;
                                                            }
                                                        })
                                                    }
                                                )
                                            }}>↑</button>
                                            <button className="move-down" onClick={() => {
                                                if (index === currentRules.rules.length - 1) {
                                                    return;
                                                }
                                                setCurrentRules(
                                                    {
                                                        rules: currentRules.rules.map((r, i) => {
                                                            if (i === index) {
                                                                return currentRules.rules[index + 1];
                                                            } else if (i === index + 1) {
                                                                return rule;
                                                            } else {
                                                                return r;
                                                            }
                                                        })
                                                    }
                                                )
                                            }}>↓</button>
                                        </span>
                                        <label htmlFor={"rulename" + index}>Name</label>
                                        <input key={"rulename" + index} className="wide-input" type="text" id={"rulename" + index} value={rule.name} onChange={(e) => {
                                            setCurrentRules(
                                                {
                                                    rules: currentRules.rules.map((r, i) => {
                                                        if (i === index) {
                                                            return {
                                                                ...r,
                                                                name: e.target.value === "" ? undefined : e.target.value,
                                                            }
                                                        } else {
                                                            return r;
                                                        }
                                                    })
                                                }
                                            )
                                        }} />
                                        <h4>Filter</h4>
                                        <label htmlFor={"name" + index}>Name</label>
                                        <input key={"rule" + index + "name"} placeholder="*" className="wide-input" type="text" id={"name" + index} value={rule.filter.name ?? ""} onChange={(e) => updateFilterField(index, "name", e.target.value)} />
                                        <label key={"rule" + index + "namelabel"} htmlFor={"type" + index}>Type</label>
                                        <input key={"rule" + index + "type"} placeholder="*" className="wide-input" type="text" id={"type" + index} value={rule.filter.type ?? ""} onChange={(e) => updateFilterField(index, "type", e.target.value)} />
                                        <label key={"rule" + index + "typelabel"} htmlFor={"rarity" + index}>Rarity</label>
                                        <input key={"rule" + index + "rarity"} placeholder="R/C" className="wide-input" type="text" id={"rarity" + index} value={rule.filter.rarity ?? ""} onChange={(e) => updateFilterField(index, "rarity", e.target.value)} />
                                        <label key={"rule" + index + "hololabel"} htmlFor={"holo" + index}>Holo</label>
                                        <span key={"rule" + index + "holospan"} className="wide-input">
                                            <button className={`action-button holo-toggle${rule.filter.holo === false ? "" : (
                                                rule.filter.holo === undefined ? " either-selected" :
                                                    " holo-selected"
                                            )
                                                }`} key={"rule" + index + "holo" + rule.filter.holo} id={"holo" + index} role="checkbox" aria-checked={
                                                    rule.filter.holo === false ? "false" : (
                                                        rule.filter.holo === undefined ? "mixed" :
                                                            "true"
                                                    )
                                                } onClick={() => {
                                                    if (rule.filter.holo === false) {
                                                        updateFilterField(index, "holo", undefined);
                                                    } else if (rule.filter.holo === undefined) {
                                                        updateFilterField(index, "holo", true);
                                                    } else {
                                                        updateFilterField(index, "holo", false);
                                                    }
                                                }}>
                                                {rule.filter.holo === false ? "🌑 Non-Holo" : (
                                                    rule.filter.holo === undefined ? "🌗 Either" :
                                                        "🌕 Holo"
                                                )}
                                            </button>
                                        </span>
                                        <h4>Trade Quantity</h4>
                                        {
                                            rule.tradeQty.map((caseValuePair, cvpIndex) => {
                                                return (
                                                    <>
                                                        <label htmlFor={"case" + index + cvpIndex}>Case</label>
                                                        <input className="cvp-case" type="text" id={"case" + index + cvpIndex} value={caseValuePair.case} onChange={(e) => {
                                                            setCurrentRules(
                                                                {
                                                                    rules: currentRules.rules.map((r, i) => {
                                                                        if (i === index) {
                                                                            return {
                                                                                ...r,
                                                                                tradeQty: r.tradeQty.map((cvp, j) => {
                                                                                    if (j === cvpIndex) {
                                                                                        return {
                                                                                            ...cvp,
                                                                                            case: e.target.value,
                                                                                        }
                                                                                    } else {
                                                                                        return cvp;
                                                                                    }
                                                                                })
                                                                            }
                                                                        } else {
                                                                            return r;
                                                                        }
                                                                    })
                                                                }
                                                            )
                                                        }} />
                                                        <label htmlFor={"value" + index + cvpIndex}>Value</label>
                                                        <input className="cvp-value" type="text" id={"value" + index + cvpIndex} value={caseValuePair.value} onChange={(e) => {
                                                            setCurrentRules(
                                                                {
                                                                    rules: currentRules.rules.map((r, i) => {
                                                                        if (i === index) {
                                                                            return {
                                                                                ...r,
                                                                                tradeQty: r.tradeQty.map((cvp, j) => {
                                                                                    if (j === cvpIndex) {
                                                                                        return {
                                                                                            ...cvp,
                                                                                            value: intTestRegex.test(e.target.value) ? parseInt(e.target.value) : e.target.value,
                                                                                        }
                                                                                    } else {
                                                                                        return cvp;
                                                                                    }
                                                                                })
                                                                            }
                                                                        } else {
                                                                            return r;
                                                                        }
                                                                    })
                                                                }
                                                            )
                                                        }} />
                                                        <button className="delete" onClick={() => {
                                                            setCurrentRules(
                                                                {
                                                                    rules: currentRules.rules.map((r, i) => {
                                                                        if (i === index) {
                                                                            return {
                                                                                ...r,
                                                                                tradeQty: r.tradeQty.filter((cvp, j) => j !== cvpIndex)
                                                                            }
                                                                        } else {
                                                                            return r;
                                                                        }
                                                                    })
                                                                }
                                                            )
                                                        }}>❌</button>
                                                        <span className="row-end-buttons">
                                                            <button className="move-up" onClick={() => {
                                                                setCurrentRules(
                                                                    {
                                                                        rules: currentRules.rules.map((r, i) => {
                                                                            if (i === index) {
                                                                                return {
                                                                                    ...r,
                                                                                    tradeQty: r.tradeQty.map((cvp, j) => {
                                                                                        if (j === cvpIndex && j !== 0) {
                                                                                            return r.tradeQty[j - 1];
                                                                                        } else if (j === cvpIndex - 1 && j !== r.tradeQty.length - 1) {
                                                                                            return r.tradeQty[j + 1];
                                                                                        } else {
                                                                                            return cvp;
                                                                                        }
                                                                                    })
                                                                                }
                                                                            } else {
                                                                                return r;
                                                                            }
                                                                        })
                                                                    }
                                                                )
                                                            }}>↑</button>
                                                            <button className="move-down" onClick={() => {
                                                                setCurrentRules(
                                                                    {
                                                                        rules: currentRules.rules.map((r, i) => {
                                                                            if (i === index) {
                                                                                return {
                                                                                    ...r,
                                                                                    tradeQty: r.tradeQty.map((cvp, j) => {
                                                                                        if (j === cvpIndex && j !== r.tradeQty.length - 1) {
                                                                                            return r.tradeQty[j + 1];
                                                                                        } else if (j === cvpIndex + 1 && j !== 0) {
                                                                                            return r.tradeQty[j - 1];
                                                                                        } else {
                                                                                            return cvp;
                                                                                        }
                                                                                    })
                                                                                }
                                                                            } else {
                                                                                return r;
                                                                            }
                                                                        })
                                                                    }
                                                                )
                                                            }}>↓</button>
                                                        </span>
                                                    </>
                                                )
                                            })
                                        }
                                        <button className="add" onClick={() => {
                                            setCurrentRules(
                                                {
                                                    rules: currentRules.rules.map((r, i) => {
                                                        if (i === index) {
                                                            return {
                                                                ...r,
                                                                tradeQty: [...r.tradeQty, { case: "", value: "" }]
                                                            }
                                                        } else {
                                                            return r;
                                                        }
                                                    })
                                                }
                                            )
                                        }}>+  Trade Case</button>
                                        <h4>Wish Quantity</h4>
                                        {
                                            rule.wishQty.map((caseValuePair, cvpIndex) => {
                                                return (
                                                    <>
                                                        <label htmlFor={"case" + index + cvpIndex}>Case</label>
                                                        <input className="cvp-case" type="text" id={"case" + index + cvpIndex} value={caseValuePair.case} onChange={(e) => {
                                                            setCurrentRules(
                                                                {
                                                                    rules: currentRules.rules.map((r, i) => {
                                                                        if (i === index) {
                                                                            return {
                                                                                ...r,
                                                                                wishQty: r.wishQty.map((cvp, j) => {
                                                                                    if (j === cvpIndex) {
                                                                                        return {
                                                                                            ...cvp,
                                                                                            case: e.target.value,
                                                                                        }
                                                                                    } else {
                                                                                        return cvp;
                                                                                    }
                                                                                })
                                                                            }
                                                                        } else {
                                                                            return r;
                                                                        }
                                                                    })
                                                                }
                                                            )
                                                        }} />
                                                        <label htmlFor={"value" + index + cvpIndex}>Value</label>
                                                        <input className="cvp-value" type="text" id={"value" + index + cvpIndex} value={caseValuePair.value} onChange={(e) => {
                                                            setCurrentRules(
                                                                {
                                                                    rules: currentRules.rules.map((r, i) => {
                                                                        if (i === index) {
                                                                            return {
                                                                                ...r,
                                                                                wishQty: r.wishQty.map((cvp, j) => {
                                                                                    if (j === cvpIndex) {
                                                                                        return {
                                                                                            ...cvp,
                                                                                            value: intTestRegex.test(e.target.value) ? parseInt(e.target.value) : e.target.value,
                                                                                        }
                                                                                    } else {
                                                                                        return cvp;
                                                                                    }
                                                                                })
                                                                            }
                                                                        } else {
                                                                            return r;
                                                                        }
                                                                    })
                                                                }
                                                            )
                                                        }} />
                                                        <button className="delete" onClick={() => {
                                                            setCurrentRules(
                                                                {
                                                                    rules: currentRules.rules.map((r, i) => {
                                                                        if (i === index) {
                                                                            return {
                                                                                ...r,
                                                                                wishQty: r.wishQty.filter((cvp, j) => j !== cvpIndex),
                                                                            }
                                                                        } else {
                                                                            return r;
                                                                        }
                                                                    })
                                                                }
                                                            )
                                                        }}>❌</button>
                                                        <span className="row-end-buttons">
                                                            <button className="move-up" onClick={() => {
                                                                setCurrentRules(
                                                                    {
                                                                        rules: currentRules.rules.map((r, i) => {
                                                                            if (i === index) {
                                                                                return {
                                                                                    ...r,
                                                                                    wishQty: r.wishQty.map((cvp, j) => {
                                                                                        if (j === cvpIndex && j !== 0) {
                                                                                            return r.wishQty[j - 1];
                                                                                        } else if (j === cvpIndex - 1 && j !== r.wishQty.length - 1) {
                                                                                            return r.wishQty[j + 1];
                                                                                        } else {
                                                                                            return cvp;
                                                                                        }
                                                                                    })
                                                                                }
                                                                            } else {
                                                                                return r;
                                                                            }
                                                                        })
                                                                    }
                                                                )
                                                            }}>↑</button>
                                                            <button className="move-down" onClick={() => {
                                                                setCurrentRules(
                                                                    {
                                                                        rules: currentRules.rules.map((r, i) => {
                                                                            if (i === index) {
                                                                                return {
                                                                                    ...r,
                                                                                    wishQty: r.wishQty.map((cvp, j) => {
                                                                                        if (j === cvpIndex && j !== r.wishQty.length - 1) {
                                                                                            return r.wishQty[j + 1];
                                                                                        } else if (j === cvpIndex + 1 && j !== 0) {
                                                                                            return r.wishQty[j - 1];
                                                                                        } else {
                                                                                            return cvp;
                                                                                        }
                                                                                    })
                                                                                }
                                                                            } else {
                                                                                return r;
                                                                            }
                                                                        })
                                                                    }
                                                                )
                                                            }}>↓</button>
                                                        </span>
                                                    </>
                                                )
                                            })
                                        }
                                        <button className="add" onClick={() => {
                                            setCurrentRules(
                                                {
                                                    rules: currentRules.rules.map((r, i) => {
                                                        if (i === index) {
                                                            return {
                                                                ...r,
                                                                wishQty: [...r.wishQty, { case: "", value: "" }],
                                                            }
                                                        } else {
                                                            return r;
                                                        }
                                                    })
                                                }
                                            )
                                        }}>+ Wish Case</button>
                                    </div>
                                )
                            })
                        }
                        {
                            currentRules.rules.length === 400 ?
                                <p className="warning">You have reached the maximum number of rules (400 rules; you are wild!!!).</p>
                                :
                                <button className="add add-primary" onClick={() => {
                                    setCurrentRules(
                                        {
                                            rules: [...currentRules.rules, {
                                                filter: {},
                                                tradeQty: [{
                                                    case: "default",
                                                    value: 0,
                                                }],
                                                wishQty: [
                                                    {
                                                        case: "default",
                                                        value: 0,
                                                    }
                                                ],
                                            }]
                                        }
                                    )
                                }}>+  Rule</button>
                        }
                    </div>
                </InfoBox>
                <InfoBox>
                    <h2>Actions</h2>
                    <button className="action-button" onClick={async () => {
                        const response = await fetch("/autoInventory", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(currentRules),
                        });
                        if (response.ok) {
                            // set success to true, and refresh after 3 seconds
                            setSuccess(true);
                            setTimeout(() => {
                                window.location.reload();
                            }
                                , 3000);
                        } else {
                            // set error to the error message
                            setError((await response.json()).error_message);
                        }
                    }}>Save</button>
                    {success && <p>✅Successfully saved! Refreshing in 3 seconds...</p>}
                    {error && <p>🚫{error}</p>}
                </InfoBox>
            </div>
        </div>
    )
}

export default AutoInventory;