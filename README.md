# Deal or No Deal Game

This repository contains a self-contained React component that recreates the television game show **Deal or No Deal**. The component implements game logic, tracks offers and winnings, and includes sound effects with the Tone.js audio library. Styling uses Tailwind CSS utility classes.

## Project Purpose

The goal of this project is to provide a simple example of how to implement the Deal or No Deal game mechanics in React. You can integrate the component in your own React application or experiment with the game logic and user interface.

## Installation

Make sure you have Node.js and npm installed. Clone the repository and install dependencies:

```bash
npm install
```

If you are using this component inside another React project, you may also need to install the Tone.js dependency separately:

```bash
npm install tone
```

## Running the App

This repository now includes a small Vite setup so you can play the game without integrating it elsewhere. After installing dependencies, run the development server:

```bash
npm install
npm start
```

Then open your browser to the address printed in the console (typically [http://localhost:5173](http://localhost:5173)).

## Tests

This project includes a small Jest test suite. Run `npm test` to execute the tests.
## Special Considerations

Sound effects are produced using the Tone.js library. Most browsers block audio playback until the user interacts with the page, so click anywhere on the page to enable sound. Make sure your device is not muted if you want to hear the effects.
