/**
 * Post-build script to generate page-specific HTML files with SEO meta tags.
 *
 * This script runs after vite build and creates separate HTML files for each route
 * with the correct meta tags, solving the SPA SEO problem without requiring SSR.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');

// Page-specific SEO configurations
const pages = {
  '/': {
    title: 'Lacrosse Scoreboard Online | Free Score Keeper with Real-Time Sync',
    description: 'Free online lacrosse scoreboard with real-time sync. NCAA, PLL, NFHS rule presets. Shot clock, penalty timers, player stats, and OBS streaming overlay.',
    canonical: 'https://www.lacrossescoreboard.com/',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Lacrosse Scoreboard Online",
      "description": "Free online lacrosse scoreboard with real-time sync. NCAA, NFHS, NLL, PLL rule presets. Shot clock, penalty timers, and live remote viewing.",
      "url": "https://www.lacrossescoreboard.com",
      "applicationCategory": "SportsApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Real-time game sync",
        "NCAA Men's lacrosse rules",
        "NCAA Women's lacrosse rules",
        "NFHS Boys lacrosse rules",
        "NLL Box lacrosse rules",
        "PLL lacrosse rules",
        "Shot clock timer",
        "Penalty box management",
        "Power play indicators",
        "QR code room sharing",
        "Mobile responsive",
        "Offline PWA support"
      ]
    }
  },
  '/rules': {
    title: 'Lacrosse Rules Guide | Game Format, Penalties & Equipment',
    description: 'Complete guide to lacrosse rules including game format, penalties, equipment regulations. NCAA, PLL, high school, and youth lacrosse rules explained.',
    canonical: 'https://www.lacrossescoreboard.com/rules',
  },
  '/tutorial': {
    title: 'How to Use Lacrosse Scoreboard | Tutorial & Quick Start Guide',
    description: 'Step-by-step tutorial on how to use the free online lacrosse scoreboard. Learn scoring, timer controls, penalty tracking, stats, and OBS streaming setup.',
    canonical: 'https://www.lacrossescoreboard.com/tutorial',
  },
  '/faq': {
    title: 'Lacrosse Scoreboard FAQ | Common Questions Answered',
    description: 'Frequently asked questions about our free lacrosse scoreboard. Learn about features, keyboard shortcuts, OBS streaming, offline support, and more.',
    canonical: 'https://www.lacrossescoreboard.com/faq',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is this scoreboard really free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, 100% free! No ads, no subscriptions, no hidden fees. The app is open source and will always remain free."
          }
        },
        {
          "@type": "Question",
          "name": "Do I need to create an account?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No account required. Just open the app and start scoring. Your game data is saved locally in your browser."
          }
        },
        {
          "@type": "Question",
          "name": "What lacrosse rules are supported?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We support NCAA (men's and women's), PLL/MLL professional, high school (NFHS), and youth lacrosse rules. Each preset automatically configures quarter length, shot clock, and penalty options."
          }
        },
        {
          "@type": "Question",
          "name": "Can I use this for youth or recreational leagues?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely! You can customize the rules or use the Youth preset to set your own quarter lengths, shot clock times, and penalty options."
          }
        },
        {
          "@type": "Question",
          "name": "How do keyboard shortcuts work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Press H for home goals, A for away goals, Space to start/stop timer, R for shot clock reset, U to undo. Press ? to see all shortcuts."
          }
        },
        {
          "@type": "Question",
          "name": "Can I track individual player statistics?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! Click the Players button to add players to each team. You can then track goals, assists, and ground balls per player."
          }
        },
        {
          "@type": "Question",
          "name": "How do penalties work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Click +PENALTY to add a penalty. Enter the player number, select the duration (30 sec, 1 min, 2 min, 3 min), and add an optional description. The penalty timer counts down automatically."
          }
        },
        {
          "@type": "Question",
          "name": "Does it work offline?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! This is a PWA (Progressive Web App) that works fully offline. Install it on your device for the best experience - it will work even with no internet."
          }
        },
        {
          "@type": "Question",
          "name": "How do I add the scoreboard to OBS?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Click the OBS button to open the overlay page, or go to /obs. In OBS, add a Browser Source and paste the URL. The overlay has a transparent background."
          }
        },
        {
          "@type": "Question",
          "name": "Does the OBS overlay update in real-time?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! Any changes you make on the main scoreboard are instantly reflected in the OBS overlay. If you're using the sync feature, the overlay updates from the shared room."
          }
        }
      ]
    }
  }
};

function generateMetaTags(config) {
  const ogImage = 'https://www.lacrossescoreboard.com/og-image.png';

  let tags = `
    <!-- Primary Meta Tags -->
    <title>${config.title}</title>
    <meta name="title" content="${config.title}" />
    <meta name="description" content="${config.description}" />
    <link rel="canonical" href="${config.canonical}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${config.canonical}" />
    <meta property="og:title" content="${config.title}" />
    <meta property="og:description" content="${config.description}" />
    <meta property="og:image" content="${ogImage}" />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${config.canonical}" />
    <meta property="twitter:title" content="${config.title}" />
    <meta property="twitter:description" content="${config.description}" />
    <meta property="twitter:image" content="${ogImage}" />`;

  if (config.structuredData) {
    tags += `

    <!-- Structured Data -->
    <script type="application/ld+json">
${JSON.stringify(config.structuredData, null, 2)}
    </script>`;
  }

  return tags;
}

function generatePageHtml(baseHtml, config) {
  const metaTags = generateMetaTags(config);

  // Insert meta tags after the PWA section comment or before </head>
  // Look for the comment "<!-- SEO meta tags are injected..."
  let modifiedHtml = baseHtml.replace(
    /<!-- SEO meta tags are injected[^>]*-->/,
    metaTags
  );

  // If the comment wasn't found, insert before </head>
  if (modifiedHtml === baseHtml) {
    modifiedHtml = baseHtml.replace('</head>', `${metaTags}\n  </head>`);
  }

  return modifiedHtml;
}

async function main() {
  console.log('Generating page-specific HTML files...\n');

  // Read the base index.html from dist
  const baseHtmlPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(baseHtmlPath)) {
    console.error('Error: dist/index.html not found. Run vite build first.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8');

  for (const [route, config] of Object.entries(pages)) {
    const pageHtml = generatePageHtml(baseHtml, config);

    if (route === '/') {
      // Overwrite the root index.html
      fs.writeFileSync(baseHtmlPath, pageHtml);
      console.log(`  ✓ /index.html (home page)`);
    } else {
      // Create subdirectory and index.html for other routes
      const routeDir = path.join(distDir, route.slice(1));
      if (!fs.existsSync(routeDir)) {
        fs.mkdirSync(routeDir, { recursive: true });
      }
      const routeHtmlPath = path.join(routeDir, 'index.html');
      fs.writeFileSync(routeHtmlPath, pageHtml);
      console.log(`  ✓ ${route}/index.html`);
    }
  }

  console.log('\nDone! All page-specific HTML files generated.');
}

main();
