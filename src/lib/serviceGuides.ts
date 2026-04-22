export type PaymentOption = "full" | "installment" | "staged";

export interface ServiceGuide {
  name: string;
  tagline: string;
  priceRange: { min: number; max: number };
  priceNote: string;
  duration: string;
  adjustmentFrequency: string;
  included: string[];
  excluded: string[];
  paymentMethods: string[];
  uptrontDiscount: number;
  depositPercent: number;
  stagedAvailable: boolean;
  stagedNote: string;
  timeline: { phase: string; duration: string; detail: string }[];
  whatToExpect: { heading: string; body: string }[];
  careAndLifestyle: { heading: string; body: string }[];
  bookingCta: string;
}

export const serviceGuides: Record<string, ServiceGuide> = {
  "Orthodontic Consultation": {
    name: "Orthodontic Consultation",
    tagline:
      "Your smile journey starts here. A thorough assessment that gives you a clear plan, a real cost, and zero pressure.",
    priceRange: { min: 1500, max: 3000 },
    priceNote:
      "One-time fee. Includes full examination and written treatment plan.",
    duration: "45 – 60 minutes",
    adjustmentFrequency: "One visit only",
    included: [
      "Full oral and orthodontic examination",
      "Digital X-rays (panoramic and cephalometric)",
      "Teeth impressions or digital scan if required",
      "Personalised written treatment plan",
      "Cost estimate broken down by service type",
      "Discussion of all available options with no obligation to proceed",
    ],
    excluded: [
      "Any treatment beyond the consultation itself",
      "Pre-treatment cleaning (recommended separately, KES 3,500)",
    ],
    paymentMethods: ["M-Pesa", "Cash", "Card"],
    uptrontDiscount: 0,
    depositPercent: 100,
    stagedAvailable: false,
    stagedNote: "",
    timeline: [
      {
        phase: "Arrival and registration",
        duration: "10 min",
        detail:
          "Submit your details at reception. Bring your National ID and any previous dental records or X-rays.",
      },
      {
        phase: "Initial discussion",
        duration: "10 min",
        detail:
          "The orthodontist reviews your dental history, concerns, and goals. No question is too small.",
      },
      {
        phase: "Clinical examination",
        duration: "15 min",
        detail:
          "Full visual inspection of teeth, gums, jaw alignment, and bite. The doctor checks for spacing, crowding, and rotation issues.",
      },
      {
        phase: "X-rays and records",
        duration: "10 min",
        detail:
          "Digital X-rays are taken to assess bone structure and root positions. This is essential for accurate treatment planning.",
      },
      {
        phase: "Treatment plan presentation",
        duration: "15 min",
        detail:
          "The doctor walks you through the recommended treatment, expected duration, costs, and payment options. You leave with a written plan.",
      },
    ],
    whatToExpect: [
      {
        heading: "No pain involved",
        body: "A consultation is entirely non-invasive. The doctor examines your teeth visually and with a small mirror and probe. X-rays are quick and painless.",
      },
      {
        heading: "You will leave with a clear picture",
        body: "By the end of your consultation you will know exactly which type of braces suits your case, how long treatment will take, and what the total cost will be — broken down into what you pay at the start and what you pay monthly.",
      },
      {
        heading: "No obligation to book immediately",
        body: "The treatment plan is yours to take home. Many patients discuss it with family first. There is no pressure to commit on the day.",
      },
    ],
    careAndLifestyle: [
      {
        heading: "What to bring",
        body: "Your National ID or passport, any previous dental X-rays or records, and a list of any medications you currently take.",
      },
      {
        heading: "Arrive 10 minutes early",
        body: "This gives you time to fill in your registration form without rushing into your appointment time.",
      },
    ],
    bookingCta: "Book a Consultation",
  },

  "Metal Braces": {
    name: "Metal Braces",
    tagline:
      "The most proven and affordable orthodontic treatment. Stainless steel brackets and wires that reliably straighten any case.",
    priceRange: { min: 50000, max: 120000 },
    priceNote:
      "Full treatment, both jaws. All adjustments included. No per-visit fees.",
    duration: "18 – 36 months",
    adjustmentFrequency: "Every 4 – 8 weeks",
    included: [
      "Initial consultation and X-rays",
      "Pre-treatment dental cleaning",
      "Brackets, wires, and elastic bands for full treatment",
      "Braces fitting appointment",
      "All monthly adjustment visits for the full duration",
      "Up to 2 emergency visits if a bracket breaks or wire snaps",
      "Braces removal appointment",
      "One set of retainers (upper and lower) after removal",
    ],
    excluded: [
      "Tooth extractions if required (KES 800 – 5,000 depending on complexity)",
      "Replacement retainers if lost or damaged (KES 5,000 – 10,000 each)",
      "Additional emergency visits beyond the 2 included",
    ],
    paymentMethods: ["M-Pesa", "Cash", "Card"],
    uptrontDiscount: 5,
    depositPercent: 30,
    stagedAvailable: true,
    stagedNote:
      "Treat one jaw first (upper or lower), then the second jaw when you are ready. Treatment takes 6 – 12 months longer overall but spreads the cost significantly. Many patients choose this option.",
    timeline: [
      {
        phase: "Consultation and X-rays",
        duration: "60 min",
        detail: "Full assessment, treatment plan, and cost confirmation.",
      },
      {
        phase: "Pre-treatment cleaning",
        duration: "45 min",
        detail:
          "Professional scaling and polishing to ensure brackets bond correctly.",
      },
      {
        phase: "Braces fitting",
        duration: "60 – 90 min",
        detail:
          "Brackets are bonded to each tooth, the archwire is threaded through, and elastic bands are placed. You will feel pressure but no sharp pain.",
      },
      {
        phase: "Monthly adjustments",
        duration: "20 – 30 min each",
        detail:
          "The wire is tightened and elastic bands are replaced. The doctor monitors tooth movement and adjusts the treatment plan as needed.",
      },
      {
        phase: "Braces removal",
        duration: "30 – 45 min",
        detail:
          "Brackets are removed, teeth are polished, and retainers are fitted. This is the day most patients have been waiting for.",
      },
      {
        phase: "Retainer phase",
        duration: "Ongoing",
        detail:
          "Retainers are worn every night permanently. This is what keeps your teeth in their new position.",
      },
    ],
    whatToExpect: [
      {
        heading: "Soreness after fitting (3 – 7 days)",
        body: "Your teeth will feel sore and sensitive for the first week as they begin to move. This is normal and expected. Stick to soft foods — ugali, rice, yoghurt, eggs, soup. Paracetamol or ibuprofen helps. The soreness fades completely between adjustments.",
      },
      {
        heading: "Soreness after each adjustment (1 – 3 days)",
        body: "Each time the wire is tightened you will feel mild pressure and soreness for 1 to 3 days. It is less intense than after fitting and becomes predictable — most patients plan soft food days after their adjustment appointments.",
      },
      {
        heading: "Visible progress within months",
        body: "Most patients notice visible tooth movement within 2 – 3 months. Gaps close, crowding reduces, and the arch begins to widen. By month 6 the change is usually clear in photos.",
      },
      {
        heading: "Eating takes adjustment",
        body: "You can eat most foods but must avoid anything hard, sticky, or crunchy throughout treatment. Breaking a bracket adds an unplanned emergency visit and can slow progress.",
      },
      {
        heading: "Speech returns to normal quickly",
        body: "Some patients notice a slight lisp or difficulty speaking in the first few days. This resolves within a week as your tongue adapts to the brackets.",
      },
    ],
    careAndLifestyle: [
      {
        heading: "Foods to avoid completely",
        body: "Hard foods: nuts, raw carrots, hard sweets, popcorn, hard bread crusts, biting directly into apples. Sticky foods: toffee, gum, caramel, sticky sweets. These either break brackets or pull the wire out of position.",
      },
      {
        heading: "Cleaning your braces",
        body: "Brush after every meal — morning, after lunch, and before bed minimum. Use a soft-bristled toothbrush at a 45-degree angle to clean around each bracket. Use an interdental brush to clean under the wire. Floss daily using a floss threader or orthodontic floss. Rinse with fluoride mouthwash. Plaque that stays around brackets can leave permanent white marks on your enamel.",
      },
      {
        heading: "If a bracket comes loose or a wire pokes",
        body: "Call the clinic immediately. A loose bracket is not an emergency but needs to be fixed within a few days to keep treatment on track. If a wire is poking your cheek, use orthodontic wax (available at any pharmacy) to cover the sharp end temporarily. Do not try to cut the wire yourself.",
      },
      {
        heading: "Sports and physical activity",
        body: "You can continue all sports. Get a custom mouthguard from your orthodontist to protect your brackets and lips during contact sports.",
      },
    ],
    bookingCta: "Book Metal Braces Consultation",
  },

  "Ceramic Braces": {
    name: "Ceramic Braces",
    tagline:
      "The same effectiveness as metal braces with tooth-coloured brackets that blend into your smile throughout treatment.",
    priceRange: { min: 90000, max: 180000 },
    priceNote: "Full treatment, both jaws. All adjustments included.",
    duration: "18 – 24 months",
    adjustmentFrequency: "Every 4 – 8 weeks",
    included: [
      "Initial consultation and X-rays",
      "Pre-treatment dental cleaning",
      "Tooth-coloured ceramic brackets and wires for full treatment",
      "Braces fitting appointment",
      "All monthly adjustment visits for the full duration",
      "Up to 2 emergency visits",
      "Braces removal appointment",
      "One set of retainers after removal",
    ],
    excluded: [
      "Tooth extractions if required (KES 800 – 5,000)",
      "Replacement retainers if lost or damaged (KES 5,000 – 10,000 each)",
    ],
    paymentMethods: ["M-Pesa", "Cash", "Card"],
    uptrontDiscount: 5,
    depositPercent: 30,
    stagedAvailable: true,
    stagedNote:
      "One jaw at a time is possible with ceramic braces. Many adult patients prefer this approach to manage costs while keeping the aesthetic benefit.",
    timeline: [
      {
        phase: "Consultation and X-rays",
        duration: "60 min",
        detail:
          "Full assessment and confirmation that ceramic brackets are suitable for your case.",
      },
      {
        phase: "Pre-treatment cleaning",
        duration: "45 min",
        detail: "Essential for proper bracket bonding.",
      },
      {
        phase: "Braces fitting",
        duration: "60 – 90 min",
        detail:
          "Ceramic brackets are bonded using a light-curing adhesive. They are slightly larger than metal brackets but blend with your tooth colour.",
      },
      {
        phase: "Monthly adjustments",
        duration: "20 – 30 min each",
        detail:
          "Elastic ties are replaced at each visit. Clear or tooth-coloured ties are used to maintain aesthetics.",
      },
      {
        phase: "Braces removal and retainers",
        duration: "30 – 45 min",
        detail:
          "Ceramic brackets are removed and the enamel is polished. Retainers are fitted on the same day.",
      },
    ],
    whatToExpect: [
      {
        heading: "Aesthetics are the main advantage",
        body: "Ceramic brackets blend with your natural tooth colour. From a normal conversational distance most people will not notice you are wearing braces. The archwire is the most visible component — white-coated wires are available.",
      },
      {
        heading: "Staining is a real risk",
        body: "Ceramic brackets and the elastic ties can pick up stains from coffee, tea, tomato sauce, turmeric, and red wine. The brackets themselves are stain-resistant but the ties are replaced at each adjustment. Avoiding staining foods or rinsing immediately after helps significantly.",
      },
      {
        heading: "Slightly more fragile than metal",
        body: "Ceramic brackets are more brittle than metal and can chip if hit directly. They are not recommended for patients who play heavy contact sports without a mouthguard.",
      },
      {
        heading: "Same soreness pattern as metal braces",
        body: "Expect 3 – 7 days of soreness after fitting and 1 – 3 days after each adjustment. The movement mechanics are identical to metal braces.",
      },
    ],
    careAndLifestyle: [
      {
        heading: "Avoid staining foods and drinks",
        body: "Coffee, tea, red wine, tomato-based sauces, turmeric, and curries can stain the elastic ties and cause the brackets to look discoloured. If you consume these, rinse with water immediately and brush within 30 minutes.",
      },
      {
        heading: "Cleaning is the same as metal braces",
        body: "Brush after every meal, use an interdental brush, floss daily, and rinse with fluoride mouthwash. Good hygiene is especially important with ceramic because any plaque shows more visibly against the light-coloured brackets.",
      },
      {
        heading: "Foods to avoid",
        body: "Same restrictions as metal braces. Hard and sticky foods that break or dislodge brackets. Ceramic brackets are slightly more likely to chip from hard impact than metal.",
      },
    ],
    bookingCta: "Book Ceramic Braces Consultation",
  },

  "Self-Ligating Braces": {
    name: "Self-Ligating Braces",
    tagline:
      "Modern brackets with a built-in sliding mechanism. No rubber bands, less friction, fewer appointments, and often faster results.",
    priceRange: { min: 80000, max: 150000 },
    priceNote:
      "Full treatment, both jaws. Fewer adjustment visits than traditional braces.",
    duration: "12 – 20 months",
    adjustmentFrequency: "Every 6 – 8 weeks",
    included: [
      "Initial consultation and X-rays",
      "Pre-treatment cleaning",
      "Self-ligating brackets and wires for full treatment",
      "Braces fitting appointment",
      "All adjustment visits for the full treatment duration",
      "Up to 2 emergency visits",
      "Braces removal",
      "One set of retainers after removal",
    ],
    excluded: [
      "Tooth extractions if required (KES 800 – 5,000)",
      "Replacement retainers (KES 5,000 – 10,000 each)",
    ],
    paymentMethods: ["M-Pesa", "Cash", "Card"],
    uptrontDiscount: 5,
    depositPercent: 30,
    stagedAvailable: true,
    stagedNote:
      "Staged treatment is available. Because overall treatment is shorter, the staged approach adds less extra time than with traditional braces.",
    timeline: [
      {
        phase: "Consultation and X-rays",
        duration: "60 min",
        detail:
          "Assessment to confirm self-ligating is suitable. Works best for moderate to complex cases.",
      },
      {
        phase: "Pre-treatment cleaning",
        duration: "45 min",
        detail: "Prepares teeth for bracket bonding.",
      },
      {
        phase: "Braces fitting",
        duration: "60 – 90 min",
        detail:
          "Self-ligating brackets are bonded. The archwire clips into each bracket without elastic ties.",
      },
      {
        phase: "Adjustments every 6 – 8 weeks",
        duration: "15 – 25 min each",
        detail:
          "The wire is changed or advanced. No tie replacement needed, so visits are quicker. Fewer total visits than traditional braces.",
      },
      {
        phase: "Removal and retainers",
        duration: "30 – 45 min",
        detail: "Brackets removed, teeth polished, retainers fitted.",
      },
    ],
    whatToExpect: [
      {
        heading: "Fewer appointments overall",
        body: "Because elastic ties are not used, adjustments are quicker and needed less often. A typical self-ligating treatment requires 8 – 12 visits compared to 18 – 24 for traditional braces. This is a significant advantage for patients with busy schedules.",
      },
      {
        heading: "Less friction means more comfortable movement",
        body: "The sliding mechanism reduces the friction on the wire as teeth move. Many patients report less soreness between adjustments compared to traditional braces, though soreness after fitting is similar.",
      },
      {
        heading: "Treatment can be faster",
        body: "For many cases, reduced friction allows teeth to move more efficiently. Treatment that might take 24 months with metal braces can sometimes be completed in 16 – 18 months with self-ligating.",
      },
    ],
    careAndLifestyle: [
      {
        heading: "Cleaning is easier without elastic ties",
        body: "Without rubber bands around each bracket, there are fewer places for food and plaque to hide. Standard cleaning applies — brush after meals, use an interdental brush, floss daily.",
      },
      {
        heading: "Food restrictions are the same",
        body: "Hard and sticky foods still risk breaking brackets. The same dietary rules apply as with traditional metal braces.",
      },
    ],
    bookingCta: "Book Self-Ligating Consultation",
  },

  "Clear Aligners": {
    name: "Clear Aligners",
    tagline:
      "Custom-made removable trays that straighten your teeth invisibly. No brackets, no wires, no food restrictions.",
    priceRange: { min: 150000, max: 350000 },
    priceNote:
      "Full treatment price includes all trays and check-in visits. Price varies with case complexity.",
    duration: "12 – 18 months",
    adjustmentFrequency: "New tray every 2 weeks, check-in every 6 – 8 weeks",
    included: [
      "Initial consultation, X-rays, and digital teeth scan",
      "Complete set of custom aligner trays for full treatment",
      "All check-in appointments",
      "Refinement trays if needed at treatment end",
      "One set of retainers after treatment",
    ],
    excluded: [
      "Tooth extractions if required",
      "Attachments (small tooth-coloured bumps bonded to teeth to help tray grip) — included for most cases",
      "Replacement trays if lost or damaged (KES 8,000 – 15,000 per tray)",
    ],
    paymentMethods: ["M-Pesa", "Cash", "Card"],
    uptrontDiscount: 5,
    depositPercent: 30,
    stagedAvailable: false,
    stagedNote:
      "Clear aligner treatment is designed as a complete system. Treating one arch at a time is not standard practice and may affect treatment outcome.",
    timeline: [
      {
        phase: "Consultation and digital scan",
        duration: "60 – 75 min",
        detail:
          "A digital scan or impressions are taken instead of traditional moulds. You may see a 3D simulation of your expected result before committing.",
      },
      {
        phase: "Tray fabrication",
        duration: "2 – 4 weeks waiting",
        detail:
          "Your custom trays are manufactured based on the digital scan. You receive the full set at your next appointment.",
      },
      {
        phase: "First fitting and instructions",
        duration: "45 min",
        detail:
          "Attachments are bonded if needed. You try your first tray and receive detailed instructions on wear and care.",
      },
      {
        phase: "Tray progression",
        duration: "Every 2 weeks",
        detail:
          "You change to the next tray yourself at home every two weeks. Each tray moves teeth slightly further toward the final position.",
      },
      {
        phase: "Check-in visits",
        duration: "20 – 30 min each",
        detail:
          "Every 6 – 8 weeks the doctor confirms progress and hands over the next batch of trays.",
      },
      {
        phase: "Refinements and retainers",
        duration: "30 – 45 min",
        detail:
          "A final scan checks the result. Refinement trays correct any remaining minor movements. Retainers are fitted at completion.",
      },
    ],
    whatToExpect: [
      {
        heading: "Must wear 20 – 22 hours per day",
        body: "This is the most critical rule. Aligners only work when they are in your mouth. Remove them only to eat, drink anything other than water, and to brush and clean the trays. Wearing them less than 20 hours per day will delay your treatment and compromise the result.",
      },
      {
        heading: "No food restrictions",
        body: "Because aligners are removable, you can eat whatever you like. Remove the tray before eating, eat normally, brush your teeth, and put the tray back in. This is the biggest lifestyle advantage over fixed braces.",
      },
      {
        heading: "Mild pressure with each new tray",
        body: "Switching to a new tray causes 1 – 2 days of mild tightness. This is much less intense than the soreness from bracket adjustments. Most patients find it very manageable.",
      },
      {
        heading: "Discipline determines the outcome",
        body: "Clear aligners require more self-discipline than fixed braces. With metal braces the movement happens regardless. With aligners, if you leave them out too often, your teeth will not move on schedule and your treatment will take longer.",
      },
      {
        heading: "Trays can stain if not cared for",
        body: "Always remove aligners before drinking coffee, tea, or anything coloured. Drinking through a straw does not protect the tray. Stained trays look far more visible than clear ones.",
      },
    ],
    careAndLifestyle: [
      {
        heading: "Cleaning your aligners",
        body: "Rinse trays with cold water every time you remove them. Clean with a soft toothbrush and clear (uncoloured) soap or aligner cleaning crystals. Never use hot water — it warps the plastic. Never use toothpaste — it is abrasive and scratches the tray, making it look cloudy.",
      },
      {
        heading: "Store them safely",
        body: "Always put aligners in their case when not wearing them. Never wrap them in a tissue or leave them on a table — they get thrown away or damaged. Lost trays cost KES 8,000 – 15,000 to replace and delay treatment.",
      },
      {
        heading: "Brushing and flossing",
        body: "Brush and floss before putting trays back in after eating. Food and plaque trapped under the tray causes rapid decay. This is the most important hygiene rule for aligner patients.",
      },
    ],
    bookingCta: "Book Clear Aligners Consultation",
  },

  Retainers: {
    name: "Retainers",
    tagline:
      "The final and permanent step of your orthodontic journey. Retainers protect the investment you made in your smile.",
    priceRange: { min: 8000, max: 20000 },
    priceNote:
      "Per retainer, upper or lower. Both jaws recommended. Price depends on retainer type.",
    duration: "Fitting: 20 – 30 minutes. Wear: every night, indefinitely.",
    adjustmentFrequency: "Annual check recommended",
    included: [
      "Impression or scan for custom retainer fabrication",
      "Retainer fitting appointment",
      "Wear and care instructions",
      "One follow-up check within 4 weeks of fitting",
    ],
    excluded: [
      "Replacement retainers if lost or damaged (same price applies)",
      "Fixed (bonded) retainers if preferred (different pricing — ask at consultation)",
    ],
    paymentMethods: ["M-Pesa", "Cash", "Card"],
    uptrontDiscount: 0,
    depositPercent: 100,
    stagedAvailable: false,
    stagedNote: "",
    timeline: [
      {
        phase: "Impression or scan",
        duration: "15 min",
        detail:
          "Moulds or a digital scan of your teeth are taken immediately after braces removal while teeth are in their ideal position.",
      },
      {
        phase: "Retainer fabrication",
        duration: "1 – 2 weeks",
        detail:
          "Your custom retainer is made from a clear plastic material (Hawley wire retainers are also available on request).",
      },
      {
        phase: "Fitting",
        duration: "15 – 20 min",
        detail:
          "The retainer is checked for fit, adjusted if needed, and you receive detailed instructions on wear and cleaning.",
      },
      {
        phase: "Follow-up check",
        duration: "15 min",
        detail:
          "A check 4 weeks after fitting confirms the retainer is working correctly and teeth are stable.",
      },
    ],
    whatToExpect: [
      {
        heading: "Why retainers are non-negotiable",
        body: "Without a retainer, teeth begin shifting back toward their original positions within weeks of braces removal. This is not a flaw — it is biology. The bone and gum tissue around your teeth needs time to stabilise in the new position, and the retainer holds everything in place while that happens. Patients who skip retainers often need retreatment.",
      },
      {
        heading: "How long do you wear them",
        body: "Every night, permanently. In the first 6 months after braces removal teeth are most vulnerable to shifting, so some orthodontists recommend full-time wear initially. After that, nightly wear is sufficient. Think of it like the maintenance cost of your treatment.",
      },
      {
        heading: "Retainers are comfortable",
        body: "Most patients adapt to wearing retainers within a week. There is no soreness. You simply insert them before sleeping and remove them in the morning.",
      },
    ],
    careAndLifestyle: [
      {
        heading: "Cleaning your retainer",
        body: "Rinse with cold water every morning when you remove it. Clean with a soft toothbrush and clear soap once daily. Soak in a retainer cleaning tablet (available at pharmacies) once per week. Never use hot water or toothpaste.",
      },
      {
        heading: "Storage",
        body: "Always keep your retainer in its case when not in use. Most retainers are lost or damaged because they are left on tables, wrapped in tissues, or put in pockets. Replacement costs KES 8,000 – 20,000.",
      },
      {
        heading: "When to come back",
        body: "If your retainer cracks, warps, or starts to feel loose, contact the clinic immediately. A loose retainer is not holding your teeth. Annual check-ins are recommended to assess fit as minor natural tooth movement occurs over years.",
      },
    ],
    bookingCta: "Book Retainer Fitting",
  },
};

export const serviceOrder = [
  "Orthodontic Consultation",
  "Metal Braces",
  "Ceramic Braces",
  "Self-Ligating Braces",
  "Clear Aligners",
  "Retainers",
];
