import { el } from "../lib/dom";
import { openPrintable } from "../lib/download";
import { CLINIC, formatInr, skuById } from "./config";
import { letterheadHtml, letterheadStyles } from "./letterhead";
import {
  allBookings,
  getPrescription,
  saveBooking,
  savePrescription,
  type PayStatus,
  type Prescription
} from "../store/clinic";

const DESK_KEY = "tejKaya.clinicDesk";

export async function mountClinicDesk(root: HTMLElement): Promise<void> {
  if (sessionStorage.getItem(DESK_KEY) !== "ok") {
    paintPin(root);
    return;
  }
  await paintDesk(root);
}

function paintPin(root: HTMLElement): void {
  root.replaceChildren();
  const wrap = el("div", { class: "app-shell" });
  wrap.append(
    el("p", { class: "eyebrow" }, [CLINIC.name]),
    el("h1", {}, ["Clinic desk."]),
    el("p", { class: "lede" }, ["For Dr Rajeshree and staff. Change the PIN in src/clinic/config.ts before going live."])
  );
  const form = el("form", { class: "panel field-grid" });
  form.innerHTML = `<div class="field field-wide"><label for="pin">Staff PIN</label><input id="pin" type="password" required /></div>`;
  const err = el("p", { class: "err field-wide" });
  const go = el("button", { class: "btn btn-gold field-wide", type: "submit" }, ["Enter"]);
  form.append(err, go);
  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const pin = (form.querySelector("#pin") as HTMLInputElement).value;
    if (pin !== CLINIC.deskPin) {
      err.textContent = "That PIN does not match.";
      return;
    }
    sessionStorage.setItem(DESK_KEY, "ok");
    void paintDesk(root);
  });
  wrap.append(form);
  root.append(wrap);
}

async function paintDesk(root: HTMLElement): Promise<void> {
  const bookings = (await allBookings()).reverse();
  let selected = bookings[0] ?? null;
  let rx: Prescription = selected
    ? (await getPrescription(selected.id)) ?? emptyRx(selected.id)
    : emptyRx("");

  async function draw(): Promise<void> {
    root.replaceChildren();
    const wrap = el("div", { class: "app-shell" });
    wrap.append(
      el("p", { class: "eyebrow" }, ["Shree Urocare desk"]),
      el("h1", {}, ["Today’s book."]),
      el("p", { class: "lede app-kicker" }, [
        "Confirm WhatsApp bookings, mark payment, write the plan on clinic letterhead after the visit."
      ])
    );

    const table = el("table", { class: "history-table" });
    table.innerHTML = `<thead><tr><th>When</th><th>Patient</th><th>Visit</th><th>Pay</th><th></th></tr></thead>`;
    const tb = el("tbody");
    for (const b of bookings) {
      const tr = el("tr");
      const open = el("button", { class: "btn btn-ghost", type: "button" }, ["Open"]);
      open.addEventListener("click", async () => {
        selected = b;
        rx = (await getPrescription(b.id)) ?? emptyRx(b.id);
        await draw();
      });
      tr.append(
        el("td", {}, [`${b.dateIso} ${b.time}`]),
        el("td", {}, [`${b.firstName} · ${b.phone}`]),
        el("td", {}, [`${b.mode} · ${skuById(b.skuId)?.title ?? b.skuId}`]),
        el("td", {}, [b.payStatus]),
        el("td")
      );
      (tr.lastChild as HTMLElement).append(open);
      tb.append(tr);
    }
    if (!bookings.length) tb.append(el("tr", {}, [el("td", { colspan: "5" }, ["No bookings on this device yet."])]));
    table.append(tb);
    wrap.append(table);

    if (selected) {
      const panel = el("div", { class: "panel", style: "margin-top:1.6rem" });
      panel.append(el("p", { class: "eyebrow" }, ["Visit"]));
      panel.append(
        el("h2", {}, [selected.firstName]),
        el("p", {}, [
          `${selected.email} · ${selected.phone} · ${formatInr(selected.priceInr)} · ${selected.status}`
        ]),
        el("p", {}, [`Reason: ${selected.reason}`]),
        el("p", {}, [selected.notes || "No notes."])
      );
      const pay = el("div", { class: "app-actions" });
      for (const [label, status] of [
        ["Mark UPI received", "paid"],
        ["Paid at clinic", "paid-at-clinic"],
        ["Confirm slot", "confirmed"]
      ] as const) {
        const btn = el("button", { class: "btn btn-ghost", type: "button" }, [label]);
        btn.addEventListener("click", async () => {
          if (!selected) return;
          if (status === "confirmed") selected.status = "confirmed";
          else selected.payStatus = status as PayStatus;
          await saveBooking(selected);
          await draw();
        });
        pay.append(btn);
      }
      const done = el("button", { class: "btn btn-solid", type: "button" }, ["Mark completed"]);
      done.addEventListener("click", async () => {
        if (!selected) return;
        selected.status = "completed";
        await saveBooking(selected);
        await draw();
      });
      pay.append(done);
      panel.append(pay);

      panel.append(el("h2", {}, ["Plan / prescription"]));
      panel.append(el("p", { class: "micro" }, ["In the doctor's name, on Shree Urocare letterhead. Print after the visit."]));
      const grid = el("div", { class: "field-grid" });
      const fields: Array<[keyof Prescription, string]> = [
        ["findings", "Findings"],
        ["plan", "Plan"],
        ["medicines", "Medicines / procedures"],
        ["followUp", "Follow-up"]
      ];
      for (const [key, label] of fields) {
        const box = el("div", { class: "field field-wide" });
        box.append(el("label", { class: "lbl" }, [label]));
        const ta = el("textarea") as HTMLTextAreaElement;
        ta.value = String(rx[key] || "");
        ta.addEventListener("input", () => {
          (rx as unknown as Record<string, string>)[key] = ta.value;
        });
        box.append(ta);
        grid.append(box);
      }
      panel.append(grid);
      const save = el("button", { class: "btn btn-gold", type: "button" }, ["Save letterhead"]);
      save.addEventListener("click", async () => {
        if (!selected) return;
        rx.bookingId = selected.id;
        rx.updatedAt = new Date().toISOString();
        await savePrescription(rx);
      });
      const printBtn = el("button", { class: "btn btn-solid", type: "button" }, ["Print letterhead"]);
      printBtn.addEventListener("click", async () => {
        if (!selected) return;
        rx.bookingId = selected.id;
        rx.updatedAt = new Date().toISOString();
        await savePrescription(rx);
        openPrintable(
          `Shree Urocare — ${selected.firstName}`,
          `<style>${letterheadStyles()}</style>${letterheadHtml(selected, rx)}`
        );
      });
      panel.append(el("div", { class: "app-actions" }, [save, printBtn]));
      wrap.append(panel);
    }
    wrap.append(
      el("p", { class: "disclaimer" }, [
        "Bookings on this desk live in this browser. Export or move to a clinic server before scaling. Tej Kaya still does not prescribe."
      ])
    );
    root.append(wrap);
  }

  await draw();
}

function emptyRx(bookingId: string): Prescription {
  return {
    bookingId,
    updatedAt: new Date().toISOString(),
    findings: "",
    plan: "",
    medicines: "",
    followUp: ""
  };
}
