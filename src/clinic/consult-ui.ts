import { currentUser } from "../auth";
import { el } from "../lib/dom";
import { uid } from "../lib/crypto";
import { downloadText } from "../lib/download";
import {
  CLINIC,
  CLINIC_MEDICAL_NOTE,
  CONSULT_SKUS,
  VISIT_REASONS,
  formatInr,
  skuById,
  type ConsultSku
} from "./config";
import {
  googleCalendarUrl,
  icsEvent,
  slotsForDay,
  upcomingDays,
  upiHref,
  whatsappHref,
  type Slot
} from "./calendar";
import {
  allBookings,
  createPackFromSku,
  saveBooking,
  savePack,
  takenKeys,
  type Booking
} from "../store/clinic";

function eventCopy(booking: Booking, sku: ConsultSku): { title: string; details: string; location: string } {
  const title = `${sku.mode === "clinic" ? "Clinic" : "Video"} consult — ${CLINIC.doctor}`;
  const location = sku.mode === "clinic" ? CLINIC.address : "Video consult — link on WhatsApp";
  const details = [
    CLINIC.name,
    `${booking.firstName} · ${booking.phone}`,
    sku.title,
    `Reason: ${booking.reason}`,
    CLINIC.phoneDisplay,
    CLINIC_MEDICAL_NOTE
  ].join("\n");
  return { title, details, location };
}

