export type AboutImage = {
  src: string;
  alt: string;
  desc: string;
  width: number;
  height: number;
};

export const aboutContent = {
  hero: {
    src: "/textures/simon_calling.webp",
    alt: "Sai seated at a table in a warm, grainy portrait.",
    desc: "Sai hero portrait",
    width: 1920,
    height: 1920,
  },

  stats: [
    { num: "15+", label: "patents in deep tech" },
    { num: "4", label: "exits & acquisitions" },
    { num: "2×", label: "Stanford GSB" },
    { num: "12+", label: "years building" },
  ],

  film: [
    {
      src: "/about/film/01.png",
      label: "Bangalore 2014",
      alt: "Sai in an early startup garage moment in Bangalore with laptop and cables.",
      desc: "Sai photo - Bangalore 2014",
      width: 800,
      height: 1000,
    },
    {
      src: "/about/film/02.png",
      label: "Scapic 2016",
      alt: "Sai holding an AR or VR headset at a demo booth.",
      desc: "Sai photo - Scapic 2016",
      width: 800,
      height: 1000,
    },
    {
      src: "/about/film/03.png",
      label: "Stanford Business",
      alt: "Stanford Business logo centered on a solid red background.",
      desc: "Stanford Business logo centered on red",
      width: 800,
      height: 1000,
    },
    {
      src: "/about/film/04.png",
      label: "Walmart acquisition 2020",
      alt: "Sai in a composed enterprise office moment after the Walmart acquisition.",
      desc: "Sai photo - Walmart acquisition 2020",
      width: 800,
      height: 1000,
    },
    {
      src: "/about/film/05.png",
      label: "Building again 2022",
      alt: "Sai working late at a desk under a warm lamp.",
      desc: "Sai photo - Building again 2022",
      width: 800,
      height: 1000,
    },
    {
      src: "/about/film/06.png",
      label: "House of Models 2023",
      alt: "Sai in a photo studio with product set and lights.",
      desc: "Sai photo - House of Models 2023",
      width: 800,
      height: 1000,
    },
    {
      src: "/about/film/07.png",
      label: "ShopOS 2025",
      alt: "Sai focused at a desk with AI dashboards and monitors.",
      desc: "Sai photo - ShopOS 2025",
      width: 800,
      height: 1000,
    },
    {
      src: "/about/film/08.png",
      label: "SeeIt 2025",
      alt: "Sai inspecting smart glasses at a hardware bench.",
      desc: "Sai photo - SeeIt 2025",
      width: 800,
      height: 1000,
    },
    {
      src: "/about/film/09.png",
      label: "Dubai 2025",
      alt: "Sai on a rooftop with the Dubai skyline at dusk.",
      desc: "Sai photo - Dubai 2025",
      width: 800,
      height: 1000,
    },
    {
      src: "/about/film/10.png",
      label: "What's next 2026",
      alt: "Sai looking toward an open horizon.",
      desc: "Sai photo - What's next 2026",
      width: 800,
      height: 1000,
    },
  ],

  journey: [
    {
      title: "Scapic",
      kicker: "Bangalore / mobile AR",
      image: {
        src: "/about/bio-scapic.jpg",
        alt: "Holographic AR product visualization floating above concrete.",
        desc: "Scapic AR visualization",
        width: 1200,
        height: 800,
      },
      paragraphs: [
        "I started in Bangalore in 2014, building in the early days of mobile AR. No playbook. No comparable companies to reference. A lot of wrong turns.",
        "Scapic was the first company that got real traction. We built a no-code platform for creating AR and VR experiences, 300,000+ experiences, 50+ awards including the National Startup Awards and Facebook India Awards. When the pandemic hit and e-commerce moved everything online, we pivoted to AR commerce: product visualization, try-before-you-buy, camera-based shopping. Brands running on Scapic saw 94% higher purchase intent and 30% conversion lifts. Flipkart acquired the company to build Flipkart Camera, at the time, the largest AR commerce platform in the world.",
      ],
    },
    {
      title: "Flipkart",
      kicker: "Enterprise scale",
      image: {
        src: "/about/bio-flipkart.jpg",
        alt: "Vast enterprise operations space with cool light and warm concrete.",
        desc: "Flipkart scale",
        width: 1200,
        height: 800,
      },
      paragraphs: [
        "Two years at Flipkart running Flipkart Camera and then Flipkart Labs (EVs, drones, emerging tech). Enterprise scale. Hundreds of millions of users. Understood fast what I wanted and didn't want from a working environment.",
      ],
    },
    {
      title: "Cope + Reality",
      kicker: "Back to zero",
      image: {
        src: "/about/bio-reality.jpg",
        alt: "Sketches, prototypes, and a laptop on a concrete workbench.",
        desc: "Cope and Reality Tools",
        width: 1200,
        height: 800,
      },
      paragraphs: [
        "Left to build again. Cope.Studio (acquired by Polygon) and Reality Tools (acquired by MotionPage) both came out of that period.",
      ],
    },
    {
      title: "ShopOS + SeeIt",
      kicker: "Current bets",
      image: {
        src: "/about/bio-current.jpg",
        alt: "AI commerce dashboards beside open-source smart glasses hardware.",
        desc: "ShopOS and SeeIt",
        width: 1200,
        height: 800,
      },
      paragraphs: [
        "ShopOS and SeeIt are the current bets.",
        "ShopOS applies AI agents to commerce operations, the repetitive, high-volume work that D2C brands pay agencies and contractors to do, badly and expensively. SeeIt applies edge AI to wearables, specifically the form factor that Scapic always pointed toward but could never reach from a browser.",
        "Twelve years in. Still the most interesting time to be building.",
      ],
    },
  ],

  locationLine: "Dubai ↔ Bangalore ↔ San Francisco ↔ Coimbatore",
  credential: "Stanford GSB, twice over.",

  interests: {
    title: "Outside of building.",
    items: [
      {
        icon: "C",
        label: "Cricket",
        line: "Test match cricket specifically. The long game.",
        image: {
          src: "/about/interest-cricket.jpg",
          alt: "Worn red test-match cricket ball on concrete.",
          desc: "cricket",
          width: 600,
          height: 600,
        },
      },
      {
        icon: "V8",
        label: "Cars",
        line: "How engines work. What they ask of the driver.",
        image: {
          src: "/about/interest-cars.jpg",
          alt: "Close detail of a precision engine or gearshift.",
          desc: "cars",
          width: 600,
          height: 600,
        },
      },
      {
        icon: "AR",
        label: "Augmented Reality glasses",
        line: "Have been since before they were cool. Still are.",
        image: {
          src: "/about/interest-ar.jpg",
          alt: "Minimalist augmented reality glasses on concrete.",
          desc: "AR glasses",
          width: 600,
          height: 600,
        },
      },
      {
        icon: "OM",
        label: "Temple visits",
        line: "Consistent practice. Not performance.",
        image: {
          src: "/about/interest-temple.jpg",
          alt: "Small brass oil lamp glowing warmly.",
          desc: "temple visits",
          width: 600,
          height: 600,
        },
      },
      {
        icon: "01",
        label: "Journaling",
        line: "Writing by hand. Ideas stick differently.",
        image: {
          src: "/about/interest-journaling.jpg",
          alt: "Open handwritten journal and fountain pen on concrete.",
          desc: "journaling",
          width: 600,
          height: 600,
        },
      },
      {
        icon: "SV",
        label: "Vedic philosophy",
        line: "Practical frameworks. Not abstract spirituality.",
        image: {
          src: "/about/interest-vedic.jpg",
          alt: "Aged palm-leaf manuscript detail.",
          desc: "Vedic philosophy",
          width: 600,
          height: 600,
        },
      },
    ],
  },

  spuddish: {
    title: "I invest via Spuddish.",
    subtitle: "A deep tech seed-stage fund.",
    image: {
      src: "/about/spuddish.jpg",
      alt: "Two founders working over a laptop and sticky-note wall.",
      desc: "Spuddish founders",
      width: 1200,
      height: 800,
    },
    body: [
      "The goal is simple: work closely with founders and have fun doing it.",
      "I don't write cheques and disappear. The work I find useful is being in the problem with the team, product architecture, GTM strategy, thinking through a pivot at 1am, being honest when something isn't working.",
      "Focus: deep tech, AI, spatial computing, commerce infrastructure. Especially interested in founders building in India. The talent density is there. The capital and network often isn't. That's the gap I can help close.",
    ],
    tags: ["Seed stage", "Deep tech", "Hands-on", "India focus"],
    ctaLabel: "Reach out: sai@shopos.ai",
    ctaHref: "mailto:sai@shopos.ai",
  },

  howIWork: {
    title: "How I work.",
    framing:
      "This is the short version. The full version is a Notion doc I share with every new team member. The short version is what you need to know before we work together.",
    cards: [
      {
        title: "Hire for giving a shit.",
        body: "Everything else can be learned. I've hired people with wrong skills who became critical team members. I've hired people with right skills who left the moment the problem got hard. One filter: do they care about the work and about scale?",
      },
      {
        title: "Short cycles.",
        body: "Weeks not quarters. Days not weeks where possible. I'd rather ship a 70% version and learn than wait for a 95% version nobody uses. Budget makes people lazy. Constraints force the right decisions.",
      },
      {
        title: "No corporate language.",
        body: "Write like you talk. If you can't explain it simply, you don't understand it. I will ask you to rewrite things. Not because the prose is bad. Because the thinking isn't done yet.",
      },
      {
        title: "Serious work, not seriously.",
        body: "The work matters. The atmosphere doesn't have to be grave. The best teams I've been on were also the most fun ones. That's not a coincidence.",
      },
    ],
  },

  closing: {
    image: {
      src: "/about/closing.jpg",
      alt: "Architectural concrete corridor receding toward warm light.",
      desc: "closing corridor",
      width: 1920,
      height: 800,
    },
    locationLine: "Dubai ↔ Bangalore ↔ San Francisco ↔ Coimbatore",
    ctaEmail: "sai@shopos.ai",
  },
} as const;
