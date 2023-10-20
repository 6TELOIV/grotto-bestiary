import { getCards } from "./APIHelpers";

const regions = ["AF", "AL", "DZ", "AS", "AD", "AO", "AI", "AQ", "AG", "AR", "AM", "AW", "AU", "AT", "AZ", "BS", "BH", "BD", "BB", "BY", "BE", "BZ", "BJ", "BM", "BT", "BO", "BQ", "BA", "BW", "BV", "BR", "IO", "BN", "BG", "BF", "BI", "CV", "KH", "CM", "CA", "KY", "CF", "TD", "CL", "CN", "CX", "CC", "CO", "KM", "CD", "CG", "CK", "CR", "HR", "CU", "CW", "CY", "CZ", "CI", "DK", "DJ", "DM", "DO", "EC", "EG", "SV", "GQ", "ER", "EE", "SZ", "ET", "FK", "FO", "FJ", "FI", "FR", "GF", "PF", "TF", "GA", "GM", "GE", "DE", "GH", "GI", "GR", "GL", "GD", "GP", "GU", "GT", "GG", "GN", "GW", "GY", "HT", "HM", "VA", "HN", "HK", "HU", "IS", "IN", "ID", "IR", "IQ", "IE", "IM", "IL", "IT", "JM", "JP", "JE", "JO", "KZ", "KE", "KI", "KP", "KR", "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LY", "LI", "LT", "LU", "MO", "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MQ", "MR", "MU", "YT", "MX", "FM", "MD", "MC", "MN", "ME", "MS", "MA", "MZ", "MM", "NA", "NR", "NP", "NL", "NC", "NZ", "NI", "NE", "NG", "NU", "NF", "MP", "NO", "OM", "PK", "PW", "PS", "PA", "PG", "PY", "PE", "PH", "PN", "PL", "PT", "PR", "QA", "MK", "RO", "RU", "RW", "RE", "BL", "SH", "KN", "LC", "MF", "PM", "VC", "WS", "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SX", "SK", "SI", "SB", "SO", "ZA", "GS", "SS", "ES", "LK", "SD", "SR", "SJ", "SE", "CH", "SY", "TW", "TJ", "TZ", "TH", "TL", "TG", "TK", "TO", "TT", "TN", "TR", "TM", "TC", "TV", "UG", "UA", "AE", "GB", "UM", "US", "UY", "UZ", "VU", "VE", "VN", "VG", "VI", "WF", "EH", "YE", "ZM", "ZW", "AX"];

function getFlagEmoji(countryCode) {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

function getCountryName(code, lang = 'en') {
    if (typeof code === "undefined" || code === null) {
        return "Global";
    }
    const countryName = new Intl.DisplayNames([lang], { type: 'region' });
    return countryName.of(code);
}

function getCountries(lang = 'en') {
    const countryName = new Intl.DisplayNames([lang], { type: 'region' });
    const countries = [];
    for (const code of regions) {
        let name = countryName.of(code);
        if (code !== name) {
            countries.push({
                value: code,
                label: getFlagEmoji(code) + " " + name
            });
        }
    }
    countries.push({
        value: null,
        label: "🇺🇳 Global"
    });
    return countries;
}

async function parseCardList(list, format) {
    const cards = await getCards({});
    const mapRowToCard = (item) => {
        let card;
        if (item.name) {
            card = cards.find((card) => card.Name.toLowerCase().replaceAll("ñ", "n") === item.name.toLowerCase().replaceAll("ñ", "n"));
            if (!card) {
                throw new Error(`Card not found: "${item.name}" at "${item.line}"`);
            }
        } else if (item.number) {
            card = cards.find((card) => card.Number === item.number)
            if (!card) {
                throw new Error(`Card not found: "${item.number}" at "${item.line}"`);
            }
        }
        if (!card) {
            throw new Error(`Card not found: at "${item.line}"`);
        }
        return {
            ...card,
            Qty: item.count,
            WishQty: item.wish,
            TradeQty: item.trade,
            holo: item.holo,
        }
    };

    // Deck codes don't require splitting by line, so handle separately
    if (format === "code") {
        if (!/^GB(\!|v)((\d+)(i|j|l|\(\d+\)))+$/.test(list)) {
            throw new Error(`Error in deck code - invalid format`);
        }
        const lessThan3Values = { i: 1, j: 2, l: 3 };
        const cardsRaw = [...list.matchAll(/(\d+)(i|j|l|\(\d+\))/g)];
        let number = 0;
        return {
            cards: cardsRaw.map((card) => {
                number += parseInt(card[1]);
                let count = lessThan3Values[card[2]] ?? parseInt(card[2].substring(1, card[2].length));
                if (!count || !number) {
                    throw new Error(`Error in deck code - couldn't decode value ${card[0]}`);
                }
                return {
                    number,
                    count
                }
            }).map(mapRowToCard),
            edition: list[2]
        };
    }

    const lines = list.replaceAll('\r', '').split("\n");
    if (format === "csv" || format === "tsv") {
        const delimiter = format === "csv" ? "," : "\t";
        const header = lines[0].split(delimiter).map((item) => item.toLowerCase());

        // if any column is not one of "name", "count", "holo", "wish", or "trade", throw an error
        for (const column of header) {
            if (!["name", "count", "holo", "wish", "trade"].includes(column)) {
                throw new Error(`Invalid header: "${lines[0]}"; column "${column}" is not a valid column name`);
            }
        }

        const nameIndex = header.indexOf("name");
        const countIndex = header.indexOf("count");
        const holoIndex = header.indexOf("holo");
        const wishIndex = header.indexOf("wish");
        const tradeIndex = header.indexOf("trade");
        if (nameIndex === -1) {
            throw new Error(`Invalid header: "${lines[0]}"; header is missing a name column`);
        }
        if (countIndex === -1) {
            throw new Error(`Invalid header: "${lines[0]}"; header is missing a count column`);
        }
        return {
            cards: lines.slice(1).map((line) => {
                // get rid of any lines that are empty or only delimiters
                if (!line || line.split(delimiter).every((item) => !item)) {
                    return null;
                }
                const row = line.split(delimiter);
                const name = row[nameIndex];
                const count = parseInt(row[countIndex]);
                const holo = holoIndex !== -1 ? row[holoIndex]?.toLowerCase() === "true" : false;
                const wish = wishIndex !== -1 ? parseInt(row[wishIndex]) : 0;
                const trade = tradeIndex !== -1 ? parseInt(row[tradeIndex]) : 0;

                // throw and error if wish or trade are not numbers
                if (isNaN(wish)) {
                    throw new Error(`Invalid wish value: "${row[wishIndex]}" on line "${line}"`);
                }
                if (isNaN(trade)) {
                    throw new Error(`Invalid trade value: "${row[tradeIndex]}" on line "${line}"`);
                }

                return { name, count, holo, wish, trade, line };
            }).filter((item) => item !== null).map(mapRowToCard),
            edition: "v"
        };
    } else if (format === "decklist") {
        // instead, the count comes first and is followed by the name
        return {
            cards: lines.map((line) => {
                if (!line) {
                    return null;
                }
                const count = parseInt(line.match(/^\d+/)?.[0]);
                const name = line.match(/^\d+ (.*)$/)?.[1];
                if (!count || !name) {
                    throw new Error(`Invalid row: ${line}`);
                }
                return { name, count, holo: false, wish: 0, trade: 0, line };
            }).filter((item) => item !== null).map(mapRowToCard),
            edition: "v"
        };
    } else {
        throw new Error(`Unknown format: ${format}`);
    }
}

export { getCountryName, getCountries, getFlagEmoji, parseCardList }