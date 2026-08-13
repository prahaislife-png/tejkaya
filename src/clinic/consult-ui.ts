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

function kolkataStamp(iso: string): { dateIso: string; time: string } {
  const start = new Date(iso);
  return {
    dateIso: start.toLocaleDateString("en-CA", { timeZone: CLINIC.timezone }),
    time: start.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: CLINIC.timezone
    })
  };
}

function card(eyebrow: string, title: string, children: Array<Node | string>): HTMLElement {
  const box = el("aside", { class: "consult-card" });
  box.append(el("p", { class: "eyebrow" }, [eyebrow]), el("h2", {}, [title]), ...children);
  return box;
}

function leftRail(sku: ConsultSku): HTMLElement {
  const fees = el("ul", { class: "consult-fees" });
  for (const s of CONSULT_SKUS) {
    const li = el("li", { class: s.id === sku.id ? "is-on" : "" });
    li.append(el("span", {}, [s.title]), el("strong", {}, [formatInr(s.priceInr)]));
    fees.append(li);
  }
  return card("Physician", CLINIC.doctor, [
    el("p", { class: "consult-cred" }, [CLINIC.credentials]),
    el("p", {}, [CLINIC.role]),
    el("p", { class: "subtle consult-hi" }, [CLINIC.hindi]),
    el("p", { class: "micro" }, ["Marathi · Hindi · English · 30 minutes"]),
    fees,
    el("p", { class: "micro" }, [
      sku.mode === "clinic"
        ? "In-clinic for examination. Pay at the desk or UPI after you book. No card charge here."
        : "Video anywhere in India. Quiet room, camera on. Pack: first slot now, follow-ups on the same calendar."
    ]),
    el("p", { class: "micro" }, ["Bring reports and a medicine list. Tej Kaya jars are not this visit."])
  ]);
}

