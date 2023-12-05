function parseStringToRegex(str, match) {
    if (str === "") {
        return "";
    }
    // Find all text in quotes, put in exactText
    const re = /"(.*?)"/g;
    const textToMatch = [];
    let current = re.exec(str);
    while (current) {
        textToMatch.push(current.pop());
        current = re.exec(str);
    }

    let nonQuoted = str.replaceAll(re, "");

    textToMatch.push(...nonQuoted.split(' '));

    for (let i = 0; i < textToMatch.length; i++) {
        textToMatch[i] = textToMatch[i]
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') //escape regex special chars https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
    }

    if (!match) {
        return (
            textToMatch.filter(w => w !== "")
                .join('|')
                .replace('n', '[nñ]') //poñata
        );
    } else if (match === "All") { //https://stackoverflow.com/questions/1177081/multiple-words-in-any-order-using-regex
        return (
            '(?=[\\S\\s]*' + textToMatch.filter(w => w !== "")
                .join(')(?=[\\S\\s]*')
                .replace('n', '[nñ]') + ')' //poñata
        );
    } else if (match === "None") { //https://stackoverflow.com/questions/7801581/regex-for-string-not-containing-multiple-specific-words
        return (
            '^(?![\\S\\s]*(' + textToMatch.filter(w => w !== "")
                .join('|')
                .replace('n', '[nñ]') + '))[\\S\\s]*$' //poñata
        );
    }
}

function doSort(aCard, bCard, sortBy, reverseSort) {
    let a = aCard[sortBy];
    let b = bCard[sortBy];

    let ret = 0;
    if (a < b || typeof a === "undefined" || a === null) {
        ret = -1;
    }
    if (a > b || typeof b === "undefined" || b === null) {
        ret = 1;
    }
    if (reverseSort) {
        ret *= -1;
    }
    if (a === "-") {
        ret = 1;
    }
    if (b === "-") {
        ret = -1;
    }
    return ret;
}

function parseStringToNumberAndOperator(str) {
    //get number, rest is operator
    const re = /\d.*/g;
    let num = re.exec(str);

    try {
        num = parseInt(num.pop());
    } catch {
        num = null;
    }

    let opRaw = str.replaceAll(re, "");
    let opForQuery;
    switch (opRaw) {
        case "<":
            opForQuery = "$lt";
            break;
        case ">":
            opForQuery = "$gt";
            break;
        case "<=":
            opForQuery = "$lte";
            break;
        case ">=":
            opForQuery = "$gte";
            break;
        case "!=":
            opForQuery = "$ne";
            break;
        case "=":
        default:
            opForQuery = "$eq";
            break;
    }

    return [num, opForQuery];
}

export { parseStringToRegex, parseStringToNumberAndOperator, doSort };

