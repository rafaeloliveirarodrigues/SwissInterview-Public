// EN/DE/FR/IT copy for the legal pages, consent dialogs and the privacy & data page.
// Client-safe. Follows the shared language store from landing-i18n.
import { useUiLang, type UiLang } from "./landing-i18n";
import { CONTROLLER, PRIVACY_POLICY_VERSION } from "./privacy";

export type LegalSection = { h: string; p?: string[]; li?: string[] };

type Legal = {
  footer: { impressum: string; privacy: string; contact: string; data: string };
  impressum: {
    title: string;
    responsible: string;
    contact: string;
    disclaimerH: string;
    disclaimer: string[];
  };
  privacy: { title: string; version: string; updated: string; sections: LegalSection[] };
  consent: {
    before: string;
    link: string;
    after: string;
    required: string;
    modalTitle: string;
    modalBody: string;
    modalAccept: string;
    signOut: string;
  };
  media: {
    title: string;
    intro: string;
    items: string[];
    checkbox: string;
    start: string;
    back: string;
  };
  data: {
    title: string;
    intro: string;
    downloadH: string;
    downloadBody: string;
    downloadBtn: string;
    deleteH: string;
    deleteBody: string;
    deleteBtn: string;
    deleteConfirm: string;
    deleted: string;
    policyH: string;
    policyBody: string;
    consentOn: string;
    noConsent: string;
  };
  back: string;
};

const V = PRIVACY_POLICY_VERSION;
const C = CONTROLLER;
const addr = `${C.name}, ${C.street}, ${C.city}, ${C.country}`;

// TODO(Rafael): verify each provider's transfer basis before relying on this text:
// - OpenAI (USA): EU-US / Swiss-US Data Privacy Framework certification or SCCs in its DPA
// - Google (USA, speech + sign-in): DPF certification
// - Apple (USA, sign-in): DPF certification or SCCs
// - Cloudflare (global edge): DPF certification
// - Lovable (gateway + email service): DPA and subprocessors / SCCs
// - Buy Me a Coffee (USA): DPF certification or SCCs
// Check the list at https://www.dataprivacyframework.gov and update the policy version if anything changes.