function rightRail(sku: ConsultSku): HTMLElement {
  const tel = `tel:+${CLINIC.whatsapp}`;
  const wa = whatsappHref(`Namaste, I would like to book ${sku.title} with ${CLINIC.doctor}.`);
  return card("Clinic", CLINIC.name, [
    el("p", { class: "micro" }, [CLINIC.hours, " IST"]),
    el("p", {}, [CLINIC.address]),
      el("div", { class: "consult-links" }, [
        el("a", { class: "text-link", href: CLINIC.maps, target: "_blank", rel: "noopener" }, ["Map"]),
        el("a", { class: "text-link", href: tel }, ["Call"]),
        el("a", { class: "text-link", href: wa, target: "_blank", rel: "noopener" }, ["WhatsApp"]),
        el("a", { class: "text-link", href: `mailto:${CLINIC.email}` }, ["Email"]),
        el("a", { class: "text-link", href: CLINIC.instagram, target: "_blank", rel: "noopener" }, ["Instagram"]),
        el("a", { class: "text-link", href: CLINIC.site, target: "_blank", rel: "noopener" }, ["shreeurocare.in"])
      ]),
    el("p", { class: "micro" }, ["Chapekar Chowk flyover, near New English School."]),
    el("p", { class: "eyebrow" }, ["After you pick a time"]),
    el("ol", { class: "consult-list" }, [
      el("li", {}, ["Cal.com emails the slot. Video link is in that mail."]),
      el("li", {}, ["WhatsApp name + UPI screenshot, or pay at the desk."]),
      el("li", {}, ["Clinic: 10 minutes early. Video: join from the mail."])
    ]),
    el("p", { class: "micro consult-note" }, [CLINIC_MEDICAL_NOTE])
  ]);
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
      error = "Add a WhatsApp number in the form so the clinic can confirm.";
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

  function mast(): HTMLElement {
    const bar = el("header", { class: "consult-mast" });
    const copy = el("div");
    copy.append(
      el("p", { class: "eyebrow" }, ["Shree Urocare · Chinchwad, Pune"]),
      el("h1", {}, ["Consult with Dr Rajeshree."])
    );
    const meta = el("div", { class: "consult-mast-meta" });
    meta.append(
      el("p", {}, [`${CLINIC.hours} · ${CLINIC.phoneDisplay}`]),
      el("p", { class: "micro" }, ["Live calendar. Choose a visit, leave your WhatsApp, pick a time."])
    );
    bar.append(copy, meta);
    return bar;
  }

  async function paint(): Promise<void> {
    const sku = skuById(skuId) ?? CONSULT_SKUS[1];
    root.replaceChildren();
    const page = el("div", { class: "consult-page" });
    page.append(mast());

    const board = el("div", { class: "consult-board" });
    const leftCol = el("div", { class: "consult-rail" });
    leftCol.append(leftRail(sku));
    board.append(leftCol);

    const main = el("div", { class: "consult-main" });

    if (done && doneSku) {
      const copy = eventCopy(done, doneSku);
      const start = new Date(done.startIso);
      const end = new Date(done.endIso);
      const cal = googleCalendarUrl({ ...copy, start, end });
      const wa = whatsappHref(
        `Namaste, I booked ${doneSku.title} with ${CLINIC.doctor} on ${done.dateIso} at ${done.time} via Cal.com. Name: ${done.firstName}. Phone: ${done.phone}. Reason: ${done.reason}. Fee ${formatInr(done.priceInr)}. I will confirm payment on WhatsApp / UPI.`
      );
      const panel = el("div", { class: "consult-confirm" });
      panel.append(
        el("p", { class: "eyebrow" }, ["Cal.com"]),
        el("h2", {}, ["Booked on Cal.com."]),
        el("p", {}, [
          `${doneSku.title} · ${formatInr(done.priceInr)} · ${done.dateIso} · ${done.time} · ${
            done.mode === "clinic" ? "Chinchwad clinic" : "Video"
          }`
        ]),
        el("p", { class: "micro" }, [
          "Unpaid until UPI on WhatsApp or cash/UPI at the desk. This page does not fake a card success."
        ])
      );
      const actions = el("div", { class: "app-actions" });
      actions.append(el("a", { class: "btn btn-gold", href: wa, target: "_blank", rel: "noopener" }, ["WhatsApp confirm"]));
      actions.append(el("a", { class: "btn btn-solid", href: cal, target: "_blank", rel: "noopener" }, ["Google Calendar"]));
      if (done.videoCallUrl) {
        actions.append(
          el("a", { class: "btn btn-ghost", href: done.videoCallUrl, target: "_blank", rel: "noopener" }, ["Join video"])
        );
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
      panel.append(actions);
      panel.append(el("p", { class: "micro" }, [`UPI: ${CLINIC.upiId}. Send the screenshot on WhatsApp.`]));
      main.append(panel);
      board.append(main, el("div", { class: "consult-rail" }, [rightRail(doneSku)]));
      page.append(board);
      root.append(page);
      return;
    }

    const skus = el("div", { class: "consult-skus" });
    for (const s of CONSULT_SKUS) {
      const tab = el("button", {
        class: `sku-tab ${s.id === sku.id ? "is-on" : ""}`,
        type: "button"
      });
      tab.append(
        el("p", { class: "eyebrow" }, [s.mode === "clinic" ? "Pune clinic" : "India-wide video"]),
        el("h3", {}, [s.title]),
        el("p", { class: "price-lg" }, [formatInr(s.priceInr)])
      );
      tab.addEventListener("click", () => {
        skuId = s.id;
        void paint();
      });
      skus.append(tab);
    }

    const form = el("form", { class: "consult-form field-grid" });
    form.innerHTML = `
      <div class="field"><label for="fn">First name</label><input id="fn" required autocomplete="given-name" /></div>
      <div class="field"><label for="ph">WhatsApp</label><input id="ph" required inputmode="tel" autocomplete="tel" placeholder="10-digit mobile" /></div>
      <div class="field"><label for="em">Email</label><input id="em" type="email" required autocomplete="email" /></div>
      <div class="field"><label for="reason">Reason</label><select id="reason"></select></div>
      <div class="field field-notes"><label for="notes">Notes for the doctor</label><textarea id="notes" placeholder="Optional"></textarea></div>`;
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

    const calPanel = el("div", { class: "consult-cal" });
    calPanel.append(
      el("div", { class: "consult-cal-head" }, [
        el("div", {}, [
          el("p", { class: "eyebrow" }, ["Cal.com"]),
          el("h2", {}, [sku.title]),
          el("p", { class: "micro" }, [
            sku.visits > 1
              ? "Three video visits. Book the first time here; book follow-ups on the same calendar."
              : sku.blurb
          ])
        ]),
        el("a", { class: "text-link", href: calBookingUrl(sku.id), target: "_blank", rel: "noopener" }, [
          "Open this calendar on Cal.com"
        ])
      ])
    );
    const calBox = el("div", { id: "cal-embed", class: "cal-embed" });
    calBox.setAttribute("data-cal-link", calLinkForSku(sku.id));
    calPanel.append(calBox);
    const desk = el("div", { class: "consult-desk" });
    desk.append(skus, form, calPanel);
    main.append(desk);

    board.append(main, el("div", { class: "consult-rail" }, [rightRail(sku)]));
    page.append(board);
    root.append(page);

    const reasonLabel = VISIT_REASONS.find((r) => r.id === reason)?.label ?? reason;
    const prefillNotes = [
      `WhatsApp: ${phone || "(add above)"}`,
      `Visit: ${sku.title} (${formatInr(sku.priceInr)})`,
      `Reason: ${reasonLabel}`,
      notes.trim()
    ]
      .filter(Boolean)
      .join("\n");
    mountCalInline({
      el: calBox,
      namespace: sku.mode === "clinic" ? "clinic" : "video",
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
