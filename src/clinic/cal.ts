/** Public Cal.com booking — never put a cal_live API key in the frontend. */
export const CAL = {
  origin: "https://cal.com",
  embedOrigin: "https://app.cal.com",
  embedScript: "https://app.cal.com/embed/embed.js",
  username: "govin-floyd-6lk5bw",
  clinicSlug: "clinic-30",
  videoSlug: "video-30",
  brandColor: "#1b2a22"
} as const;

export function calSlugForSku(skuId: string): string {
  return skuId === "clinic-1" ? CAL.clinicSlug : CAL.videoSlug;
}

export function calLinkForSku(skuId: string): string {
  return `${CAL.username}/${calSlugForSku(skuId)}`;
}

export function calBookingUrl(skuId: string): string {
  return `${CAL.origin}/${calLinkForSku(skuId)}`;
}

export interface CalBookingSuccess {
  uid?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  videoCallUrl?: string;
  attendees?: { name?: string; email?: string }[];
}

type CalFn = {
  (...args: unknown[]): void;
  ns?: Record<string, CalFn>;
  loaded?: boolean;
  q?: unknown[];
};

declare global {
  interface Window {
    Cal?: CalFn;
  }
}

function queue(target: CalFn, args: unknown[]): void {
  target.q = target.q || [];
  target.q.push(args);
}

/** Official Cal.com embed stub — the real script drains `Cal.q`. */
function installSnippet(): CalFn {
  if (window.Cal) return window.Cal;
  const host = window;
  const src = CAL.embedScript;
  const initKey = "init";
  const Cal = function (...ar: unknown[]) {
    const cal = host.Cal as CalFn;
    if (!cal.loaded) {
      cal.ns = {};
      cal.q = cal.q || [];
      const tag = document.createElement("script");
      tag.src = src;
      tag.async = true;
      document.head.appendChild(tag);
      cal.loaded = true;
    }
    if (ar[0] === initKey) {
      const api = function (...inner: unknown[]) {
        queue(api, inner);
      } as CalFn;
      api.q = [];
      const namespace = ar[1];
      if (typeof namespace === "string") {
        cal.ns = cal.ns || {};
        cal.ns[namespace] = cal.ns[namespace] || api;
        queue(cal.ns[namespace], ar);
        queue(cal, ["initNamespace", namespace]);
      } else {
        queue(cal, ar);
      }
      return;
    }
    queue(cal, ar);
  } as CalFn;
  Cal.ns = {};
  Cal.q = [];
  host.Cal = Cal;
  return Cal;
}

export function loadCal(): CalFn {
  return installSnippet();
}

export function mountCalInline(input: {
  el: HTMLElement;
  namespace: string;
  calLink: string;
  name: string;
  email: string;
  notes: string;
  onBooked: (data: CalBookingSuccess) => void;
}): void {
  const Cal = loadCal();
  Cal("init", input.namespace, { origin: CAL.embedOrigin });
  const api = Cal.ns?.[input.namespace] ?? Cal;
  input.el.replaceChildren();
  api("inline", {
    elementOrSelector: input.el,
    calLink: input.calLink,
    config: {
      layout: "month_view",
      theme: "light",
      name: input.name,
      email: input.email,
      notes: input.notes
    }
  });
  api("ui", {
    theme: "light",
    hideEventTypeDetails: false,
    styles: { branding: { brandColor: CAL.brandColor } }
  });
  api("on", {
    action: "bookingSuccessfulV2",
    callback: (e: { detail?: { data?: CalBookingSuccess } }) => {
      const data = e.detail?.data;
      if (data) input.onBooked(data);
    }
  });
}
