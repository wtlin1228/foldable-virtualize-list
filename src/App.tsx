import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { data as MOCK_DATA } from "./mock-data";
import { useDataControl } from "./data-control";

export function App() {
  return <RowVirtualizerDynamic />;
}

const PAGE_COUNT = 30;

const fetchMore = ({ offset, count }: { offset: number; count: number }) => {
  return MOCK_DATA.slice(offset, offset + count);
};

function RowVirtualizerDynamic() {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const [offset, setOffset] = React.useState(0);
  const dataControl = useDataControl();

  const count = dataControl.getDataCount();

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div>
      <button
        onClick={() => {
          const more = fetchMore({ offset, count: PAGE_COUNT });
          setOffset(offset + PAGE_COUNT);
          dataControl.append(more);
        }}
      >
        fetch more
      </button>
      <button
        onClick={() => {
          virtualizer.scrollToIndex(0);
        }}
      >
        scroll to the top
      </button>
      <span style={{ padding: "0 4px" }} />
      <button
        onClick={() => {
          virtualizer.scrollToIndex(count / 2);
        }}
      >
        scroll to the middle
      </button>
      <span style={{ padding: "0 4px" }} />
      <button
        onClick={() => {
          virtualizer.scrollToIndex(count - 1);
        }}
      >
        scroll to the end
      </button>
      <span style={{ padding: "0 4px" }} />
      <hr />
      <div
        ref={parentRef}
        className="List"
        style={{
          height: 400,
          width: 400,
          overflowY: "auto",
          contain: "strict",
        }}
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: "100%",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${items[0]?.start ?? 0}px)`,
            }}
          >
            {items.map((virtualRow) => {
              const row = dataControl.getRowByIndex(virtualRow.index);
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  className={
                    virtualRow.index % 2 ? "ListItemOdd" : "ListItemEven"
                  }
                >
                  <div style={{ padding: "10px 0" }}>
                    {row.type === "entry" && (
                      <>
                        <div>
                          Row {virtualRow.index} ({row.data.time}
                          s)
                        </div>
                        <div>{row.data.content}</div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
