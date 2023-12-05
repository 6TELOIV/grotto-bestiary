import React from "react";
import Emote from "./Emote";

function EmoteReplacer({ children, noTooltip = false }) {
    // for each child, if it is a string, find each instance of :emote: and replace it with an emote component
    // if it is an element, recursively call this function on it's children
    const wrappedChildren = React.Children.map(children, (child) => {
        if (typeof child === "string") {
            const regex = /:(\w+):/g;
            const matches = child.matchAll(regex);
            let lastIndex = 0;
            const elements = [];
            for (const match of matches) {
                const emote = match[1];
                const index = match.index;
                elements.push(child.substring(lastIndex, index));
                elements.push(<Emote emote={emote} noTooltip={noTooltip} />);
                lastIndex = index + match[0].length;
            }
            elements.push(child.substring(lastIndex));
            return <>{elements}</>;
        } else if (React.isValidElement(child) && child.props.children) {
            return React.cloneElement(child, {
                children: <EmoteReplacer noTooltip={noTooltip}>{child.props.children}</EmoteReplacer>
            });
        } else {
            return child;
        }
    });
    return <>
        {wrappedChildren}
    </>
}

export default EmoteReplacer;