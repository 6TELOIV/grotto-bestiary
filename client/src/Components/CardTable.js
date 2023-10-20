import { useState } from "react";
import "./CardTable.css";
import Twemoji from "react-twemoji";
import { Tooltip } from "react-tooltip";
import { twemojiOptions } from '../Helpers/TwemojiHelper';
import { doSort } from "../Helpers/SearchHelpers";
import EmoteReplacer from "./EmoteReplacer";
import { NavLink } from "react-router-dom";

/**
 * @param {{
 *      cards: any[],
 *      columns: {
 *          field: string,
 *          title?: string,
 *          hoverText?: string,
 *          editable?: boolean
 *          onChange?: (card: any, e: React.ChangeEvent) => void,
 *          className?: string,
 *          renderer?: (datum: any) => JSX.Element
 *          linker?: (card: any) => string
 *      }[],
 *      selectable?: boolean,
 *      showSelect?: boolean,
 *      onSelected?: (card: any, value: boolean) => void,
 *      initialSort: string,
 *      getId(card: any): string
 * }} param0
 * @returns {JSX.Element}
 */
function CardTable({ cards, columns, selectable, showSelect, onSelected, initialSort, initialReverse, getId = card => card._id + (card.holo ? "holo" : ""), loading }) {
    const [sortBy, setSortBy] = useState(initialSort);
    const [reverseSort, setReverseSort] = useState(initialReverse);
    const [tableId] = useState(Math.random());
    const [tooltipField, setTooltipField] = useState(null);

    function handleSort(field) {
        if (tooltipField !== field) {
            setTooltipField(field);
            return;
        }
        if (sortBy === field) {
            setReverseSort(!reverseSort);
        } else {
            setSortBy(field);
            setReverseSort(false);
        }
    }

    // if loading, show a skeleton table body with 5 rows. otherwise, show the real table body
    return (
        <table key={JSON.stringify(cards)} className={loading ? "skeleton" : ""}>
            <thead>
                <tr>
                    {showSelect ? <th className="small-column unsortable"></th> : null}
                    {columns.map((col) => (
                        <th
                            key={tableId.toString() + col.field}
                            scope="col"
                            className={
                                (sortBy === col.field ? (reverseSort ? "reverse-sorted " : "sorted ") : "") + col.className
                            }
                            onMouseEnter={() => setTooltipField(col.field)}
                            onClick={() => handleSort(col.field)}
                            data-tooltip-id={tableId.toString() + col.field}
                            data-tooltip-content={(col.hoverText ?? col.field) + (sortBy === col.field ? (reverseSort ? " (descending)" : " (ascending) ") : "")}
                        >
                            <EmoteReplacer noTooltip>
                                <Twemoji
                                    options={twemojiOptions}
                                    tag="span"
                                >
                                    {col.title ?? col.field}
                                </Twemoji>
                            </EmoteReplacer>
                            <Tooltip id={tableId.toString() + col.field} />
                        </th>
                    ))}
                </tr>
            </thead>
            {
                loading ?
                    <tbody>
                        {[...Array(5)].map((_, i) => (
                            <tr>
                                {showSelect ? <td className="small-column unsortable"></td> : null}
                                {columns.map((col) => (
                                    <td key={tableId?.toString() + col.field} className={col.className}>
                                        <div />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                    :
                    <tbody>
                        {cards
                            .sort((a, b) => doSort(a, b, sortBy, reverseSort))
                            .map((card) => {
                                return (
                                    <tr key={tableId?.toString() + getId(card)} className={card.holo ? "holo" : ""}>
                                        {showSelect ? (
                                            <td className="small-column center-column">
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => onSelected(card, e.currentTarget.checked)}
                                                    checked={card.selected}
                                                    disabled={!selectable}
                                                />
                                            </td>
                                        ) : (
                                            null
                                        )}
                                        {columns.map((col) => {
                                            let value = col.renderer?.(card) ?? card[col.field];
                                            return (
                                                <td className={col.className} key={tableId?.toString() + getId(card) + col.field}>
                                                    {col.editable ? (
                                                        <input
                                                            className="card-qty"
                                                            type="number"
                                                            onClick={(e) => e.target.select()}
                                                            onChange={(e) => col.onChange(card, e, col)}
                                                            defaultValue={value}
                                                        ></input>
                                                    ) : col.linker ? (
                                                        <NavLink to={col.linker(card)}>{value}</NavLink>
                                                    ) : (
                                                        <Twemoji options={twemojiOptions} tag="span">{value}</Twemoji>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                    </tbody>
            }
        </table>
    );
}

export default CardTable;
