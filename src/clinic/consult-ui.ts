import { currentUser } from "../auth";
import { el } from "../lib/dom";
import { uid } from "../lib/crypto";
import { downloadText } from "../lib/download";
import {
  calBookingUrl,
  calLinkForSku,
  mountCalInline,
  type CalBookingSuccess
} from "./cal";
import {
  CLINIC,
  CLINIC_MEDICAL_NOTE,
  CONSULT_SKUS,
  VISIT_REASONS,
  formatInr,
  skuById,
  type ConsultSku
} from "./config";
import { googleCalendarUrl, icsEvent, upiHref, whatsappHref } from "./calendar";
import { createPackFromSku, saveBooking, savePack, type Booking } from "../store/clinic";

function eventCopy(booking: Booking, sku: ConsultSku): { title: string; details: string; location: string } {
  const title = `${sku.mode === "clinic" ? "Clinic" : "Video"} consult — ${CLINIC.doctor}`;
  const location =
    sku.mode === "clinic" ? CLINIC.address : booking.videoCallUrl || "Cal.com video — link in confirmation email";
  const details = [
    CLINIC.name,
    `${booking.firstName} · ${booking.phone}`,
    sku.title,
    `Reason: ${booking.reason}`,
    CLINIC.phoneDisplay,
    booking.calUid ? `Cal.com ${booking.calUid}` : "",
    CLINIC_MEDICAL_NOTE
  ]
    .filter(Boolean)
    .join("\n");
  return { title, details, location };
}

function kolkataStamp(iso: string): { dateIso: string; time: string; start: Date; end: Date } {
  const start = new Date(iso);
  const dateIso = start.toLocaleDateString("en-CA", { timeZone: CLINIC.timezone });
  const time = start.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: CLINIC.timezone
  });
  return { dateIso, time, start, end: start };
}

