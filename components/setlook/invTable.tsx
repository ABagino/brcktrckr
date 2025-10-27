"use client"

import Image from "next/image"
import { InventoryRecord, SortableKey } from "./helper"

interface Props {
  title: string
  records: InventoryRecord[]
  activeHeaders: { key: SortableKey; label: string }[]
  excludeColour?: boolean
  sortConfig: { key: SortableKey | null; direction: "asc" | "desc" }
  setSortConfig: React.Dispatch<
    React.SetStateAction<{ key: SortableKey | null; direction: "asc" | "desc" }>
  >
  imagePath: (item: InventoryRecord) => string
}

export default function InventoryTable({
  title,
  records,
  activeHeaders,
  excludeColour,
  sortConfig,
  setSortConfig,
  imagePath,
}: Props) {
  if (!records.length) return null
  const headers = excludeColour
    ? activeHeaders.filter(({ key }) => key !== "ColourName")
    : activeHeaders

  return (
    <>
      <h2
        className={`inline-block text-2xl px-3 py-1 ${
          title.includes("Mini")
            ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300"
            : "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300"
        } rounded-md font-semibold mb-4`}
      >
        {title}
      </h2>

      <div className="w-full overflow-x-auto mb-6">
        <table className="w-full table-auto border-collapse bg-white dark:bg-gray-800 shadow">
          <thead>
            <tr>
              {headers.map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() =>
                    setSortConfig((p) => ({
                      key,
                      direction:
                        p.key === key && p.direction === "asc" ? "desc" : "asc",
                    }))
                  }
                  className="sticky top-0 bg-gray-800 dark:bg-gray-700 text-white p-3 text-left cursor-pointer"
                >
                  {label}
                  {sortConfig.key === key
                    ? sortConfig.direction === "asc"
                      ? " ↑"
                      : " ↓"
                    : ""}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {records.map((item, i) => (
              <tr
                key={`${title}-${item.ItemNumber}-${item.ColourID}`}
                className={i % 2 === 0 ? "bg-gray-50 dark:bg-gray-900/40" : ""}
              >
                {headers.map(({ key }) => (
                  <td
                    key={key}
                    className="p-3 border-b border-gray-200 dark:border-gray-700"
                  >
                    {key === "ItemNumber" ? (
                      <div className="flex items-center justify-between w-full gap-2">
                        <div className="flex items-center justify-center max-h-[50px] max-w-[70px]">
                          <Image
                            src={imagePath(item)}
                            alt={item.ItemNumber}
                            height={50}
                            width={0}
                            className="h-[50px] w-auto object-contain"
                            unoptimized
                            onError={(e) =>
                              ((e.target as HTMLImageElement).style.display =
                                "none")
                            }
                          />
                        </div>
                        <span className="ml-auto text-right">
                          {item.ItemNumber}
                        </span>
                      </div>
                    ) : (
                      item[key] ?? ""
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
