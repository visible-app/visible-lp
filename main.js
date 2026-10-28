// Visible pre-registration page.

/**
 * The release. 「11月11日、iPhoneでリリース」 is written in the page itself
 * (index.html, the two `data-release` places), so it shows even before this
 * script runs. Once the app is out, put its App Store link in `appStoreUrl`:
 * both places become the App Store button.
 */
const release = {
  appStoreUrl: "",
  appStoreLabel: "App Storeでダウンロード",
};

/** What the page says once an address is in (Kit sends no confirmation email). */
const thanks = "登録ありがとうございます。11月11日のリリースをお知らせします。";

/** ①②③'s frames (assets/flow/00.jpg …): how many each part has, in order. */
const flow = { frames: [26, 22, 28], src: (index) => `assets/flow/${String(index).padStart(2, "0")}.jpg` };

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- release ---------- */
for (const element of document.querySelectorAll("[data-release]")) {
  if (release.appStoreUrl) {
    element.classList.add("is-released");
    element.innerHTML = "";
    const link = document.createElement("a");
    link.href = release.appStoreUrl;
    link.textContent = release.appStoreLabel;
    link.rel = "noopener";
    element.append(link);
  }
}

/* ---------- ② the choices: as in the app, the first one chosen is answered ---------- */
const choices = [...document.querySelectorAll(".choice")];
const answer = document.querySelector(".answer");
for (const choice of choices) {
  choice.addEventListener("click", () => {
    choice.setAttribute("aria-pressed", choice.getAttribute("aria-pressed") === "true" ? "false" : "true");
    const first = choices.find((entry) => entry.getAttribute("aria-pressed") === "true");
    if (!first) { answer.hidden = true; return; }
    answer.querySelector(".answer-heading").textContent = first.dataset.heading;
    answer.querySelector(".answer-body").textContent = first.dataset.body;
    if (answer.hidden) { answer.hidden = false; }
  });
}

/* ---------- sections coming up as they scroll in ---------- */
const reveals = document.querySelectorAll(".reveal");
if (reduceMotion || !("IntersectionObserver" in window)) {
  reveals.forEach((element) => element.classList.add("is-in"));
} else {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) { entry.target.classList.add("is-in"); observer.unobserve(entry.target); }
    }
  }, { rootMargin: "0px 0px -12% 0px" });
  reveals.forEach((element) => observer.observe(element));
}

/* ---------- ④ the three, stepped through as the page scrolls ---------- */
const total = flow.frames.reduce((sum, count) => sum + count, 0);
const partStarts = flow.frames.map((_, index) => flow.frames.slice(0, index).reduce((sum, count) => sum + count, 0));
const pillarsSection = document.querySelector(".pillars");

if (reduceMotion) {
  // No scroll-driven motion: each of the three, still, with its finished picture.
  const list = document.createElement("div");
  list.className = "pillars-static";
  document.querySelectorAll(".pillar").forEach((pillar, index) => {
    const figure = document.createElement("figure");
    figure.innerHTML = pillar.innerHTML;
    const image = document.createElement("img");
    image.src = flow.src(partStarts[index] + flow.frames[index] - 1);
    image.alt = "";
    image.loading = "lazy";
    figure.append(image);
    list.append(figure);
  });
  pillarsSection.querySelector(".pillars-sticky").append(list);
} else {
  const track = document.querySelector(".pillars-track");
  const canvas = document.querySelector(".phone-screen");
  const context = canvas.getContext("2d");
  const pillars = [...document.querySelectorAll(".pillar")];
  const images = new Array(total);
  let loaded = false;
  let drawn = -1;
  let activePart = 0;

  const load = () => {
    if (loaded) return;
    loaded = true;
    for (let index = 0; index < total; index += 1) {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => { if (index === 0 || index === drawn) draw(drawn < 0 ? 0 : drawn, true); };
      image.src = flow.src(index);
      images[index] = image;
    }
  };

  const draw = (index, force = false) => {
    if (index === drawn && !force) return;
    // The nearest frame already in, so a slow connection never shows a blank screen.
    for (let offset = 0; offset < total; offset += 1) {
      const candidate = images[index - offset] ?? images[index + offset];
      if (candidate && candidate.complete && candidate.naturalWidth) {
        context.drawImage(candidate, 0, 0, canvas.width, canvas.height);
        break;
      }
    }
    drawn = index;
  };

  const setPart = (part) => {
    if (part === activePart) return;
    pillars.forEach((pillar, index) => {
      pillar.classList.toggle("is-active", index === part);
      pillar.classList.toggle("was-active", index < part);
    });
    activePart = part;
  };

  // Each of the three takes a third of the scroll: its motion plays in the first three quarters, then holds.
  const update = () => {
    const rect = track.getBoundingClientRect();
    const span = rect.height - window.innerHeight;
    const progress = Math.min(1, Math.max(0, -rect.top / span));
    const part = Math.min(2, Math.floor(progress * 3));
    const within = Math.min(1, (progress * 3 - part) / 0.75);
    setPart(part);
    draw(partStarts[part] + Math.round(within * (flow.frames[part] - 1)));
  };

  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  };

  // The frames load only as the section comes near.
  new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) load();
  }, { rootMargin: "600px 0px" }).observe(pillarsSection);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
}

