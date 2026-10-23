// Visible pre-registration page.

/**
 * The release, in one place. Once the app is out, put its App Store link in
 * `appStoreUrl`: every 「11月11日、iPhoneでリリース」 on the page becomes the
 * App Store button.
 */
const release = {
  label: "11月11日、iPhoneでリリース",
  appStoreUrl: "",
  appStoreLabel: "App Storeでダウンロード",
};

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
  } else {
    element.textContent = release.label;
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

const say = (text, kind) => {
  message.textContent = text;
  message.className = `form-message ${kind ? `is-${kind}` : ""}`;
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  // Filled in by a program, not a person: nothing is sent (and it is shown nothing different).
  if (trap.value) {
    form.reset();
    say("確認メールを送りました。メールの中のボタンを押すと、先行登録が完了します。", "success");
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
  try {
    // Only the address goes to Kit.
    const body = new FormData();
    body.append("email_address", address);
    const response = await fetch(form.action, { method: "POST", body, headers: { Accept: "application/json" } });
    const result = await response.json();
    if (result.status === "success") {
      form.reset();
      say("確認メールを送りました。メールの中のボタンを押すと、先行登録が完了します。", "success");
    } else {
      say("うまく登録できませんでした。メールアドレスを確かめて、もう一度お試しください。", "error");
    }
  } catch {
    say("通信がうまくいきませんでした。少し時間をおいて、もう一度お試しください。", "error");
  } finally {
    submit.disabled = false;
  }
});
