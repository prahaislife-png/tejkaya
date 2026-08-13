import { describe, expect, it } from "vitest";
import { calBookingUrl, calLinkForSku, calSlugForSku } from "./cal";

describe("Cal.com public links", () => {
  it("maps clinic SKU to the in-person event", () => {
    expect(calSlugForSku("clinic-1")).toBe("clinic-30");
    expect(calLinkForSku("clinic-1")).toBe("govin-floyd-6lk5bw/clinic-30");
    expect(calBookingUrl("clinic-1")).toMatch(/^https:\/\/cal\.com\//);
  });

  it("maps video SKUs (including the 3-visit pack) to the video event", () => {
    expect(calSlugForSku("video-1")).toBe("video-30");
    expect(calSlugForSku("video-3")).toBe("video-30");
  });
});
