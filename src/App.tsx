import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { data as MOCK_DATA } from "./mock-data";
import { useEntryGroup } from "./data-control";

export function App() {
  return <RowVirtualizerDynamic />;
}

const PAGE_COUNT = 50;

const fetchMore = ({ offset, count }: { offset: number; count: number }) => {
  return MOCK_DATA.slice(offset, offset + count);
};

function RowVirtualizerDynamic() {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const [offset, setOffset] = React.useState(0);
  const entryGroup = useEntryGroup();

  const count = entryGroup.getVisibleItemCount();

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
  });

  const items = virtualizer.getVirtualItems();
  const rows = entryGroup.getRowsByIndexes(items.map(({ index }) => index));

  return (
    <div>
      <button
        onClick={() => {
          const more = fetchMore({ offset, count: PAGE_COUNT });
          setOffset(offset + PAGE_COUNT);
          entryGroup.append(more);
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
            {items.map((virtualRow, i) => {
              const row = rows[i];
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  className={row.type === "group" ? "Group" : "Entry"}
                >
                  <div style={{ padding: "10px 0" }}>
                    {row.type === "group" && (
                      <>
                        <div>Group {row.data.name}</div>
                        <div>
                          is expanded: {row.data.isExpanded ? "true" : "false"}
                        </div>
                        <div>entry count: {row.data.entryCount}</div>
                        <button
                          onClick={() => {
                            if (row.data.isExpanded) {
                              entryGroup.fold(row.data.index);
                            } else {
                              entryGroup.expand(row.data.index);
                            }
                          }}
                        >
                          Toggle
                        </button>
                      </>
                    )}
                    {row.type === "entry" && (
                      <>
                        <div>
                          Entry {virtualRow.index} ({row.data.time}s)
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