/* ---------- ⑤ 先行登録 (sent to the Kit form; nothing else is collected) ---------- */
const form = document.querySelector(".signup-form");
const message = form.querySelector(".form-message");
const email = form.querySelector("input[name=email_address]");
const trap = form.querySelector("input[name=lp_check]");
const submit = form.querySelector("button[type=submit]");

/**
 * An email address in its usual shape: a name, 「@」, then a domain with at
 * least one dot whose last part is two letters or more (「a@b」「a@b.c」
 * 「a b@c.jp」 are not sent).
 */
const emailShape = /^[^\s@"(),:;<>[\]\\]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;
const isEmail = (value) => value.length <= 254 && emailShape.test(value) && !value.includes("..");

/*
 * Kit sometimes holds a sign-up (「quarantined」) until a person passes its
 * security check. Like Kit's own form, its check page opens here; it tells this
 * page when it is done (「ckjs:guard:confirmed」). Resolves true once the
 * sign-up went through, false if the check was closed first.
 */
const kitOrigin = "https://app.kit.com";
const guard = document.querySelector(".guard");
const guardFrame = guard.querySelector(".guard-frame");
const guardFrameBox = guard.querySelector(".guard-frame-box");
const guardPageWidth = 400;
let guardPageHeight = 500;
const fitGuard = () => {
  const scale = Math.min(1, guardFrameBox.clientWidth / guardPageWidth);
  guardFrame.style.height = `${guardPageHeight}px`;
  guardFrame.style.transform = `scale(${scale})`;
  guardFrameBox.style.height = `${Math.ceil(guardPageHeight * scale)}px`;
};
window.addEventListener("resize", () => { if (guard.open) fitGuard(); });
const confirmWithKit = (url) => new Promise((resolve) => {
  let checkUrl;
  try {
    checkUrl = new URL(url);
  } catch {
    resolve(false);
    return;
  }
  if (checkUrl.origin !== kitOrigin || !checkUrl.pathname.startsWith("/forms/guards/")) {
    resolve(false);
    return;
  }
  let confirmed = false;
  const listen = (event) => {
    if (event.origin !== kitOrigin || event.source !== guardFrame.contentWindow) return;
    const data = event.data || {};
    if (data.name === "ckjs:guard:size" && Number(data.height) > 0) {
      guardPageHeight = Math.min(Number(data.height), 640);
      fitGuard();
    }
    if (data.name === "ckjs:guard:confirmed") {
      confirmed = true;
      guard.close();
    }
  };
  guard.addEventListener("close", () => {
    window.removeEventListener("message", listen);
    guardFrame.removeAttribute("src");
    resolve(confirmed);
  }, { once: true });
  window.addEventListener("message", listen);
  guardFrame.src = checkUrl.href;
  guard.showModal();
  fitGuard();
});
guard.querySelector(".guard-close").addEventListener("click", () => guard.close());

/*
 * GA4: one generate_lead for a sign-up Kit accepted (right away, or once its
 * security check was passed). Only how it went through is sent — never the
 * address. If GA4 is blocked or fails, nothing changes for the person signing up.
 */
const recordLead = (method) => {
  try {
    if (typeof window.gtag === "function") window.gtag("event", "generate_lead", { method });
  } catch {
    // Measuring must never get in the way of signing up.
  }
};

const say = (text, kind) => {
  message.textContent = text;
  message.className = `form-message ${kind ? `is-${kind}` : ""}`;
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  // Filled in by a program, not a person: nothing is sent (and it is shown nothing different).
  if (trap.value) {
    form.reset();
    say(thanks, "success");
    return;
  }
  const address = email.value.trim();
  if (!address || !email.checkValidity() || !isEmail(address)) {
    say("メールアドレスを確かめてください。", "error");
    email.focus();
    return;
  }
  submit.disabled = true;
  say("送っています…");
  // At most one generate_lead for this sign-up, however the success arrives.
  let leadRecorded = false;
  const succeeded = (method) => {
    if (!leadRecorded) {
      leadRecorded = true;
      recordLead(method);
    }
    form.reset();
    say(thanks, "success");
  };
  try {
    // Only the address goes to Kit.
    const body = new FormData();
    body.append("email_address", address);
    const response = await fetch(form.action, { method: "POST", body, headers: { Accept: "application/json" } });
    const result = await response.json();
    if (result.status === "success") {
      succeeded("kit");
    } else if (result.status === "quarantined") {
      say("確認の画面を開いています…");
      if (await confirmWithKit(result.url)) {
        succeeded("kit_checked");
      } else {
        say("登録はまだ終わっていません。もう一度「先行登録する」を押して、確認を最後まで進めてください。", "error");
      }
    } else {
      say("うまく登録できませんでした。メールアドレスを確かめて、もう一度お試しください。", "error");
    }
  } catch {
    say("通信がうまくいきませんでした。少し時間をおいて、もう一度お試しください。", "error");
  } finally {
    submit.disabled = false;
  }
});