export const LEGAL: Record<UiLang, Legal> = {
  en: {
    footer: { impressum: "Legal notice", privacy: "Privacy policy", contact: "Contact", data: "Privacy & data" },
    impressum: {
      title: "Legal notice",
      responsible: "Responsible for this website",
      contact: "Contact",
      disclaimerH: "Disclaimer",
      disclaimer: [
        "The content of this website was created with care, but we cannot guarantee that it is correct, complete or up to date. Interview feedback, CV checks, salary estimates and reference letter analyses are automated practice aids, not legal, tax or career advice.",
        "This website contains links to third-party websites. We have no influence on their content and accept no responsibility for it; the respective operator is solely responsible.",
      ],
    },
    privacy: {
      title: "Privacy policy",
      version: `Version ${V}`,
      updated: "Last updated: 30 October 2026",
      sections: [
        {
          h: "1. Controller and contact",
          p: [
            `The controller under the Swiss Federal Act on Data Protection (revFADP) and, where applicable, the EU General Data Protection Regulation (GDPR) is: ${addr}. Email: ${C.email}.`,
          ],
        },
        {
          h: "2. Data we process, by feature",
          li: [
            "Account: email address, name, and the data sent by Google or Apple if you sign in with them (name, email, account identifier).",
            "CVs: the uploaded file (PDF, Word or text) in private storage, and the text extracted from it.",
            "Job ads: the role, company name and job description you enter, plus the company research and interview guide generated from them.",
            "Mock interviews: questions, your answer transcripts, speech metrics (speaking rate, filler words), scores and AI feedback.",
            "Reference letters (Arbeitszeugnis): the analysis result. The uploaded file itself is not stored.",
            "RAV job-search records: the applications you enter, which may include names, email addresses and phone numbers of contact persons at employers.",
            "Interview credits and promo codes: your remaining balance and which codes you redeemed.",
            "Buy Me a Coffee: if you support us, the donor email address sent by Buy Me a Coffee, used to reset your balance.",
            "Technical logs: IP address, browser and error information, kept briefly by our hosting providers for security and operation.",
            "Essential local storage in your browser: your sign-in session token, your language choice and interface state.",
          ],
          p: ["Page statistics: our hosting provider Lovable records which pages are viewed and for how long, linked to a random session ID. This does not include your name, email address or anything you enter. We use it only to see how the site is used. We do not use advertising or cross-site tracking tools."],
        },
        {
          h: "3. Audio and video",
          li: [
            "Video from your camera stays in your browser. It is never uploaded. An optional local recording is held in memory and discarded when the interview ends.",
            "Audio of your answers is sent only to transcribe it to text. The audio is not stored.",
            "Only the text transcript (and speech metrics derived from it) is saved to your account.",
          ],
        },
        {
          h: "4. Purposes",
          p: [
            "We process your data only to prepare you for job interviews, give feedback, review reference letters and help you document your job search for the RAV. Legal bases: performance of our service at your request, your consent, and our legitimate interest in operating a secure service.",
            "Your data is not sold, not shared with employers and not used to train AI models.",
          ],
        },
        {
          h: "5. Automated scoring",
          p: [
            "Interview scores, CV ratings and feedback are generated automatically by AI. They are for practice only and have no legal or employment consequences. No decision about you is made on that basis.",
          ],
        },
        {
          h: "6. Recipients and countries",
          li: [
            "Lovable Cloud – database and file storage (Germany, EU).",
            "Lovable AI Gateway – routes AI requests to the model providers below.",
            "Lovable – page statistics (pages viewed, time on page).",
            "OpenAI (USA) – text analysis: CV, job ad, answers, reference letter text.",
            "Google (USA) – speech-to-text and text-to-speech.",
            "Cloudflare – edge hosting of the website (global network).",
            "Lovable email service (USA) – sign-in and account emails.",
            "Buy Me a Coffee (USA) – payment processing for coffee support.",
            "Google and Apple (USA) – only if you choose to sign in with them.",
            "Wikipedia and Google News – receive only the company name for research.",
          ],
        },
        {
          h: "7. Transfers abroad",
          p: [
            "Some recipients are located in the USA or other countries. Transfers take place on the basis of the Swiss-US and EU-US Data Privacy Framework where the provider is certified, and otherwise on the basis of Standard Contractual Clauses approved by the European Commission and recognised by the FDPIC.",
          ],
        },
        {
          h: "8. Retention and deletion",
          li: [
            "Your data is kept until you delete it or your account.",
            "Once a month we check for inactive accounts. Accounts inactive for 24 months are deleted automatically. We email you a warning at 21 months, and never delete an account sooner than 30 days after that warning.",
            "Buy Me a Coffee payment records are kept as long as required for accounting.",
          ],
        },
        {
          h: "9. Your rights",
          p: [
            `You can request access, correction, deletion and a copy of your data (data portability), and object to processing. You can download your data and delete your account at any time on the “Privacy & data” page, or write to ${C.email}.`,
            "You may lodge a complaint with the Swiss Federal Data Protection and Information Commissioner (FDPIC, www.edoeb.admin.ch) or with a supervisory authority in your EU country.",
          ],
        },
        {
          h: "10. Cookies and local storage",
          p: [
            "We use these essential browser storage items: the sign-in session token, the language setting and interface state. Our hosting provider also sets two technical cookies: a deployment cookie (__dpl) and a session cookie (session-id). No advertising or cross-site tracking cookies are used.",
          ],
        },
      ],
    },
    consent: {
      before: "I have read and accept the ",
      link: "privacy policy",
      after: ".",
      required: "Please accept the privacy policy to continue.",
      modalTitle: "Our privacy policy",
      modalBody: `Please review and accept our privacy policy (version ${V}) to continue using Offer Ready.`,
      modalAccept: "Accept and continue",
      signOut: "Sign out",
    },
    media: {
      title: "Before you start: camera and microphone",
      intro: "The interview uses your camera and microphone. Here is what happens with them:",
      items: [
        "Video stays on your device. It is never uploaded.",
        "Audio of your answers is sent for transcription only and is not stored.",
        "The text transcript of your answers is saved to your account.",
      ],
      checkbox: "I understand and agree to the use of my camera and microphone for this interview.",
      start: "Start interview",
      back: "Back",
    },
    data: {
      title: "Privacy & data",
      intro: "See and control the data stored in your account.",
      downloadH: "Download my data",
      downloadBody: "A JSON file with your profile, preparations including CV text, interviews, answers, scores, reference reviews, question practice, RAV applications and credits.",
      downloadBtn: "Download my data",
      deleteH: "Delete my account",
      deleteBody: "Permanently deletes your account and all associated data. This cannot be undone.",
      deleteBtn: "Delete my account",
      deleteConfirm: "Delete your account, CVs, preparations and interviews permanently? This cannot be undone.",
      deleted: "Your account and data were deleted.",
      policyH: "Privacy policy",
      policyBody: "How we process your data and your rights.",
      consentOn: "You accepted version {version} on {date}.",
      noConsent: "Not yet accepted.",
    },
    back: "Back",
  },
  de: {
    footer: { impressum: "Impressum", privacy: "Datenschutzerklärung", contact: "Kontakt", data: "Datenschutz & Daten" },
    impressum: {
      title: "Impressum",
      responsible: "Verantwortlich für diese Website",
      contact: "Kontakt",
      disclaimerH: "Haftungsausschluss",
      disclaimer: [
        "Die Inhalte dieser Website wurden sorgfältig erstellt. Für Richtigkeit, Vollständigkeit und Aktualität übernehmen wir jedoch keine Gewähr. Interview-Feedback, CV-Checks, Lohnschätzungen und Arbeitszeugnis-Analysen sind automatisierte Übungshilfen und keine Rechts-, Steuer- oder Karriereberatung.",
        "Diese Website enthält Links zu Websites Dritter. Auf deren Inhalte haben wir keinen Einfluss und übernehmen dafür keine Haftung; verantwortlich ist allein der jeweilige Betreiber.",
      ],
    },
    privacy: {
      title: "Datenschutzerklärung",
      version: `Version ${V}`,
      updated: "Stand: 30. Oktober 2026",
      sections: [
        {
          h: "1. Verantwortlicher und Kontakt",
          p: [
            `Verantwortlich im Sinne des Schweizer Datenschutzgesetzes (revDSG/nDSG) und, soweit anwendbar, der EU-Datenschutz-Grundverordnung (DSGVO) ist: ${addr}. E-Mail: ${C.email}.`,
          ],
        },
        {
          h: "2. Bearbeitete Daten nach Funktion",
          li: [
            "Konto: E-Mail-Adresse, Name sowie die von Google oder Apple übermittelten Daten, wenn du dich damit anmeldest (Name, E-Mail, Konto-Kennung).",
            "Lebensläufe: die hochgeladene Datei (PDF, Word oder Text) in privatem Speicher und der daraus extrahierte Text.",
            "Stellenanzeigen: Rolle, Firmenname und Stellenbeschreibung sowie die daraus erstellte Firmenrecherche und der Interview-Leitfaden.",
            "Probeinterviews: Fragen, Transkripte deiner Antworten, Sprechmetriken (Sprechtempo, Füllwörter), Bewertungen und KI-Feedback.",
            "Arbeitszeugnisse: das Analyseergebnis. Die hochgeladene Datei selbst wird nicht gespeichert.",
            "RAV-Arbeitsbemühungen: die von dir erfassten Bewerbungen, die Namen, E-Mail-Adressen und Telefonnummern von Kontaktpersonen bei Arbeitgebern enthalten können.",
            "Interview-Guthaben und Promo-Codes: dein Restguthaben und eingelöste Codes.",
            "Buy Me a Coffee: wenn du uns unterstützt, die von Buy Me a Coffee übermittelte E-Mail-Adresse, um dein Guthaben zurückzusetzen.",
            "Technische Logs: IP-Adresse, Browser- und Fehlerinformationen, die unsere Hosting-Anbieter kurzzeitig für Sicherheit und Betrieb speichern.",
            "Notwendiger lokaler Speicher im Browser: Anmelde-Token, Sprachwahl und Oberflächenstatus.",
          ],
          p: ["Seitenstatistik: Unser Hosting-Anbieter Lovable erfasst, welche Seiten aufgerufen werden und wie lange, verknüpft mit einer zufälligen Sitzungs-ID. Name, E-Mail-Adresse und deine Eingaben sind darin nicht enthalten. Wir nutzen diese Daten nur, um zu sehen, wie die Website genutzt wird. Wir verwenden keine Werbe- oder websiteübergreifenden Tracking-Tools."],
        },
        {
          h: "3. Audio und Video",
          li: [
            "Das Kamerabild bleibt in deinem Browser und wird nie hochgeladen. Eine optionale lokale Aufnahme liegt nur im Arbeitsspeicher und wird am Ende des Interviews verworfen.",
            "Die Tonaufnahme deiner Antworten wird nur zur Umwandlung in Text übermittelt und nicht gespeichert.",
            "Gespeichert wird nur das Texttranskript (und daraus abgeleitete Sprechmetriken).",
          ],
        },
        {
          h: "4. Zwecke",
          p: [
            "Wir bearbeiten deine Daten nur, um dich auf Vorstellungsgespräche vorzubereiten, Feedback zu geben, Arbeitszeugnisse zu prüfen und deine Arbeitsbemühungen für das RAV zu dokumentieren. Rechtsgrundlagen: Erbringung des von dir gewünschten Dienstes, deine Einwilligung sowie unser berechtigtes Interesse an einem sicheren Betrieb.",
            "Deine Daten werden nicht verkauft, nicht an Arbeitgeber weitergegeben und nicht zum Training von KI-Modellen verwendet.",
          ],
        },
        {
          h: "5. Automatisierte Bewertung",
          p: [
            "Interview-Bewertungen, CV-Ratings und Feedback werden automatisch durch KI erstellt. Sie dienen nur der Übung und haben keine rechtlichen oder arbeitsrechtlichen Folgen. Es werden darauf gestützt keine Entscheidungen über dich getroffen.",
          ],
        },
        {
          h: "6. Empfänger und Länder",
          li: [
            "Lovable Cloud – Datenbank und Dateispeicher (Deutschland, EU).",
            "Lovable AI Gateway – leitet KI-Anfragen an die untenstehenden Modellanbieter weiter.",
            "Lovable – Seitenstatistik (aufgerufene Seiten, Verweildauer).",
            "OpenAI (USA) – Textanalyse: Lebenslauf, Stellenanzeige, Antworten, Zeugnistext.",
            "Google (USA) – Sprache-zu-Text und Text-zu-Sprache.",
            "Cloudflare – Edge-Hosting der Website (globales Netzwerk).",
            "Lovable E-Mail-Dienst (USA) – Anmelde- und Konto-E-Mails.",
            "Buy Me a Coffee (USA) – Zahlungsabwicklung für Kaffee-Unterstützung.",
            "Google und Apple (USA) – nur wenn du dich damit anmeldest.",
            "Wikipedia und Google News – erhalten nur den Firmennamen für die Recherche.",
          ],
        },
        {
          h: "7. Bekanntgabe ins Ausland",
          p: [
            "Einige Empfänger befinden sich in den USA oder anderen Ländern. Die Übermittlung erfolgt gestützt auf das Swiss-US bzw. EU-US Data Privacy Framework, sofern der Anbieter zertifiziert ist, andernfalls gestützt auf Standardvertragsklauseln der EU-Kommission, die vom EDÖB anerkannt sind.",
          ],
        },
        {
          h: "8. Aufbewahrung und Löschung",
          li: [
            "Deine Daten werden gespeichert, bis du sie oder dein Konto löschst.",
            "Einmal im Monat prüfen wir, welche Konten inaktiv sind. Konten, die 24 Monate inaktiv sind, werden automatisch gelöscht. Nach 21 Monaten erhältst du eine Warnung per E-Mail; gelöscht wird frühestens 30 Tage nach dieser Warnung.",
            "Buy-Me-a-Coffee-Zahlungsdaten werden so lange aufbewahrt, wie es die Buchführungspflicht verlangt.",
          ],
        },
        {
          h: "9. Deine Rechte",
          p: [
            `Du hast das Recht auf Auskunft, Berichtigung, Löschung, Herausgabe deiner Daten (Datenportabilität) und Widerspruch. Auf der Seite «Datenschutz & Daten» kannst du jederzeit deine Daten herunterladen und dein Konto löschen, oder du schreibst an ${C.email}.`,
            "Du kannst dich beim Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB, www.edoeb.admin.ch) oder bei einer Aufsichtsbehörde in deinem EU-Land beschweren.",
          ],
        },
        {
          h: "10. Cookies und lokaler Speicher",
          p: [
            "Wir verwenden diese notwendigen Browser-Speichereinträge: das Anmelde-Token, die Spracheinstellung und den Oberflächenstatus. Zusätzlich setzt unser Hosting-Anbieter zwei technische Cookies: ein Deployment-Cookie (__dpl) und ein Sitzungs-Cookie (session-id). Es werden keine Werbe- oder websiteübergreifenden Tracking-Cookies verwendet.",
          ],
        },
      ],
    },
    consent: {
      before: "Ich habe die ",
      link: "Datenschutzerklärung",
      after: " gelesen und akzeptiere sie.",
      required: "Bitte akzeptiere die Datenschutzerklärung, um fortzufahren.",
      modalTitle: "Unsere Datenschutzerklärung",
      modalBody: `Bitte lies und akzeptiere unsere Datenschutzerklärung (Version ${V}), um Offer Ready weiter zu nutzen.`,
      modalAccept: "Akzeptieren und fortfahren",
      signOut: "Abmelden",
    },
    media: {
      title: "Bevor es losgeht: Kamera und Mikrofon",
      intro: "Das Interview nutzt deine Kamera und dein Mikrofon. Das passiert damit:",
      items: [
        "Das Video bleibt auf deinem Gerät und wird nie hochgeladen.",
        "Die Tonaufnahme deiner Antworten wird nur zur Transkription übermittelt und nicht gespeichert.",
        "Das Texttranskript deiner Antworten wird in deinem Konto gespeichert.",
      ],
      checkbox: "Ich habe das verstanden und bin mit der Nutzung von Kamera und Mikrofon für dieses Interview einverstanden.",
      start: "Interview starten",
      back: "Zurück",
    },
    data: {
      title: "Datenschutz & Daten",
      intro: "Sieh und kontrolliere die in deinem Konto gespeicherten Daten.",
      downloadH: "Meine Daten herunterladen",
      downloadBody: "Eine JSON-Datei mit Profil, Vorbereitungen inkl. CV-Text, Interviews, Antworten, Bewertungen, Zeugnisanalysen, Einzelfragen-Übungen, RAV-Bewerbungen und Guthaben.",
      downloadBtn: "Meine Daten herunterladen",
      deleteH: "Konto löschen",
      deleteBody: "Löscht dein Konto und alle zugehörigen Daten endgültig. Dies kann nicht rückgängig gemacht werden.",
      deleteBtn: "Konto löschen",
      deleteConfirm: "Konto, Lebensläufe, Vorbereitungen und Interviews endgültig löschen? Dies kann nicht rückgängig gemacht werden.",
      deleted: "Dein Konto und deine Daten wurden gelöscht.",
      policyH: "Datenschutzerklärung",
      policyBody: "Wie wir deine Daten bearbeiten und welche Rechte du hast.",
      consentOn: "Du hast Version {version} am {date} akzeptiert.",
      noConsent: "Noch nicht akzeptiert.",
    },
    back: "Zurück",
  },
  fr: {
    footer: { impressum: "Mentions légales", privacy: "Politique de confidentialité", contact: "Contact", data: "Confidentialité & données" },
    impressum: {
      title: "Mentions légales",
      responsible: "Responsable de ce site",
      contact: "Contact",
      disclaimerH: "Clause de non-responsabilité",
      disclaimer: [
        "Le contenu de ce site a été rédigé avec soin, mais nous ne pouvons garantir son exactitude, son exhaustivité ni son actualité. Les retours d’entretien, contrôles de CV, estimations salariales et analyses de certificats de travail sont des aides d’entraînement automatisées, et non des conseils juridiques, fiscaux ou de carrière.",
        "Ce site contient des liens vers des sites de tiers. Nous n’avons aucune influence sur leur contenu et déclinons toute responsabilité ; seul l’exploitant concerné en est responsable.",
      ],
    },
    privacy: {
      title: "Politique de confidentialité",
      version: `Version ${V}`,
      updated: "Dernière mise à jour : 30 octobre 2026",
      sections: [
        {
          h: "1. Responsable et contact",
          p: [
            `Le responsable du traitement au sens de la loi fédérale suisse sur la protection des données (nLPD) et, le cas échéant, du Règlement général sur la protection des données de l’UE (RGPD) est : ${addr}. E-mail : ${C.email}.`,
          ],
        },
        {
          h: "2. Données traitées, par fonctionnalité",
          li: [
            "Compte : adresse e-mail, nom et données transmises par Google ou Apple si vous vous connectez avec eux (nom, e-mail, identifiant de compte).",
            "CV : le fichier téléversé (PDF, Word ou texte) dans un stockage privé, et le texte qui en est extrait.",
            "Offres d’emploi : poste, nom de l’entreprise et description saisis, ainsi que la recherche sur l’entreprise et le guide d’entretien générés.",
            "Entretiens simulés : questions, transcriptions de vos réponses, indicateurs vocaux (débit, mots de remplissage), notes et retours de l’IA.",
            "Certificats de travail : le résultat de l’analyse. Le fichier téléversé n’est pas conservé.",
            "Recherches d’emploi ORP : les candidatures saisies, pouvant inclure noms, e-mails et numéros de téléphone de personnes de contact chez les employeurs.",
            "Crédits d’entretien et codes promo : votre solde restant et les codes utilisés.",
            "Buy Me a Coffee : si vous nous soutenez, l’e-mail du donateur transmis par Buy Me a Coffee, utilisé pour réinitialiser votre solde.",
            "Journaux techniques : adresse IP, navigateur et informations d’erreur, conservés brièvement par nos hébergeurs pour la sécurité et l’exploitation.",
            "Stockage local essentiel dans votre navigateur : jeton de session, choix de langue et état de l’interface.",
          ],
          p: ["Statistiques de pages : notre hébergeur Lovable enregistre les pages consultées et la durée de consultation, associées à un identifiant de session aléatoire. Elles ne contiennent ni votre nom, ni votre adresse e-mail, ni le contenu que vous saisissez. Nous les utilisons uniquement pour comprendre l’utilisation du site. Nous n’utilisons aucun outil publicitaire ni de suivi entre sites."],
        },
        {
          h: "3. Audio et vidéo",
          li: [
            "La vidéo de votre caméra reste dans votre navigateur et n’est jamais téléversée. Un enregistrement local facultatif est gardé en mémoire et supprimé à la fin de l’entretien.",
            "L’audio de vos réponses est envoyé uniquement pour être transcrit. Il n’est pas conservé.",
            "Seule la transcription écrite (et les indicateurs vocaux qui en découlent) est enregistrée dans votre compte.",
          ],
        },
        {
          h: "4. Finalités",
          p: [
            "Nous traitons vos données uniquement pour vous préparer aux entretiens d’embauche, fournir des retours, analyser des certificats de travail et documenter vos recherches d’emploi pour l’ORP. Bases légales : exécution du service demandé, votre consentement et notre intérêt légitime à exploiter un service sûr.",
            "Vos données ne sont pas vendues, pas communiquées aux employeurs et pas utilisées pour entraîner des modèles d’IA.",
          ],
        },
        {
          h: "5. Évaluation automatisée",
          p: [
            "Les notes d’entretien, évaluations de CV et retours sont générés automatiquement par l’IA. Ils servent uniquement à l’entraînement et n’ont aucune conséquence juridique ou professionnelle. Aucune décision vous concernant n’est prise sur cette base.",
          ],
        },
        {
          h: "6. Destinataires et pays",
          li: [
            "Lovable Cloud – base de données et stockage de fichiers (Allemagne, UE).",
            "Lovable AI Gateway – achemine les requêtes d’IA vers les fournisseurs ci-dessous.",
            "Lovable – statistiques de pages (pages consultées, durée de consultation).",
            "OpenAI (États-Unis) – analyse de texte : CV, offre, réponses, texte du certificat.",
            "Google (États-Unis) – reconnaissance et synthèse vocales.",
            "Cloudflare – hébergement en périphérie du site (réseau mondial).",
            "Service e-mail de Lovable (États-Unis) – e-mails de connexion et de compte.",
            "Buy Me a Coffee (États-Unis) – traitement des paiements de soutien.",
            "Google et Apple (États-Unis) – uniquement si vous choisissez de vous connecter avec eux.",
            "Wikipédia et Google Actualités – reçoivent uniquement le nom de l’entreprise pour la recherche.",
          ],
        },
        {
          h: "7. Transferts à l’étranger",
          p: [
            "Certains destinataires se trouvent aux États-Unis ou dans d’autres pays. Les transferts reposent sur le Data Privacy Framework Suisse–États-Unis et UE–États-Unis lorsque le fournisseur est certifié, sinon sur les clauses contractuelles types de la Commission européenne reconnues par le PFPDT.",
          ],
        },
        {
          h: "8. Conservation et suppression",
          li: [
            "Vos données sont conservées jusqu’à ce que vous les supprimiez ou supprimiez votre compte.",
            "Une fois par mois, nous vérifions les comptes inactifs. Les comptes inactifs depuis 24 mois sont supprimés automatiquement. Vous recevez un avertissement par e-mail à 21 mois, et aucun compte n’est supprimé moins de 30 jours après cet avertissement.",
            "Les données de paiement Buy Me a Coffee sont conservées aussi longtemps que l’exige la comptabilité.",
          ],
        },
        {
          h: "9. Vos droits",
          p: [
            `Vous pouvez demander l’accès, la rectification, l’effacement et une copie de vos données (portabilité), et vous opposer au traitement. Sur la page « Confidentialité & données », vous pouvez à tout moment télécharger vos données et supprimer votre compte, ou écrire à ${C.email}.`,
            "Vous pouvez déposer une plainte auprès du Préposé fédéral à la protection des données et à la transparence (PFPDT, www.edoeb.admin.ch) ou d’une autorité de contrôle de votre pays de l’UE.",
          ],
        },
        {
          h: "10. Cookies et stockage local",
          p: [
            "Nous utilisons les éléments de stockage essentiels suivants : le jeton de session, la langue et l’état de l’interface. Notre hébergeur dépose en outre deux cookies techniques : un cookie de déploiement (__dpl) et un cookie de session (session-id). Aucun cookie publicitaire ni de suivi entre sites n’est utilisé.",
          ],
        },
      ],
    },
    consent: {
      before: "J’ai lu et j’accepte la ",
      link: "politique de confidentialité",
      after: ".",
      required: "Veuillez accepter la politique de confidentialité pour continuer.",
      modalTitle: "Notre politique de confidentialité",
      modalBody: `Veuillez lire et accepter notre politique de confidentialité (version ${V}) pour continuer à utiliser Offer Ready.`,
      modalAccept: "Accepter et continuer",
      signOut: "Se déconnecter",
    },
    media: {
      title: "Avant de commencer : caméra et micro",
      intro: "L’entretien utilise votre caméra et votre micro. Voici ce qu’il en advient :",
      items: [
        "La vidéo reste sur votre appareil. Elle n’est jamais téléversée.",
        "L’audio de vos réponses est envoyé uniquement pour la transcription et n’est pas conservé.",
        "La transcription écrite de vos réponses est enregistrée dans votre compte.",
      ],
      checkbox: "J’ai compris et j’accepte l’utilisation de ma caméra et de mon micro pour cet entretien.",
      start: "Commencer l’entretien",
      back: "Retour",
    },
    data: {
      title: "Confidentialité & données",
      intro: "Consultez et contrôlez les données enregistrées dans votre compte.",
      downloadH: "Télécharger mes données",
      downloadBody: "Un fichier JSON avec votre profil, vos préparations y compris le texte du CV, entretiens, réponses, notes, analyses de certificats, exercices de questions, candidatures ORP et crédits.",
      downloadBtn: "Télécharger mes données",
      deleteH: "Supprimer mon compte",
      deleteBody: "Supprime définitivement votre compte et toutes les données associées. Action irréversible.",
      deleteBtn: "Supprimer mon compte",
      deleteConfirm: "Supprimer définitivement votre compte, vos CV, préparations et entretiens ? Action irréversible.",
      deleted: "Votre compte et vos données ont été supprimés.",
      policyH: "Politique de confidentialité",
      policyBody: "Comment nous traitons vos données et quels sont vos droits.",
      consentOn: "Vous avez accepté la version {version} le {date}.",
      noConsent: "Pas encore acceptée.",
    },
    back: "Retour",
  },
  it: {
    footer: { impressum: "Note legali", privacy: "Informativa sulla privacy", contact: "Contatto", data: "Privacy e dati" },
    impressum: {
      title: "Note legali",
      responsible: "Responsabile di questo sito",
      contact: "Contatto",
      disclaimerH: "Esclusione di responsabilità",
      disclaimer: [
        "I contenuti di questo sito sono stati redatti con cura, ma non possiamo garantirne correttezza, completezza o attualità. Feedback sui colloqui, controlli del CV, stime salariali e analisi dei certificati di lavoro sono ausili automatici per esercitarsi, non consulenza legale, fiscale o di carriera.",
        "Questo sito contiene link a siti di terzi. Non abbiamo alcuna influenza sul loro contenuto e non ci assumiamo alcuna responsabilità; ne risponde esclusivamente il rispettivo gestore.",
      ],
    },
    privacy: {
      title: "Informativa sulla privacy",
      version: `Versione ${V}`,
      updated: "Ultimo aggiornamento: 30 ottobre 2026",
      sections: [
        {
          h: "1. Titolare e contatto",
          p: [
            `Il titolare del trattamento ai sensi della legge federale svizzera sulla protezione dei dati (nLPD) e, ove applicabile, del Regolamento generale UE sulla protezione dei dati (GDPR) è: ${addr}. E-mail: ${C.email}.`,
          ],
        },
        {
          h: "2. Dati trattati, per funzione",
          li: [
            "Account: indirizzo e-mail, nome e i dati trasmessi da Google o Apple se accedi con loro (nome, e-mail, identificativo dell’account).",
            "CV: il file caricato (PDF, Word o testo) in uno spazio privato e il testo estratto.",
            "Annunci di lavoro: ruolo, nome dell’azienda e descrizione inseriti, oltre alla ricerca sull’azienda e alla guida al colloquio generate.",
            "Colloqui simulati: domande, trascrizioni delle tue risposte, metriche vocali (velocità, intercalari), punteggi e feedback dell’IA.",
            "Certificati di lavoro: il risultato dell’analisi. Il file caricato non viene conservato.",
            "Ricerche di lavoro URC: le candidature inserite, che possono includere nomi, e-mail e numeri di telefono di persone di contatto presso i datori di lavoro.",
            "Crediti per colloqui e codici promo: il saldo residuo e i codici riscattati.",
            "Buy Me a Coffee: se ci sostieni, l’e-mail del donatore trasmessa da Buy Me a Coffee, usata per ripristinare il saldo.",
            "Log tecnici: indirizzo IP, browser e informazioni sugli errori, conservati brevemente dai nostri fornitori di hosting per sicurezza e funzionamento.",
            "Memoria locale essenziale nel browser: token di sessione, lingua scelta e stato dell’interfaccia.",
          ],
          p: ["Statistiche delle pagine: il nostro fornitore di hosting Lovable registra quali pagine vengono visitate e per quanto tempo, collegandole a un ID di sessione casuale. Non contengono il tuo nome, il tuo indirizzo e-mail né i contenuti che inserisci. Le usiamo solo per capire come viene utilizzato il sito. Non utilizziamo strumenti pubblicitari né di tracciamento tra siti."],
        },
        {
          h: "3. Audio e video",
          li: [
            "Il video della fotocamera resta nel tuo browser e non viene mai caricato. Una registrazione locale facoltativa è tenuta in memoria ed eliminata alla fine del colloquio.",
            "L’audio delle risposte viene inviato solo per la trascrizione e non viene conservato.",
            "Nel tuo account viene salvata solo la trascrizione testuale (e le metriche vocali che ne derivano).",
          ],
        },
        {
          h: "4. Finalità",
          p: [
            "Trattiamo i tuoi dati solo per prepararti ai colloqui di lavoro, fornire feedback, analizzare certificati di lavoro e documentare le tue ricerche di lavoro per l’URC. Basi giuridiche: esecuzione del servizio da te richiesto, il tuo consenso e il nostro legittimo interesse a gestire un servizio sicuro.",
            "I tuoi dati non vengono venduti, non vengono condivisi con datori di lavoro e non sono usati per addestrare modelli di IA.",
          ],
        },
        {
          h: "5. Valutazione automatizzata",
          p: [
            "Punteggi dei colloqui, valutazioni del CV e feedback sono generati automaticamente dall’IA. Servono solo per esercitarsi e non hanno conseguenze legali o lavorative. Nessuna decisione che ti riguarda viene presa su questa base.",
          ],
        },
        {
          h: "6. Destinatari e paesi",
          li: [
            "Lovable Cloud – database e archiviazione file (Germania, UE).",
            "Lovable AI Gateway – inoltra le richieste di IA ai fornitori indicati sotto.",
            "Lovable – statistiche delle pagine (pagine visitate, tempo di permanenza).",
            "OpenAI (USA) – analisi del testo: CV, annuncio, risposte, testo del certificato.",
            "Google (USA) – trascrizione vocale e sintesi vocale.",
            "Cloudflare – hosting edge del sito (rete globale).",
            "Servizio e-mail di Lovable (USA) – e-mail di accesso e dell’account.",
            "Buy Me a Coffee (USA) – elaborazione dei pagamenti di sostegno.",
            "Google e Apple (USA) – solo se scegli di accedere con loro.",
            "Wikipedia e Google News – ricevono solo il nome dell’azienda per la ricerca.",
          ],
        },
        {
          h: "7. Trasferimenti all’estero",
          p: [
            "Alcuni destinatari si trovano negli USA o in altri paesi. I trasferimenti avvengono sulla base dello Swiss-US e EU-US Data Privacy Framework se il fornitore è certificato, altrimenti sulla base delle clausole contrattuali tipo della Commissione europea riconosciute dall’IFPDT.",
          ],
        },
        {
          h: "8. Conservazione e cancellazione",
          li: [
            "I tuoi dati sono conservati finché non li cancelli o cancelli il tuo account.",
            "Una volta al mese verifichiamo quali account sono inattivi. Gli account inattivi da 24 mesi vengono cancellati automaticamente. A 21 mesi ricevi un avviso via e-mail, e nessun account viene cancellato prima che siano trascorsi 30 giorni da tale avviso.",
            "I dati di pagamento Buy Me a Coffee sono conservati per il tempo richiesto dalla contabilità.",
          ],
        },
        {
          h: "9. I tuoi diritti",
          p: [
            `Puoi chiedere accesso, rettifica, cancellazione e una copia dei tuoi dati (portabilità), e opporti al trattamento. Nella pagina «Privacy e dati» puoi in qualsiasi momento scaricare i tuoi dati e cancellare l’account, oppure scrivere a ${C.email}.`,
            "Puoi presentare reclamo all’Incaricato federale della protezione dei dati e della trasparenza (IFPDT, www.edoeb.admin.ch) o a un’autorità di controllo del tuo paese UE.",
          ],
        },
        {
          h: "10. Cookie e memoria locale",
          p: [
            "Usiamo i seguenti elementi di memoria essenziali: il token di sessione, la lingua e lo stato dell’interfaccia. Il nostro fornitore di hosting imposta inoltre due cookie tecnici: un cookie di deployment (__dpl) e un cookie di sessione (session-id). Non vengono usati cookie pubblicitari né di tracciamento tra siti.",
          ],
        },
      ],
    },
    consent: {
      before: "Ho letto e accetto l’",
      link: "informativa sulla privacy",
      after: ".",
      required: "Accetta l’informativa sulla privacy per continuare.",
      modalTitle: "La nostra informativa sulla privacy",
      modalBody: `Leggi e accetta la nostra informativa sulla privacy (versione ${V}) per continuare a usare Offer Ready.`,
      modalAccept: "Accetta e continua",
      signOut: "Esci",
    },
    media: {
      title: "Prima di iniziare: fotocamera e microfono",
      intro: "Il colloquio usa la fotocamera e il microfono. Ecco cosa succede:",
      items: [
        "Il video resta sul tuo dispositivo. Non viene mai caricato.",
        "L’audio delle risposte viene inviato solo per la trascrizione e non viene conservato.",
        "La trascrizione testuale delle risposte viene salvata nel tuo account.",
      ],
      checkbox: "Ho capito e acconsento all’uso di fotocamera e microfono per questo colloquio.",
      start: "Inizia il colloquio",
      back: "Indietro",
    },
    data: {
      title: "Privacy e dati",
      intro: "Visualizza e controlla i dati salvati nel tuo account.",
      downloadH: "Scarica i miei dati",
      downloadBody: "Un file JSON con profilo, preparazioni incluso il testo del CV, colloqui, risposte, punteggi, analisi dei certificati, esercizi sulle domande, candidature URC e crediti.",
      downloadBtn: "Scarica i miei dati",
      deleteH: "Elimina il mio account",
      deleteBody: "Elimina definitivamente l’account e tutti i dati associati. L’operazione è irreversibile.",
      deleteBtn: "Elimina il mio account",
      deleteConfirm: "Eliminare definitivamente account, CV, preparazioni e colloqui? L’operazione è irreversibile.",
      deleted: "Il tuo account e i tuoi dati sono stati eliminati.",
      policyH: "Informativa sulla privacy",
      policyBody: "Come trattiamo i tuoi dati e quali sono i tuoi diritti.",
      consentOn: "Hai accettato la versione {version} il {date}.",
      noConsent: "Non ancora accettata.",
    },
    back: "Indietro",
  },
};

export function useLegal() {
  const [lang] = useUiLang();
  return { lang, L: LEGAL[lang] };
}
