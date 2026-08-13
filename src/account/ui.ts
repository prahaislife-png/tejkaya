import { currentUser, signOut, type PublicUser } from "../auth";
import { canUse } from "../access/config";
import { paymentsLive } from "../payments/provider";
import { DISCLAIMER } from "../config/disclaimers";
import { el } from "../lib/dom";
import { latestPersonalRitual, latestRitual } from "../store/user-data";

declare global {
  interface Window {
    TEJ_KAYA?: {
      products: Array<{ number: string; name: string; hindi: string; slug: string }>;
    };
  }
}

export async function mountAccount(root: HTMLElement): Promise<void> {
  const user = await currentUser();
  if (!user) {
    location.href = "sign-in.html?next=account.html";
    return;
  }
  paint(root, user);
}

async function paint(root: HTMLElement, user: PublicUser): Promise<void> {
  const ritual = await latestRitual(user.id);
  const personal = await latestPersonalRitual(user.id);
  root.replaceChildren();
  const wrap = el("div", { class: "app-shell" });
  wrap.append(
    el("p", { class: "eyebrow" }, ["Your Atelier"]),
    el("h1", {}, [`${user.firstName}, welcome in.`]),
    el("p", { class: "lede app-kicker" }, [
      "One account for the digital house — and, later, the vessels. Payments are not open. Nothing here pretends they are."
    ])
  );

  const studio = el("div", { class: "studio-grid" });
  const cards: Array<[string, string, string, string, boolean]> = [
    ["My Ritual", "The Ritual Finder composition saved to this account.", "ritual-finder.html", "Open", canUse("ritualFinder", user.entitlements)],
    ["Private Journal", "Today, seven days, thirty days, history, summary.", "private.html", "Open", canUse("privateJournal", user.entitlements)],
    ["21 Days", "A self-paced programme. Revisit any day.", "21-days.html", "Open", canUse("days21", user.entitlements)]
  ];
  for (const [title, body, href, cta, ok] of cards) {
    const a = el("a", { class: "studio-card", href: ok ? href : "account.html" });
    a.append(el("p", { class: "eyebrow" }, [ok ? "Included" : "Locked"]));
    a.append(el("h3", {}, [title]));
    a.append(el("p", {}, [ok ? body : "Access will follow payment when the house opens checkout."]));
    a.append(el("span", { class: "text-link" }, [ok ? cta : "Coming"]));
    studio.append(a);
  }
  wrap.append(studio);

  const physician = el("a", { class: "studio-card", href: "consult.html", style: "margin-top:1rem;display:block" });
  physician.append(el("p", { class: "eyebrow" }, ["Shree Urocare"]));
  physician.append(el("h3", {}, ["Speak with our physician"]));
  physician.append(
    el("p", {}, [
      "Book Dr Rajeshree — in-clinic in Chinchwad or video anywhere in India. She writes the plan. Tej Kaya does not prescribe."
    ])
  );
  physician.append(el("span", { class: "text-link" }, ["Book a consult"]));
  wrap.append(physician);

  const panel = el("div", { class: "panel", style: "margin-top:1.6rem" });
  panel.append(el("p", { class: "eyebrow" }, ["Account"]));
  panel.append(el("p", {}, [`${user.firstName} · ${user.email}`]));
  if (ritual) {
    panel.append(
      el("p", {}, [
        `Latest Ritual Finder: ${new Date(ritual.createdAt).toLocaleDateString("en-IN")} — ${ritual.habits.length} habits.`
      ])
    );
  } else {
    panel.append(el("p", {}, ["No Ritual Finder result saved yet."]));
  }
  if (personal) {
    panel.append(el("p", {}, [`Day 21 ritual saved ${new Date(personal.createdAt).toLocaleDateString("en-IN")}.`]));
  }
  if (paymentsLive()) {
    panel.append(el("p", {}, ["Payments are live."]));
  } else {
    panel.append(el("p", { class: "micro" }, ["Razorpay (or another Indian provider) can be attached later. No test charges are created here."]));
  }
  const out = el("button", { class: "btn btn-ghost", type: "button" }, ["Sign out"]);
  out.addEventListener("click", async () => {
    await signOut();
    location.href = "index.html";
  });
  panel.append(el("div", { class: "app-actions" }, [out]));
  wrap.append(panel);

  const physical = el("div", { class: "panel", style: "margin-top:1.6rem" });
  physical.append(el("p", { class: "eyebrow" }, ["Future Tej Kaya physical products"]));
  physical.append(el("h2", {}, ["Coming soon"]));
  const ul = el("ul", { class: "coming-list" });
  const products = window.TEJ_KAYA?.products ?? [];
  for (const p of products) {
    const li = el("li");
    li.append(
      el("span", {}, [`${p.number}  ${p.name}  ·  ${p.hindi}`]),
      el("a", { href: `product.html?slug=${p.slug}` }, ["Coming soon"])
    );
    ul.append(li);
  }
  physical.append(ul);
  physical.append(el("p", { class: "disclaimer" }, [DISCLAIMER]));
  wrap.append(physical);
  root.append(wrap);
}
