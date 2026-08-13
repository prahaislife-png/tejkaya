import { requireUser, type PublicUser } from "../auth";
import { DISCLAIMER } from "../config/disclaimers";
import { formatDay, rangeDays, todayISO } from "../lib/dates";
import { downloadText, openPrintable } from "../lib/download";
import { el } from "../lib/dom";
import { emptyEntry, JOURNAL_FIELDS, type JournalEntry } from "./fields";
import { summarise } from "./stats";
import { allJournal, getJournal, saveJournal } from "../store/user-data";

type View = "today" | "7" | "30" | "history" | "summary";

function fieldValue(entry: JournalEntry, id: string): string {
  const v = entry[id as keyof JournalEntry];
  if (v == null) return "";
  return String(v);
}

function applyField(entry: JournalEntry, id: string, raw: string): void {
  if (id === "hydration" || id === "movement" || id === "stoolComfort" || id === "discomfort") {
    entry[id] = raw === "" ? null : Number(raw);
    return;
  }
  (entry as unknown as Record<string, string>)[id] = raw;
}

function renderFields(entry: JournalEntry, onChange: () => void): HTMLElement {
  const grid = el("div", { class: "field-grid" });
  for (const field of JOURNAL_FIELDS) {
    const wrap = el("div", { class: field.id === "notes" ? "field field-wide" : "field" });
    wrap.append(el("label", { for: field.id, class: "lbl" }, [field.label]));
    if (field.kind === "select") {
      const sel = el("select", { id: field.id }) as HTMLSelectElement;
      for (const opt of field.options) {
        const o = el("option", { value: opt.value }, [opt.label]);
        sel.append(o);
      }
      sel.value = fieldValue(entry, field.id);
      sel.addEventListener("change", () => {
        applyField(entry, field.id, sel.value);
        onChange();
      });
      wrap.append(sel);
    } else if (field.kind === "text") {
      const ta = el("textarea", { id: field.id }) as HTMLTextAreaElement;
      ta.value = fieldValue(entry, field.id);
      ta.addEventListener("input", () => {
        applyField(entry, field.id, ta.value);
        onChange();
      });
      wrap.append(ta);
    } else {
      const input = el("input", {
        id: field.id,
        type: "number",
        min: String(field.min),
        max: String(field.max)
      }) as HTMLInputElement;
      const current = fieldValue(entry, field.id);
      input.value = current;
      input.addEventListener("input", () => {
        applyField(entry, field.id, input.value);
        onChange();
      });
      wrap.append(input);
    }
    if ("help" in field && field.help) wrap.append(el("p", { class: "micro" }, [field.help]));
    if ("unit" in field && field.unit) wrap.append(el("p", { class: "micro" }, [field.unit]));
    grid.append(wrap);
  }
  return grid;
}

function thirtyHtml(user: PublicUser, entries: JournalEntry[], end: string): string {
  const days = rangeDays(end, 30);
  const byDate = new Map(entries.map((e) => [e.date, e]));
  const trends = summarise(entries, 30, end);
  const rows = days
    .map((d) => {
      const e = byDate.get(d);
      if (!e) return `<tr><td>${d}</td><td colspan="6">No entry</td></tr>`;
      return `<tr><td>${d}</td><td>${e.hydration ?? "—"}</td><td>${e.fibre || "—"}</td>
        <td>${e.bowel || "—"}</td><td>${e.movement ?? "—"}</td>
        <td>${e.discomfort ?? "—"}</td><td>${(e.notes || "").replace(/</g, "")}</td></tr>`;
    })
    .join("");
  const trendHtml = trends.map((t) => `<p><strong>${t.label}:</strong> ${t.value} — ${t.detail}</p>`).join("");
  return `<h1>30-day Private summary</h1>
    <p>${user.firstName} · ${user.email}</p>
    <p class="muted">Prepared ${new Date().toISOString()} for personal records or a conversation with a clinician you choose. Tej Kaya does not diagnose.</p>
    ${trendHtml}
    <h2>Entries</h2>
    <table><thead><tr><th>Date</th><th>Water</th><th>Fibre</th><th>Bowel</th><th>Move</th><th>Discomfort</th><th>Notes</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <p class="muted">${DISCLAIMER}</p>`;
}