export async function mountConsult(root: HTMLElement): Promise<void> {
  const user = await currentUser().catch(() => null);
  const params = new URLSearchParams(location.search);
  let skuId = params.get("sku") || "video-1";
  if (!skuById(skuId)) skuId = "video-1";
  let day = upcomingDays(1)[0] ?? new Date();
  let slot: Slot | null = null;
  let firstName = user?.firstName ?? "";
  let email = user?.email ?? "";
  let phone = "";
  let reason = params.get("reason") || "general";
  let notes = "";
  let error = "";
  let done: Booking | null = null;
  let doneSku: ConsultSku | null = null;

  async function paint(): Promise<void> {
    const sku = skuById(skuId) ?? CONSULT_SKUS[1];
    const bookings = await allBookings();
    const taken = takenKeys(bookings);
    const days = upcomingDays(12);
    const slots = slotsForDay(day, sku.mode).filter(
      (s) => !taken.has(`${s.dateIso}|${s.time}|${sku.mode}`)
    );
    if (slot && !slots.some((s) => s.time === slot?.time && s.dateIso === slot.dateIso)) slot = null;

    root.replaceChildren();
    const wrap = el("div", { class: "app-shell" });

    if (done && doneSku) {
      const copy = eventCopy(done, doneSku);
      const start = new Date(done.startIso);
      const end = new Date(done.endIso);
      const cal = googleCalendarUrl({ ...copy, start, end });
      const wa = whatsappHref(
        `Namaste, I booked ${doneSku.title} with ${CLINIC.doctor} on ${done.dateIso} at ${done.time}. Name: ${done.firstName}. Phone: ${done.phone}. Reason: ${done.reason}. Fee ${formatInr(done.priceInr)}. I will confirm payment on WhatsApp / UPI.`
      );
      wrap.innerHTML = `<p class="eyebrow">${CLINIC.name}</p>
        <h1>Request received.</h1>
        <p class="lede">WhatsApp the clinic to confirm. Add it to Google Calendar. ${CLINIC.doctor} writes any plan or prescription in her name after the visit.</p>
        <div class="panel">
          <p><strong>${doneSku.title}</strong> · ${formatInr(done.priceInr)}</p>
          <p>${done.dateIso} · ${done.time} · ${done.mode === "clinic" ? "Chinchwad clinic" : "Video"}</p>
          <p class="micro">Payment: unpaid until you send UPI on WhatsApp or pay at the clinic. We do not fake a successful Razorpay charge.</p>
        </div>`;
      const actions = el("div", { class: "app-actions" });
      actions.append(el("a", { class: "btn btn-gold", href: wa, target: "_blank", rel: "noopener" }, ["WhatsApp confirm"]));
      actions.append(el("a", { class: "btn btn-solid", href: cal, target: "_blank", rel: "noopener" }, ["Google Calendar"]));
      const icsBtn = el("button", { class: "btn btn-ghost", type: "button" }, ["Download .ics"]);
      icsBtn.addEventListener("click", () => {
        downloadText("shree-urocare-consult.ics", icsEvent({ ...copy, start, end }), "text/calendar");
      });
      actions.append(icsBtn);
      if (doneSku.mode === "video") {
        actions.append(
          el("a", { class: "btn btn-ghost", href: upiHref(done.priceInr, doneSku.id), rel: "noopener" }, [
            `UPI ${formatInr(done.priceInr)}`
          ])
        );
      }
      wrap.append(actions);
      wrap.append(
        el("p", { class: "micro" }, [
          `UPI ID (replace in config if needed): ${CLINIC.upiId}. Send the screenshot on WhatsApp.`
        ])
      );
      wrap.append(el("p", { class: "disclaimer" }, [CLINIC_MEDICAL_NOTE]));
      root.append(wrap);
      return;
    }

    wrap.append(
      el("p", { class: "eyebrow" }, ["Physician · Shree Urocare"]),
      el("h1", {}, ["Consult with Dr Rajeshree."]),
      el("p", { class: "lede app-kicker" }, [
        `${CLINIC.credentials}. ${CLINIC.role}, ${CLINIC.city}. In-clinic for Pune. Video consult India-wide.`
      ]),
      el("p", { class: "subtle" }, [CLINIC.hindi])
    );

    const meta = el("div", { class: "score-grid" });
    meta.style.gridTemplateColumns = "repeat(3, 1fr)";
    for (const [k, v] of [
      ["Clinic", CLINIC.hours],
      ["Phone", CLINIC.phoneDisplay],
      ["Address", CLINIC.address]
    ] as const) {
      const cell = el("div", { class: "score-cell" });
      cell.append(el("span", { class: "eyebrow" }, [k]), el("p", {}, [v]));
      meta.append(cell);
    }
    wrap.append(meta);

    wrap.append(el("h2", {}, ["Choose a visit"]));
    const packs = el("div", { class: "studio-grid" });
    for (const s of CONSULT_SKUS) {
      const card = el("button", {
        class: `studio-card sku-card ${s.id === sku.id ? "is-on" : ""}`,
        type: "button"
      });
      card.append(el("p", { class: "eyebrow" }, [s.mode === "clinic" ? "Pune clinic" : "India-wide video"]));
      card.append(el("h3", {}, [s.title]));
      card.append(el("p", { class: "price-lg" }, [formatInr(s.priceInr)]));
      card.append(el("p", {}, [s.blurb]));
      if (s.visits > 1) card.append(el("p", { class: "micro" }, [`${s.visits} visits · ${formatInr(Math.round(s.priceInr / s.visits))} each`]));
      card.addEventListener("click", () => {
        skuId = s.id;
        slot = null;
        void paint();
      });
      packs.append(card);
    }
    wrap.append(packs);

    const form = el("form", { class: "panel field-grid", style: "margin-top:1.6rem" });
    form.innerHTML = `
      <div class="field"><label for="fn">First name</label><input id="fn" required autocomplete="given-name" /></div>
      <div class="field"><label for="ph">WhatsApp number</label><input id="ph" required inputmode="tel" autocomplete="tel" placeholder="10-digit mobile" /></div>
      <div class="field field-wide"><label for="em">Email</label><input id="em" type="email" required autocomplete="email" /></div>
      <div class="field field-wide"><label for="reason">Reason for visit</label><select id="reason"></select></div>
      <div class="field field-wide"><label for="notes">Notes for the doctor (optional)</label><textarea id="notes"></textarea></div>
      <div class="field"><label for="day">Day</label><select id="day"></select></div>
      <div class="field"><label for="slot">Time (30 min)</label><select id="slot"></select></div>`;
    const fn = form.querySelector("#fn") as HTMLInputElement;
    const ph = form.querySelector("#ph") as HTMLInputElement;
    const em = form.querySelector("#em") as HTMLInputElement;
    const reasonEl = form.querySelector("#reason") as HTMLSelectElement;
    const notesEl = form.querySelector("#notes") as HTMLTextAreaElement;
    const dayEl = form.querySelector("#day") as HTMLSelectElement;
    const slotEl = form.querySelector("#slot") as HTMLSelectElement;
    fn.value = firstName;
    ph.value = phone;
    em.value = email;
    notesEl.value = notes;
    for (const r of VISIT_REASONS) {
      reasonEl.append(el("option", { value: r.id }, [r.label]));
    }
    reasonEl.value = reason;
    for (const d of days) {
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
      dayEl.append(el("option", { value: iso }, [label]));
    }
    const dayIso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    dayEl.value = dayIso;
    slotEl.append(el("option", { value: "" }, [slots.length ? "Select a time" : "No times left this day"]));
    for (const s of slots) {
      slotEl.append(el("option", { value: s.time }, [s.label]));
    }
    if (slot) slotEl.value = slot.time;

    fn.addEventListener("input", () => (firstName = fn.value));
    ph.addEventListener("input", () => (phone = ph.value));
    em.addEventListener("input", () => (email = em.value));
    notesEl.addEventListener("input", () => (notes = notesEl.value));
    reasonEl.addEventListener("change", () => (reason = reasonEl.value));
    dayEl.addEventListener("change", () => {
      const [y, m, d] = dayEl.value.split("-").map(Number);
      day = new Date(y, m - 1, d);
      slot = null;
      void paint();
    });
    slotEl.addEventListener("change", () => {
      slot = slots.find((s) => s.time === slotEl.value) ?? null;
    });

    if (error) form.append(el("p", { class: "err field-wide" }, [error]));
    const go = el("button", { class: "btn btn-gold field-wide", type: "submit" }, [
      `Request ${sku.title} · ${formatInr(sku.priceInr)}`
    ]);
    form.append(go);
    form.append(
      el("p", { class: "micro field-wide" }, [
        "Confirm on WhatsApp after this form. Fees are paid by UPI or at the clinic — this page does not take card payment and will not show a fake success."
      ])
    );
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      error = "";
      const chosen = slots.find((s) => s.time === slotEl.value);
      if (!fn.value.trim() || !em.value.includes("@") || ph.value.replace(/\D/g, "").length < 10) {
        error = "Please leave your name, email, and a working WhatsApp number.";
        await paint();
        return;
      }
      if (!chosen) {
        error = "Please choose a day and time that is still free.";
        await paint();
        return;
      }
      const pack = createPackFromSku(sku, { email: em.value.trim().toLowerCase(), userId: user?.id });
      pack.visitsUsed = 1;
      await savePack(pack);
      const booking: Booking = {
        id: uid("bkg"),
        createdAt: new Date().toISOString(),
        userId: user?.id,
        firstName: fn.value.trim(),
        email: em.value.trim().toLowerCase(),
        phone: ph.value.trim(),
        skuId: sku.id,
        packId: pack.id,
        mode: sku.mode,
        reason: reasonEl.value,
        notes: notesEl.value.trim(),
        dateIso: chosen.dateIso,
        time: chosen.time,
        startIso: chosen.start.toISOString(),
        endIso: chosen.end.toISOString(),
        status: "requested",
        payStatus: "unpaid",
        priceInr: sku.priceInr
      };
      await saveBooking(booking);
      done = booking;
      doneSku = sku;
      await paint();
    });
    wrap.append(form);
    wrap.append(
      el("p", { class: "disclaimer" }, [
        CLINIC_MEDICAL_NOTE,
        " After the visit the doctor may write a plan on Shree Urocare letterhead."
      ])
    );
    root.append(wrap);
  }

  await paint();
}
