import { requireUser } from "../auth";
import { DISCLAIMER } from "../config/disclaimers";
import { uid } from "../lib/crypto";
import { downloadText, openPrintable } from "../lib/download";
import { el } from "../lib/dom";
import { todayISO } from "../lib/dates";
import { CONTINUING_HABITS, PROGRAM_DAYS } from "./content";
import {
  getJournal,
  getProgram,
  latestPersonalRitual,
  mergeJournal,
  saveJournal,
  savePersonalRitual,
  saveProgram,
  type PersonalRitual
} from "../store/user-data";

function dayFromQuery(): number {
  const n = Number(new URLSearchParams(location.search).get("day") || "1");
  if (Number.isFinite(n) && n >= 1 && n <= 21) return n;
  return 1;
}

export async function mountProgram(root: HTMLElement): Promise<void> {
  const user = await requireUser();
  const state = await getProgram(user.id);
  const dayN = dayFromQuery();
  let notice = state.days[String(dayN)]?.notice ?? "";
  const chosen = new Set((await latestPersonalRitual(user.id))?.habitIds ?? []);
  let morning = (await latestPersonalRitual(user.id))?.morning ?? "";
  let evening = (await latestPersonalRitual(user.id))?.evening ?? "";
  let savedMsg = "";

  async function complete(): Promise<void> {
    state.days[String(dayN)] = { completedAt: new Date().toISOString(), notice };
    await saveProgram(state);
    savedMsg = "Day marked complete.";
    paint();
  }

  async function logPrivate(patch: Record<string, string | number>): Promise<void> {
    const date = todayISO();
    const current = await getJournal(user.id, date);
    await saveJournal(mergeJournal(current, { ...patch, source: `day-${dayN}` }));
    location.href = `private.html?date=${date}`;
  }

  async function saveFinal(): Promise<void> {
    const ritual: PersonalRitual = {
      id: uid("pr"),
      userId: user.id,
      createdAt: new Date().toISOString(),
      habitIds: [...chosen],
      morning: morning.trim(),
      evening: evening.trim(),
      notes: notice
    };
    await savePersonalRitual(ritual);
    state.days["21"] = { completedAt: new Date().toISOString(), notice };
    await saveProgram(state);
    savedMsg = "Ritual saved to your account.";
    paint();
  }

  function paint(): void {
    const spec = PROGRAM_DAYS[dayN - 1];
    root.replaceChildren();
    const wrap = el("div", { class: "app-shell" });
    wrap.append(
      el("p", { class: "eyebrow" }, ["21 Days of Tej Kaya"]),
      el("h1", {}, ["A self-paced house of days."])
    );
    const grid = el("div", { class: "day-grid", "aria-label": "Program days" });
    for (const d of PROGRAM_DAYS) {
      const done = Boolean(state.days[String(d.day)]);
      const a = el("a", {
        href: `21-days.html?day=${d.day}`,
        class: `${done ? "is-done" : ""} ${d.day === dayN ? "is-here" : ""}`.trim(),
        title: d.title
      }, [String(d.day).padStart(2, "0")]);
      grid.append(a);
    }
    wrap.append(grid);

    const panel = el("div", { class: "panel" });
    panel.append(
      el("p", { class: "eyebrow" }, [`Day ${String(spec.day).padStart(2, "0")}`]),
      el("h2", {}, [spec.title])
    );

    if (dayN === 21) {
      panel.append(el("h1", {}, ["Your ritual starts here"]));
      panel.append(el("p", {}, [spec.read]));
      panel.append(el("p", { class: "eyebrow" }, ["Keep"]));
      const list = el("div", { class: "check-list" });
      for (const h of CONTINUING_HABITS) {
        const lab = el("label");
        const cb = el("input", { type: "checkbox" }) as HTMLInputElement;
        cb.checked = chosen.has(h.id);
        cb.addEventListener("change", () => {
          if (cb.checked) chosen.add(h.id);
          else chosen.delete(h.id);
        });
        lab.append(cb, document.createTextNode(h.label));
        list.append(lab);
      }
      panel.append(list);
      const mg = el("div", { class: "field-grid" });
      const mf = el("div", { class: "field field-wide" });
      mf.append(el("label", { class: "lbl", for: "morning" }, ["Morning"]));
      const mt = el("textarea", { id: "morning" }) as HTMLTextAreaElement;
      mt.value = morning;
      mt.addEventListener("input", () => (morning = mt.value));
      mf.append(mt);
      const ef = el("div", { class: "field field-wide" });
      ef.append(el("label", { class: "lbl", for: "evening" }, ["Evening"]));
      const et = el("textarea", { id: "evening" }) as HTMLTextAreaElement;
      et.value = evening;
      et.addEventListener("input", () => (evening = et.value));
      ef.append(et);
      mg.append(mf, ef);
      panel.append(mg);
      const actions = el("div", { class: "app-actions" });
      const save = el("button", { class: "btn btn-gold", type: "button" }, ["Save ritual"]);
      save.addEventListener("click", () => void saveFinal());
      const dl = el("button", { class: "btn btn-ghost", type: "button" }, ["Download"]);
      dl.addEventListener("click", () => {
        const names = CONTINUING_HABITS.filter((h) => chosen.has(h.id)).map((h) => h.label);
        const body = `<h1>Your ritual starts here</h1>
          <p>${user.firstName}</p>
          <h2>Keep</h2><ul>${names.map((n) => `<li>${n}</li>`).join("")}</ul>
          <h2>Morning</h2><p>${morning || "—"}</p>
          <h2>Evening</h2><p>${evening || "—"}</p>
          <p class="muted">${DISCLAIMER}</p>`;
        downloadText("tej-kaya-personal-ritual.html", `<!DOCTYPE html><html><body>${body}</body></html>`, "text/html");
        openPrintable("Your Tej Kaya Ritual", body);
      });
      actions.append(save, dl);
      panel.append(actions);
    } else {
      panel.append(el("p", { class: "eyebrow" }, ["Read"]), el("p", {}, [spec.read]));
      panel.append(el("p", { class: "eyebrow" }, ["Do"]), el("p", {}, [spec.do]));
      panel.append(el("p", { class: "eyebrow" }, ["Notice"]));
      const ta = el("textarea", { id: "notice" }) as HTMLTextAreaElement;
      ta.value = notice;
      ta.addEventListener("input", () => (notice = ta.value));
      panel.append(ta);
      const actions = el("div", { class: "app-actions" });
      const done = el("button", { class: "btn btn-gold", type: "button" }, ["Complete day"]);
      done.addEventListener("click", () => void complete());
      actions.append(done);
      if (spec.journalHint) {
        const log = el("button", { class: "btn btn-ghost", type: "button" }, [spec.journalHint.label]);
        log.addEventListener("click", () => void logPrivate(spec.journalHint!.patch));
        actions.append(log);
      }
      const prev = el("a", { class: "btn btn-ghost", href: `21-days.html?day=${Math.max(1, dayN - 1)}` }, ["Previous"]);
      const next = el("a", { class: "btn btn-ghost", href: `21-days.html?day=${Math.min(21, dayN + 1)}` }, ["Next day"]);
      actions.append(prev, next);
      panel.append(actions);
    }
    if (savedMsg) panel.append(el("p", { class: "ok" }, [savedMsg]));
    panel.append(
      el("p", {}, [
        el("a", { class: "text-link", href: "consult.html" }, ["Speak with our physician"])
      ])
    );
    panel.append(el("p", { class: "disclaimer" }, [DISCLAIMER]));
    wrap.append(panel);
    root.append(wrap);
  }

  paint();
}