function exportThirty(user: PublicUser, entries: JournalEntry[], end: string): void {
  const inner = thirtyHtml(user, entries, end);
  downloadText(
    "tej-kaya-private-30-day.html",
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>30-day summary</title></head><body>${inner}</body></html>`,
    "text/html"
  );
}

export async function mountPrivate(root: HTMLElement): Promise<void> {
  const user = await requireUser();
  let view: View = "today";
  let date = todayISO();
  let entry = await getJournal(user.id, date);
  let all = await allJournal(user.id);
  let status = "";

  async function persist(): Promise<void> {
    entry = await saveJournal(entry);
    all = await allJournal(user.id);
    status = "Saved.";
    paint();
  }

  function paint(): void {
    root.replaceChildren();
    const wrap = el("div", { class: "app-shell" });
    wrap.append(
      el("p", { class: "eyebrow" }, ["Tej Kaya Private"]),
      el("h1", {}, ["A journal only you hold."]),
      el("p", { class: "lede app-kicker" }, [
        "Record what you notice. Trends are counts and averages of your notes — never a diagnosis."
      ])
    );
    const tabs = el("div", { class: "tabs", role: "tablist" });
    const tabDefs: Array<[View, string]> = [
      ["today", "Today"],
      ["7", "7 Days"],
      ["30", "30 Days"],
      ["history", "Journal history"],
      ["summary", "Summary"]
    ];
    for (const [id, label] of tabDefs) {
      const b = el("button", { type: "button", class: view === id ? "is-on" : "" }, [label]);
      b.addEventListener("click", () => {
        view = id;
        paint();
      });
      tabs.append(b);
    }
    wrap.append(tabs);

    if (view === "today") {
      const dateField = el("div", { class: "field" });
      dateField.append(el("label", { for: "jdate", class: "lbl" }, ["Date"]));
      const di = el("input", { id: "jdate", type: "date", value: date }) as HTMLInputElement;
      di.addEventListener("change", async () => {
        date = di.value || todayISO();
        entry = await getJournal(user.id, date);
        paint();
      });
      dateField.append(di);
      wrap.append(dateField, renderFields(entry, () => (status = "")));
      const save = el("button", { class: "btn btn-gold", type: "button" }, ["Save today"]);
      save.addEventListener("click", () => void persist());
      wrap.append(el("div", { class: "app-actions" }, [save]));
      if (status) wrap.append(el("p", { class: "ok" }, [status]));
    } else if (view === "history") {
      const table = el("table", { class: "history-table" });
      table.innerHTML = `<thead><tr><th>Date</th><th>Water</th><th>Fibre</th><th>Movement</th><th>Notes</th></tr></thead>`;
      const tb = el("tbody");
      for (const row of all) {
        const tr = el("tr");
        const link = el("a", { href: "#" }, [formatDay(row.date)]);
        link.addEventListener("click", async (ev) => {
          ev.preventDefault();
          date = row.date;
          view = "today";
          entry = await getJournal(user.id, date);
          paint();
        });
        const c1 = el("td");
        c1.append(link);
        tr.append(
          c1,
          el("td", {}, [String(row.hydration ?? "—")]),
          el("td", {}, [row.fibre || "—"]),
          el("td", {}, [String(row.movement ?? "—")]),
          el("td", {}, [row.notes.slice(0, 80) || "—"])
        );
        tb.append(tr);
      }
      if (!all.length) tb.append(el("tr", {}, [el("td", { colspan: "5" }, ["No entries yet."])]));
      table.append(tb);
      wrap.append(table);
    } else {
      const days = view === "7" ? 7 : 30;
      const trends = summarise(all, view === "summary" ? 30 : days, todayISO());
      const grid = el("div", { class: "score-grid" });
      grid.style.gridTemplateColumns = "repeat(3, 1fr)";
      for (const t of trends) {
        const cell = el("div", { class: "score-cell" });
        cell.append(el("span", { class: "eyebrow" }, [t.label]), el("strong", {}, [t.value]), el("p", { class: "micro" }, [t.detail]));
        grid.append(cell);
      }
      wrap.append(grid);
      if (view === "7" || view === "30") {
        const list = el("ul", { class: "coming-list" });
        for (const d of rangeDays(todayISO(), days)) {
          const found = all.find((e) => e.date === d);
          list.append(
            el("li", {}, [
              `${formatDay(d)}`,
              found ? "Logged" : "—"
            ])
          );
        }
        wrap.append(list);
      }
      const exp = el("button", { class: "btn btn-solid", type: "button" }, ["Export 30-day summary"]);
      exp.addEventListener("click", () => exportThirty(user, all, todayISO()));
      const printBtn = el("button", { class: "btn btn-ghost", type: "button" }, ["Print"]);
      printBtn.addEventListener("click", () =>
        openPrintable("Tej Kaya Private — 30 days", thirtyHtml(user, all, todayISO()))
      );
      wrap.append(el("div", { class: "app-actions" }, [exp, printBtn]));
    }
    wrap.append(el("p", { class: "disclaimer" }, [DISCLAIMER]));
    root.append(wrap);
  }

  const params = new URLSearchParams(location.search);
  const pre = params.get("date");
  if (pre) {
    date = pre;
    entry = await getJournal(user.id, date);
  }
  const patchRaw = params.get("patch");
  if (patchRaw) {
    try {
      const patch = JSON.parse(patchRaw) as Partial<JournalEntry>;
      entry = { ...emptyEntry(user.id, date), ...entry, ...patch, source: "21-days" };
      view = "today";
    } catch {
      /* ignore */
    }
  }
  paint();
}
