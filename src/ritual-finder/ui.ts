import { currentUser, register } from "../auth";
import { DISCLAIMER, SHORT_DISCLAIMER } from "../config/disclaimers";
import { downloadText, openPrintable } from "../lib/download";
import { el } from "../lib/dom";
import { QUESTIONS } from "./questions";
import { buildResult, type Answers, type RitualResult } from "./scoring";
import { saveRitual } from "../store/user-data";

const DRAFT_KEY = "tejKaya.finderDraft";

interface Draft {
  step: number;
  answers: Answers;
}

function loadDraft(): Draft {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (raw) return JSON.parse(raw) as Draft;
  } catch {
    /* ignore */
  }
  return { step: 0, answers: {} };
}

function saveDraft(d: Draft): void {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d));
}

function resultHtml(result: RitualResult): string {
  const scores = result.scores
    .map(
      (s) =>
        `<div class="score-cell"><span class="eyebrow">${s.label}</span><strong>${s.percent}</strong><p class="micro">of your answers in this area</p></div>`
    )
    .join("");
  const habits = result.habits
    .map(
      (h) =>
        `<article><p class="eyebrow">${h.category}</p><h3>${h.title}</h3><p>${h.body}</p></article>`
    )
    .join("");
  return `<p class="eyebrow">Your Tej Kaya Ritual</p>
    <h1>${result.firstName}, a composed next step.</h1>
    <p class="lede">Five areas, scored only from what you answered. Percentages are a map of emphasis — not a health grade.</p>
    <div class="score-grid">${scores}</div>
    <h2>Habits to try</h2>
    <div class="habit-list">${habits}</div>
    <p class="disclaimer">${DISCLAIMER}</p>`;
}

