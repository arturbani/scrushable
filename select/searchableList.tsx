import React, { PropsWithChildren, useState, useRef, useEffect } from "react";

import "./index.css";
import { Keys } from "./constants";
import { SelectSearchableCSSType } from "./selectSearchable";

export type ItemBaseType = { label: string; value: number | string };

export type OptionItemType<I> = PropsWithChildren<
  WithItemBaseType<I> & {
    focused: boolean;
  }
>;

export type WithItemBaseType<T> = T & ItemBaseType;

type PropsType<I> = {
  items: Array<WithItemBaseType<I>>;
  css?: SelectSearchableCSSType;
  noOptionsMessage?: string;
  option?: (props: OptionItemType<I>) => JSX.Element;
  onSelectedItem: (item: WithItemBaseType<I>) => void;
  disable?: (item: WithItemBaseType<I>) => boolean;
  itemToSelect?: (
    items: Array<WithItemBaseType<I>>,
    value: WithItemBaseType<I>
  ) => number;
};

export default function SearchableList<SearchItemsType>({
  items,
  css,
  noOptionsMessage,
  option: Option,
  onSelectedItem,
  disable,
  itemToSelect,
}: PropsType<SearchItemsType>) {
  const [focus, setFocus] = useState<number>(0);
  const [itemHover, setItemHover] = useState<boolean>(true);

  const refList = useRef<HTMLDivElement>(null);
  const refItemList = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation();
      const disabled = disable && disable(items[focus]);

      const setItemFocus = (focus: number) => {
        if (!refList.current || !refItemList.current) return;

        const listHeight = refList.current.offsetHeight;
        const listItemHeight = refItemList.current.offsetHeight;

        if (listHeight && listItemHeight) {
          setFocus(focus);
          setItemHover(false);
        }
      };

      if (e.key === Keys.ARROW_UP) {
        e.preventDefault();
        const prevFocus = focus === 0 ? items.length - 1 : focus - 1;
        setItemFocus(prevFocus);
      } else if (e.key === Keys.ARROW_DOWN) {
        e.preventDefault();
        const nextFocus = focus === items.length - 1 ? 0 : focus + 1;
        setItemFocus(nextFocus);
      } else if (e.key === Keys.ENTER) {
        e.preventDefault();
        !disabled && onSelectedItem(items[focus]);
      } else if (e.key === Keys.ESCAPE) {
        e.preventDefault();
        !disabled && onSelectedItem(items[focus]);
      }
    };
    const onMouseMove = () => {
      setItemHover(true);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [focus, itemHover, items, disable, onSelectedItem]);

  const classesName = (item: WithItemBaseType<SearchItemsType>) => {
    const itemSelected = itemToSelect
      ? itemToSelect(items, item)
      : items.map((item: ItemBaseType) => item.value).indexOf(item.value);
    return `selectSearchable-label ${
      focus === itemSelected ? "selectSearchable-labelSelected" : ""
    } ${itemHover ? "selectSearchable-labelFocus" : ""}`;
  };

  return (
    <div
      ref={refList}
      className={`searchableListScroll ${css ? css.scroll : ""}`}
    >
      <ul className={`searchableList ${css ? css.list : ""}`}>
        {items.length > 0 ? (
          items.map(
            (item: WithItemBaseType<SearchItemsType>, index: number) => {
              const disabled = disable && disable(item);
              return (
                <li
                  ref={index === focus ? refItemList : null}
                  className={`${classesName(item)} ${css ? css.item : ""}`}
                  key={item.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    !disabled && onSelectedItem(item);
                  }}
                >
                  {Option ? (
                    <Option {...item} focused={index === focus} />
                  ) : (
                    <div>{item.label}</div>
                  )}
                </li>
              );
            }
          )
        ) : (
          <span
            className={`${css ? css.notFound : "searchableList-notFound "}`}
          >
            {noOptionsMessage || ""}
          </span>
        )}
      </ul>
    </div>
  );
}