export async function mountConsult(root: HTMLElement): Promise<void> {
  const user = await currentUser().catch(() => null);
  const params = new URLSearchParams(location.search);
  let skuId = params.get("sku") || "video-1";
  if (!skuById(skuId)) skuId = "video-1";
  let firstName = user?.firstName ?? "";
  let email = user?.email ?? "";
  let phone = "";
  let reason = params.get("reason") || "general";
  let notes = "";
  let error = "";
  let done: Booking | null = null;
  let doneSku: ConsultSku | null = null;

  async function onCalBooked(data: CalBookingSuccess, sku: ConsultSku): Promise<void> {
    const attendee = data.attendees?.[0];
    const name = firstName.trim() || attendee?.name || "Guest";
    const mail = email.trim().toLowerCase() || attendee?.email || "";
    if (phone.replace(/\D/g, "").length < 10) {
      error = "Add a WhatsApp number above so the clinic can confirm, then book the time again if needed.";
      await paint();
      return;
    }
    const startIso = data.startTime || new Date().toISOString();
    const endIso = data.endTime || new Date(new Date(startIso).getTime() + 30 * 60 * 1000).toISOString();
    const stamp = kolkataStamp(startIso);
    const pack = createPackFromSku(sku, { email: mail, userId: user?.id });
    pack.visitsUsed = 1;
    await savePack(pack);
    const booking: Booking = {
      id: uid("bkg"),
      createdAt: new Date().toISOString(),
      userId: user?.id,
      firstName: name,
      email: mail,
      phone: phone.trim(),
      skuId: sku.id,
      packId: pack.id,
      mode: sku.mode,
      reason,
      notes: notes.trim(),
      dateIso: stamp.dateIso,
      time: stamp.time,
      startIso,
      endIso,
      status: "confirmed",
      payStatus: "unpaid",
      priceInr: sku.priceInr,
      calUid: data.uid,
      videoCallUrl: data.videoCallUrl
    };
    await saveBooking(booking);
    done = booking;
    doneSku = sku;
    await paint();
  }

  async function paint(): Promise<void> {
    const sku = skuById(skuId) ?? CONSULT_SKUS[1];
    root.replaceChildren();
    const wrap = el("div", { class: "app-shell" });

    if (done && doneSku) {
      const copy = eventCopy(done, doneSku);
      const start = new Date(done.startIso);
      const end = new Date(done.endIso);
      const cal = googleCalendarUrl({ ...copy, start, end });
      const wa = whatsappHref(
        `Namaste, I booked ${doneSku.title} with ${CLINIC.doctor} on ${done.dateIso} at ${done.time} via Cal.com. Name: ${done.firstName}. Phone: ${done.phone}. Reason: ${done.reason}. Fee ${formatInr(done.priceInr)}. I will confirm payment on WhatsApp / UPI.`
      );
      wrap.innerHTML = `<p class="eyebrow">${CLINIC.name}</p>
        <h1>Booked on Cal.com.</h1>
        <p class="lede">WhatsApp the clinic to confirm payment. ${CLINIC.doctor} writes any plan or prescription in her name after the visit.</p>
        <div class="panel">
          <p><strong>${doneSku.title}</strong> · ${formatInr(done.priceInr)}</p>
          <p>${done.dateIso} · ${done.time} · ${done.mode === "clinic" ? "Chinchwad clinic" : "Video"}</p>
          ${done.videoCallUrl ? `<p class="micro">Video: ${done.videoCallUrl}</p>` : ""}
          <p class="micro">Payment: unpaid until you send UPI on WhatsApp or pay at the clinic. We do not fake a successful Razorpay charge.</p>
        </div>`;
      const actions = el("div", { class: "app-actions" });
      actions.append(el("a", { class: "btn btn-gold", href: wa, target: "_blank", rel: "noopener" }, ["WhatsApp confirm"]));
      actions.append(el("a", { class: "btn btn-solid", href: cal, target: "_blank", rel: "noopener" }, ["Google Calendar"]));
      if (done.videoCallUrl) {
        actions.append(el("a", { class: "btn btn-ghost", href: done.videoCallUrl, target: "_blank", rel: "noopener" }, ["Join video"]));
      }
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
        `${CLINIC.credentials}. ${CLINIC.role}, ${CLINIC.city}. Times are live from Cal.com — Mon–Sat, 10:00–20:00 IST.`
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
      if (s.visits > 1) {
        card.append(
          el("p", { class: "micro" }, [
            `${s.visits} visits · ${formatInr(Math.round(s.priceInr / s.visits))} each · book follow-ups on the same calendar`
          ])
        );
      }
      card.addEventListener("click", () => {
        skuId = s.id;
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
      <div class="field field-wide"><label for="notes">Notes for the doctor (optional)</label><textarea id="notes"></textarea></div>`;
    const fn = form.querySelector("#fn") as HTMLInputElement;
    const ph = form.querySelector("#ph") as HTMLInputElement;
    const em = form.querySelector("#em") as HTMLInputElement;
    const reasonEl = form.querySelector("#reason") as HTMLSelectElement;
    const notesEl = form.querySelector("#notes") as HTMLTextAreaElement;
    fn.value = firstName;
    ph.value = phone;
    em.value = email;
    notesEl.value = notes;
    for (const r of VISIT_REASONS) {
      reasonEl.append(el("option", { value: r.id }, [r.label]));
    }
    reasonEl.value = reason;
    fn.addEventListener("input", () => (firstName = fn.value));
    ph.addEventListener("input", () => (phone = ph.value));
    em.addEventListener("input", () => (email = em.value));
    notesEl.addEventListener("input", () => (notes = notesEl.value));
    reasonEl.addEventListener("change", () => (reason = reasonEl.value));
    if (error) form.append(el("p", { class: "err field-wide" }, [error]));
    form.append(
      el("p", { class: "micro field-wide" }, [
        "Pick a time in the Cal.com calendar below. Fees are paid by UPI or at the clinic — this page does not take card payment and will not show a fake success."
      ])
    );
    wrap.append(form);

    const calPanel = el("div", { class: "panel", style: "margin-top:1.2rem" });
    calPanel.append(
      el("p", { class: "eyebrow" }, ["Cal.com"]),
      el("h2", {}, [sku.mode === "clinic" ? "In-clinic times" : "Video times"]),
      el("p", { class: "micro" }, [
        sku.visits > 1
          ? "This pack is three video visits. Book the first slot now; book the next two when you need them. Confirm the pack fee on WhatsApp."
          : `Live availability for ${sku.title}.`
      ])
    );
    const calBox = el("div", { id: "cal-embed", class: "cal-embed" });
    calBox.setAttribute("data-cal-link", calLinkForSku(sku.id));
    calPanel.append(calBox);
    calPanel.append(
      el("p", { class: "micro" }, [
        el("a", { href: calBookingUrl(sku.id), target: "_blank", rel: "noopener" }, ["Open this calendar on Cal.com"])
      ])
    );
    wrap.append(calPanel);
    wrap.append(el("p", { class: "disclaimer" }, [CLINIC_MEDICAL_NOTE]));
    root.append(wrap);

    const reasonLabel = VISIT_REASONS.find((r) => r.id === reason)?.label ?? reason;
    const prefillNotes = [
      `WhatsApp: ${phone || "(add above)"}`,
      `Visit: ${sku.title} (${formatInr(sku.priceInr)})`,
      `Reason: ${reasonLabel}`,
      notes.trim()
    ]
      .filter(Boolean)
      .join("\n");
    const ns = sku.mode === "clinic" ? "clinic" : "video";
    mountCalInline({
      el: calBox,
      namespace: ns,
      calLink: calLinkForSku(sku.id),
      name: firstName,
      email,
      notes: prefillNotes,
      onBooked: (data) => {
        void onCalBooked(data, sku);
      }
    });
  }

  await paint();
}
