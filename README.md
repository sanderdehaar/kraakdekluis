# Kraak de Kluis

"Kraak de Kluis" (Crack the Safe) is an interactive promotional web application developed for a collaboration between Fanta and the Dutch YouTube channel StukTV. This project creates an engaging game where users scan QR codes found on products or at specific locations to unlock clues, discover virtual prize vaults, and claim rewards.

## Features

*   **Interactive QR Code Game**: Users can scan QR codes via their device's camera or upload an image to participate.
*   **Dynamic Game Logic**: The outcome of a scan (win, fail, or clue) is determined by data fetched in real-time from a Firebase Firestore database.
*   **Prize Claim System**: Winners can enter their contact details to claim their prize. The system uses EmailJS to send confirmation and notification emails.
*   **Interactive Vault Map**: A map page, built with `react-simple-maps`, displays the locations of all virtual vaults across the Netherlands, marking which ones have been "cracked".
*   **Retro CRT Interface**: The UI features a vintage computer terminal and CRT television effect, complete with scan lines, flicker, and a mouse-responsive 3D tilt.
*   **Backend Management Scripts**: Includes Node.js scripts to programmatically generate QR code images and to seed the Firebase database with vault, can, and prize data.

## Tech Stack

*   **Frontend**: React, TypeScript, Vite, Tailwind CSS
*   **Backend & Database**: Firebase (Firestore)
*   **QR Code Processing**: `jsqr` (decoding), `qrcode` (generation)
*   **Mapping**: `react-simple-maps`, `topojson-client`
*   **Email Notifications**: EmailJS
*   **Deployment**: Vercel

## Project Structure

*   `/public`: Static assets like images, fonts, and generated QR codes.
*   `/src/pages`: Contains the main page components for the application: `LandingPage`, `PrizeVaultPage`, and `VaultLocationsPage`.
*   `/src/components`: Reusable UI components, organized by function (buttons, feedback modals, layout).
*   `/src/firebase.ts`: Firebase initialization and configuration.
*   `/src/hooks`: Custom React hooks for functionality like the 3D mouse tilt (`useMouseTilt`) and random UI effects (`useRandomSignal`).
*   `/src/data`: JSON files defining the structure and initial data for QR codes and prizes, used by the seeding script.
*   `/scripts`: Contains Node.js helper scripts for administrative tasks.

## Getting Started

### Prerequisites

*   Node.js and npm
*   A Firebase project
*   An EmailJS account

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/sanderdehaar/kraakdekluis.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd kraakdekluis
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Configuration

Create a `.env` file in the root of the project and add your Firebase and EmailJS credentials:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

### Database Seeding

The `scripts/seedFirebase.mjs` script contains a hardcoded Firebase configuration. To seed your own database, replace the `firebaseConfig` object in the script with your project's credentials.

Once configured, run the script to populate your Firestore database with the data from the `/src/data` directory:
```bash
node scripts/seedFirebase.mjs
```
You can use the `--reset-claims` flag to overwrite existing `claimed` statuses on the QR code documents.

### Generate QR Codes

To generate the QR code images for the game, run the following script. You can update the `BASE_URL` in `scripts/generateQRs.cjs` to point to your development server (e.g., `http://localhost:5173/crack`).

```bash
npm run generate:qrs
```
The generated QR codes will be saved in the `/public/qr` directory.

### Running the Application

```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

## Available Scripts

*   `npm run dev`: Starts the application in development mode with hot-reloading.
*   `npm run build`: Compiles TypeScript and builds the application for production.
*   `npm run lint`: Runs the Oxc linter to check for code quality issues.
*   `npm run preview`: Serves the production build locally to preview the final app.
*   `npm run generate:qrs`: Executes the script to generate QR code image files.
