import { cardNameToCardImageURL } from "./APIHelpers";

function save(filename, data) {
    const blob = new Blob([data], { type: 'text/json' });
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else {
        const elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}

function makeTTSDeck(decklist) {
    //Regexp to get the integer from the front
    const numRe = /^(\d+)/g
    //position of all objects in TTS
    const Transform = {
        "posX": 0,
        "posY": 1,
        "posZ": 0,
        "rotX": 0,
        "rotY": 180,
        "rotZ": 180,
        "scaleX": 1,
        "scaleY": 1,
        "scaleZ": 1
    }

    //TTS Object
    let ttsDeck = {
        ObjectStates: [
            {
                Name: "DeckCustom",
                ContainedObjects: [],
                DeckIDs: [],
                CustomDeck: {},
                Transform: Transform
            }
        ]
    };

    //For each card and quantity, add the necessary objects to the TTS deck object.
    let cardID = 1;
    for (let row of decklist.split('\n')) {
        //Skip blank newlines, often there's one at the end of the file.
        if (row === '') continue;
        //Get the count and name
        let count = parseInt(row.match(numRe)[0]);
        let cardName = row.substring(row.indexOf(' ') + 1);

        //Not sure what exactly TTS is doing with all these objects, but it needs:
        //      one CustomDeck entry for each unique card
        //      `count` DeckIDs entries
        //      `count` ContainedObjects entries
        let customDeckEntry = {
            FaceURL: cardNameToCardImageURL(cardName, ".jpg"),
            BackURL: "https://grotto-beast-cards-images.s3.us-east-2.amazonaws.com/CardBack.jpg",
            NumHeight: 1,
            NumWidth: 1,
            BackIsHidden: true
        }
        let containedObjectsEntry = {
            CardID: cardID * 100,
            Name: "Card",
            Nickname: cardName,
            Transform: Transform
        }

        ttsDeck.ObjectStates[0].CustomDeck[cardID.toString()] = customDeckEntry;
        for (let i = 0; i < count; i++){
            ttsDeck.ObjectStates[0].DeckIDs.push(cardID * 100);
            ttsDeck.ObjectStates[0].ContainedObjects.push(containedObjectsEntry);
        }
        cardID++;
    }
    // Return as text for download
    return JSON.stringify(ttsDeck);
}

export { save, makeTTSDeck };
