// Stripe.js helpers for the customer storefront checkout.

let stripeInstance = null;
let cardElement = null;
let elementsInstance = null;
let publishableKey = null;

function loadScript() {
  if (window.Stripe) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://js.stripe.com/v3/";
    s.async = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error("Could not load Stripe.js"));
    document.head.appendChild(s);
  });
}

export async function initStripe(publishableKeyFromApi) {
  publishableKey = publishableKeyFromApi;
  if (!publishableKey) return { ok: false, reason: "no-key" };
  await loadScript();
  stripeInstance = window.Stripe(publishableKey);
  return { ok: true };
}

export function mountCardElement(containerEl) {
  if (!stripeInstance || !containerEl) return false;
  unmountCardElement();
  elementsInstance = stripeInstance.elements();
  cardElement = elementsInstance.create("card", {
    style: {
      base: {
        fontSize: "16px",
        color: "#1a1c1f",
        fontFamily: "Inter, Plus Jakarta Sans, system-ui, sans-serif",
        "::placeholder": { color: "#94a3b8" },
      },
      invalid: { color: "#ef4444" },
    },
  });
  cardElement.mount(containerEl);
  return true;
}

export function unmountCardElement() {
  if (cardElement) {
    try { cardElement.unmount(); } catch {}
    cardElement = null;
  }
  elementsInstance = null;
}

export async function confirmCardPayment(clientSecret) {
  if (!stripeInstance || !cardElement) {
    return { error: { message: "Card form not ready. Select Card payment and try again." } };
  }
  return stripeInstance.confirmCardPayment(clientSecret, {
    payment_method: { card: cardElement },
  });
}

export function isStripeReady() {
  return !!(stripeInstance && cardElement && publishableKey);
}
