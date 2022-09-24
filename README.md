# FIA Formula penalties

An app built for Formula series fans who do not feel like going through news articles or downloading FIA documents to find out what penalties were given to their favorite drivers.

## Table of contents

- [Github & Live](#github--live)
- [Getting Started](#getting-started)
- [React](#react)
- [Deploy](#deploy)
- [Features](#features)
- [Status](#status)
- [Contact](#contact)

# Github & Live

Github repo can be found [here](https://github.com/gizinski-jacek/fia-decisions).

Live demo can be found on [Vercel](https://fia-penalties.vercel.app).

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

Install all dependancies by running:

```bash
npm install
```

In the project root directory run the app with:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Features

- Automatic documents updating directly from FIA site with cron job
- Support for all three Formula series
- Grouping penalties by race weekend
- Displaying essential information, with more available in modal form
- Current race calendar for Formula One with track wiki links and highlighted upcoming race
- Contact forms to:
  - Upload PDF file of a missing penalty
  - Send bare minimum information about missing penalty
  - Contact site owner about any other issue
- Responsive and adjustable UI
- Built with RWD in mind

## Status

Project status: **_MOSTLY FINISHED_**

## Contact

Feel free to contact me at:

```
gizinski.jacek.tr@gmail.com
```
