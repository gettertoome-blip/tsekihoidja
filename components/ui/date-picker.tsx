"use client";
import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import { et } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { fromIso, isoToDisplay, toIso } from "@/lib/dates";

export function DatePicker({
  value,
  onChange,
  placeholder = "Vali kuupäev",
  ariaLabel,
  className,
  min,
}: {
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  /** earliest selectable date (yyyy-MM-dd) */
  min?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = value ? fromIso(value) : undefined;
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={ariaLabel}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 text-left text-base",
          !value && "text-muted",
          className,
        )}
      >
        {value ? isoToDisplay(value) : placeholder}
        <CalendarDays className="h-4 w-4 shrink-0 text-muted" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="z-[60] rounded-lg border border-border bg-card p-3 shadow-soft"
        >
          <DayPicker
            mode="single"
            locale={et}
            weekStartsOn={1}
            captionLayout="dropdown"
            startMonth={new Date(2000, 0)}
            endMonth={new Date(new Date().getFullYear() + 15, 11)}
            defaultMonth={selected}
            selected={selected}
            disabled={min ? { before: fromIso(min) } : undefined}
            onSelect={(d) => {
              if (d) {
                onChange(toIso(d));
                setOpen(false);
              }
            }}
            classNames={{
              root: "text-sm",
              months: "relative",
              month_caption: "flex h-9 items-center justify-center font-medium",
              dropdowns: "flex gap-1",
              dropdown: "rounded-md border border-border bg-card px-1 py-0.5",
              nav: "absolute inset-x-0 top-0 flex h-9 items-center justify-between",
              button_previous: "rounded-md p-2 hover:bg-primary-soft",
              button_next: "rounded-md p-2 hover:bg-primary-soft",
              month_grid: "mt-2 w-full border-collapse",
              weekday: "h-8 w-9 text-xs font-medium text-muted",
              day: "p-0 text-center",
              day_button: "h-9 w-9 rounded-md hover:bg-primary-soft",
              selected: "[&>button]:bg-primary [&>button]:text-white [&>button:hover]:bg-primary-dark",
              today: "font-bold text-primary",
              outside: "opacity-40",
              disabled: "opacity-30",
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
