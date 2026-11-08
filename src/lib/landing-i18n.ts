import { useSyncExternalStore } from "react";

export type UiLang = "en" | "de" | "fr" | "it";
export const UI_LANGS: { code: UiLang; label: string; name: string }[] = [
  { code: "en", label: "EN", name: "English" },
  { code: "de", label: "DE", name: "Deutsch" },
  { code: "fr", label: "FR", name: "Français" },
  { code: "it", label: "IT", name: "Italiano" },
];

const KEY = "offer-ready-ui-lang";

/* One shared store so every menu and the page copy stay in sync. */
let current: UiLang = "en";
let initialized = false;
const listeners = new Set<() => void>();

function ensureInit() {
  if (initialized) return;
  if (typeof window === "undefined") return;
  initialized = true;
  if (typeof window !== "undefined") {
    let saved: UiLang | null = null;
    try {
      saved = localStorage.getItem(KEY) as UiLang | null;
    } catch {
      /* Storage may be blocked. */
    }
    if (saved && UI_LANGS.some((l) => l.code === saved)) current = saved;
    document.documentElement.lang = current;
  }
}

function getUiLang(): UiLang {
  ensureInit();
  return current;
}

function getServerUiLang(): UiLang {
  return "en";
}

function setUiLang(l: UiLang) {
  ensureInit();
  if (current === l) return;
  current = l;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* Selection still works without persistence. */
    }
    document.documentElement.lang = l;
  }
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** English on first render (matches SSR), then the saved choice. Shared by all callers. */
export function useUiLang() {
  ensureInit();
  const lang = useSyncExternalStore(subscribe, getUiLang, getServerUiLang);
  return [lang, setUiLang] as const;
}

type Copy = {
  signIn: string;
  dashboard: string;
  tagline: string;
  h1a: string;
  h1b: string;
  intro: string;
  start: string;
  history: string;
  step: string;
  alt: string;
  steps: { title: string; body: string }[];
};

export const LANDING: Record<UiLang, Copy> = {
  en: {
    signIn: "Sign in",
    dashboard: "Dashboard",
    tagline: "CV · Company research · Mock interview · Scoring",
    h1a: "Practise the real interview",
    h1b: "before the real interview",
    intro:
      "Give it your CV and the job you want. Offer Ready researches the company, explains how their hiring process usually runs, then sits you down with an interviewer who asks questions out loud and grades how you answer.",
    start: "Start preparing",
    history: "See my history",
    step: "Step",
    alt: "Your AI interviewer",
    steps: [
      {
        title: "Add your CV and the job ad",
        body: "Upload a PDF or Word CV and paste the job description you are targeting.",
      },
      {
        title: "Get the company brief",
        body: "Live research on what they do, their culture, recent news and how they usually hire.",
      },
      {
        title: "Sit the mock interview",
        body: "An interviewer asks you questions out loud. You answer on camera, in your own voice.",
      },
      {
        title: "See your score",
        body: "Honest marks per answer, stronger model answers, and a CV review for that exact role.",
      },
    ],
  },
  de: {
    signIn: "Anmelden",
    dashboard: "Übersicht",
    tagline: "Lebenslauf · Firmenrecherche · Probeinterview · Bewertung",
    h1a: "Üben Sie das echte Interview",
    h1b: "vor dem echten Interview",
    intro:
      "Laden Sie Ihren Lebenslauf und die gewünschte Stelle hoch. Offer Ready recherchiert die Firma, erklärt den üblichen Bewerbungsprozess und führt dann ein Interview mit Ihnen, bei dem die Fragen laut gestellt und Ihre Antworten bewertet werden.",
    start: "Vorbereitung starten",
    history: "Meine Übersicht",
    step: "Schritt",
    alt: "Ihr KI-Interviewer",
    steps: [
      {
        title: "Lebenslauf und Stelleninserat hinzufügen",
        body: "Laden Sie Ihren Lebenslauf als PDF oder Word hoch und fügen Sie das Stelleninserat ein.",
      },
      {
        title: "Firmenprofil erhalten",
        body: "Aktuelle Recherche zu Tätigkeit, Kultur, News und dem üblichen Rekrutierungsablauf.",
      },
      {
        title: "Probeinterview führen",
        body: "Ein Interviewer stellt Ihnen Fragen laut. Sie antworten vor der Kamera, mit Ihrer eigenen Stimme.",
      },
      {
        title: "Bewertung ansehen",
        body: "Ehrliche Noten pro Antwort, stärkere Musterantworten und eine Lebenslauf-Analyse für genau diese Stelle.",
      },
    ],
  },
  fr: {
    signIn: "Se connecter",
    dashboard: "Tableau de bord",
    tagline: "CV · Recherche entreprise · Entretien simulé · Évaluation",
    h1a: "Entraînez-vous au vrai entretien",
    h1b: "avant le vrai entretien",
    intro:
      "Donnez votre CV et le poste visé. Offer Ready étudie l'entreprise, explique son processus de recrutement habituel, puis vous fait passer un entretien à voix haute et évalue vos réponses.",
    start: "Commencer la préparation",
    history: "Voir mon historique",
    step: "Étape",
    alt: "Votre recruteur IA",
    steps: [
      {
        title: "Ajoutez votre CV et l'annonce",
        body: "Téléversez un CV PDF ou Word et collez la description du poste visé.",
      },
      {
        title: "Recevez le profil de l'entreprise",
        body: "Recherche en direct sur leurs activités, leur culture, leurs actualités et leur façon de recruter.",
      },
      {
        title: "Passez l'entretien simulé",
        body: "Un recruteur vous pose des questions à voix haute. Vous répondez face caméra, avec votre propre voix.",
      },
      {
        title: "Consultez votre score",
        body: "Des notes honnêtes par réponse, de meilleures réponses types et une analyse du CV pour ce poste précis.",
      },
    ],
  },
  it: {
    signIn: "Accedi",
    dashboard: "Panoramica",
    tagline: "CV · Ricerca azienda · Colloquio simulato · Valutazione",
    h1a: "Esercitati per il vero colloquio",
    h1b: "prima del vero colloquio",
    intro:
      "Carica il tuo CV e l'annuncio che ti interessa. Offer Ready studia l'azienda, spiega come si svolge di solito la selezione, poi ti fa sostenere un colloquio a voce e valuta le tue risposte.",
    start: "Inizia a prepararti",
    history: "Vedi il mio storico",
    step: "Passo",
    alt: "Il tuo selezionatore IA",
    steps: [
      {
        title: "Aggiungi CV e annuncio",
        body: "Carica un CV in PDF o Word e incolla la descrizione del posto che ti interessa.",
      },
      {
        title: "Ricevi il profilo aziendale",
        body: "Ricerca aggiornata su attività, cultura, notizie recenti e modalità di selezione.",
      },
      {
        title: "Sostieni il colloquio simulato",
        body: "Un selezionatore ti fa domande a voce. Rispondi davanti alla telecamera, con la tua voce.",
      },
      {
        title: "Guarda il tuo punteggio",
        body: "Voti onesti per ogni risposta, risposte modello migliori e un'analisi del CV per quel ruolo.",
      },
    ],
  },
};
