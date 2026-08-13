import { currentUser, register, signIn } from "../auth";
import { el } from "../lib/dom";
import { SHORT_DISCLAIMER } from "../config/disclaimers";

function nextUrl(): string {
  const n = new URLSearchParams(location.search).get("next");
  if (!n || n.includes("://") || n.startsWith("//") || n.includes("..")) return "account.html";
  return n;
}

export async function mountSignIn(root: HTMLElement): Promise<void> {
  let mode: "in" | "up" = "in";
  let error = "";

  function paint(): void {
    root.replaceChildren();
    const wrap = el("div", { class: "app-shell" });
    wrap.append(
      el("p", { class: "eyebrow" }, ["The Atelier"]),
      el("h1", {}, [mode === "in" ? "Sign in." : "Create your account."]),
      el("p", { class: "lede app-kicker" }, [
        "One house key for Ritual Finder, Private, and 21 Days. Physical products will join this same account when they launch."
      ])
    );
    const form = el("form", { class: "panel field-grid" });
    if (mode === "up") {
      form.innerHTML = `
        <div class="field"><label for="fn">First name</label><input id="fn" name="firstName" required autocomplete="given-name" /></div>
        <div class="field"><label for="em">Email</label><input id="em" name="email" type="email" required autocomplete="email" /></div>
        <div class="field field-wide"><label for="pw">Password</label><input id="pw" name="password" type="password" required minlength="8" autocomplete="new-password" /></div>`;
    } else {
      form.innerHTML = `
        <div class="field"><label for="em">Email</label><input id="em" name="email" type="email" required autocomplete="email" /></div>
        <div class="field"><label for="pw">Password</label><input id="pw" name="password" type="password" required minlength="8" autocomplete="current-password" /></div>`;
    }
    if (error) form.append(el("p", { class: "err field-wide" }, [error]));
    const go = el("button", { class: "btn btn-gold field-wide", type: "submit" }, [
      mode === "in" ? "Sign in" : "Create account"
    ]);
    form.append(go);
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      error = "";
      const email = (form.querySelector("#em") as HTMLInputElement).value;
      const password = (form.querySelector("#pw") as HTMLInputElement).value;
      try {
        if (mode === "up") {
          const firstName = (form.querySelector("#fn") as HTMLInputElement).value;
          await register({ firstName, email, password });
        } else {
          await signIn(email, password);
        }
        location.href = nextUrl();
      } catch (e) {
        error = e instanceof Error ? e.message : "Something did not work.";
        paint();
      }
    });
    wrap.append(form);
    const toggle = el("button", { class: "text-link", type: "button", style: "margin-top:1.2rem" }, [
      mode === "in" ? "Need an account?" : "Already have an account?"
    ]);
    toggle.addEventListener("click", () => {
      mode = mode === "in" ? "up" : "in";
      error = "";
      paint();
    });
    wrap.append(toggle, el("p", { class: "disclaimer" }, [SHORT_DISCLAIMER]));
    root.append(wrap);
  }
  paint();
  void currentUser().then((user) => {
    if (user) location.href = nextUrl();
  });
}