export function mountFinder(root: HTMLElement): void {
  const draft = loadDraft();
  let step = draft.step;
  const answers: Answers = { ...draft.answers };
  let result: RitualResult | null = null;
  const gate = { firstName: "", email: "", password: "" };
  let error = "";
  let saving = false;

  const total = QUESTIONS.length;

  async function finishGate(ev: Event): Promise<void> {
    ev.preventDefault();
    error = "";
    if (!gate.firstName.trim() || !gate.email.includes("@")) {
      error = "Please leave your first name and email before we reveal the ritual.";
      paint();
      return;
    }
    result = buildResult({ firstName: gate.firstName, email: gate.email, answers });
    const user = await currentUser();
    if (user) {
      await saveRitual(user.id, result);
    } else if (gate.password.length >= 8) {
      try {
        saving = true;
        paint();
        const created = await register({
          firstName: gate.firstName,
          email: gate.email,
          password: gate.password
        });
        await saveRitual(created.id, result);
      } catch (e) {
        error = e instanceof Error ? e.message : "Could not create the account.";
        result = null;
      } finally {
        saving = false;
      }
    }
    sessionStorage.removeItem(DRAFT_KEY);
    paint();
  }

  function paint(): void {
    root.replaceChildren();
    const wrap = el("div", { class: "app-shell" });

    if (result) {
      wrap.innerHTML = resultHtml(result);
      const actions = el("div", { class: "app-actions" });
      const printBtn = el("button", { class: "btn btn-solid", type: "button" }, ["Print / save as PDF"]);
      printBtn.addEventListener("click", () =>
        openPrintable("Your Tej Kaya Ritual", resultHtml(result!))
      );
      const dl = el("button", { class: "btn btn-ghost", type: "button" }, ["Download"]);
      dl.addEventListener("click", () => {
        const text = [
          `Your Tej Kaya Ritual — ${result!.firstName}`,
          result!.createdAt,
          "",
          ...result!.scores.map((s) => `${s.label}: ${s.percent}`),
          "",
          ...result!.habits.map((h) => `• ${h.title} — ${h.body}`),
          "",
          DISCLAIMER
        ].join("\n");
        downloadText("tej-kaya-ritual.txt", text);
      });
      const account = el("a", { class: "btn btn-gold", href: "account.html" }, ["Open Your Atelier"]);
      const doctor = el("a", { class: "btn btn-ghost", href: "consult.html" }, ["Speak with our physician"]);
      actions.append(printBtn, dl, account, doctor);
      wrap.append(actions);
      root.append(wrap);
      return;
    }

    if (step >= total) {
      wrap.innerHTML = `<p class="eyebrow">Almost</p><h1>Your name, then the ritual.</h1>
        <p class="lede">We show the complete result after a name and email — so it can be saved to your Tej Kaya account.</p>`;
      const form = el("form", { class: "panel field-grid" });
      form.innerHTML = `
        <div class="field"><label for="fn">First name</label><input id="fn" name="firstName" required autocomplete="given-name" /></div>
        <div class="field"><label for="em">Email</label><input id="em" name="email" type="email" required autocomplete="email" /></div>
        <div class="field field-wide"><label for="pw">Password (optional — creates your account and saves this ritual)</label>
        <input id="pw" name="password" type="password" minlength="8" autocomplete="new-password" placeholder="At least 8 characters" /></div>
        <p class="micro field-wide">${SHORT_DISCLAIMER}</p>`;
      const fn = form.querySelector("#fn") as HTMLInputElement;
      const em = form.querySelector("#em") as HTMLInputElement;
      const pw = form.querySelector("#pw") as HTMLInputElement;
      fn.value = gate.firstName;
      em.value = gate.email;
      pw.value = gate.password;
      fn.addEventListener("input", () => (gate.firstName = fn.value));
      em.addEventListener("input", () => (gate.email = em.value));
      pw.addEventListener("input", () => (gate.password = pw.value));
      if (error) form.append(el("p", { class: "err field-wide" }, [error]));
      const row = el("div", { class: "app-nav-row field-wide" });
      const back = el("button", { class: "btn btn-ghost", type: "button" }, ["Back"]);
      back.addEventListener("click", () => {
        step = total - 1;
        paint();
      });
      const go = el("button", { class: "btn btn-gold", type: "submit" }, [
        saving ? "Saving…" : "Reveal my ritual"
      ]);
      row.append(back, go);
      form.append(row);
      form.addEventListener("submit", finishGate);
      wrap.append(form);
      root.append(wrap);
      return;
    }

    const q = QUESTIONS[step];
    const pct = Math.round((step / total) * 100);
    wrap.append(
      el("p", { class: "eyebrow" }, [`Tej Kaya Ritual Finder  ·  ${q.area}`]),
      el("h1", {}, ["A few quiet questions."])
    );
    const track = el("div", { class: "progress-track", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pct) });
    track.append(el("span", { style: `width:${pct}%` }));
    wrap.append(track, el("p", { class: "micro" }, [`Question ${step + 1} of ${total}`]));

    const card = el("div", { class: "q-card" });
    card.append(el("h2", {}, [q.prompt]));
    if (q.help) card.append(el("p", { class: "subtle" }, [q.help]));
    const list = el("div", { class: "choice-list", role: "radiogroup", "aria-label": q.prompt });
    for (const c of q.choices) {
      const id = `${q.id}-${c.value}`;
      const lab = el("label", { class: answers[q.id] === c.value ? "is-on" : "", for: id });
      const input = el("input", {
        type: "radio",
        name: q.id,
        id,
        value: c.value
      }) as HTMLInputElement;
      if (answers[q.id] === c.value) input.checked = true;
      input.addEventListener("change", () => {
        answers[q.id] = c.value;
        saveDraft({ step, answers });
        paint();
      });
      lab.append(input, document.createTextNode(c.label));
      list.append(lab);
    }
    card.append(list);
    const nav = el("div", { class: "app-nav-row" });
    const back = el("button", { class: "btn btn-ghost", type: "button" }, ["Back"]);
    back.disabled = step === 0;
    back.addEventListener("click", () => {
      if (step === 0) return;
      step -= 1;
      saveDraft({ step, answers });
      paint();
    });
    const next = el("button", { class: "btn btn-solid", type: "button" }, [
      step === total - 1 ? "Continue" : "Next"
    ]);
    next.disabled = !answers[q.id];
    next.addEventListener("click", () => {
      if (!answers[q.id]) return;
      step += 1;
      saveDraft({ step, answers });
      paint();
    });
    nav.append(back, next);
    card.append(nav, el("p", { class: "disclaimer" }, [SHORT_DISCLAIMER]));
    wrap.append(card);
    root.append(wrap);
  }

  paint();
  void currentUser()
    .then((user) => {
      if (user) {
        gate.firstName = user.firstName;
        gate.email = user.email;
        paint();
      }
    })
    .catch(() => undefined);
}
