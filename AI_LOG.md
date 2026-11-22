# AI Usage Log

## Overview

AI tools were used during the development of the Visitor Photo Slideshow project to understand existing code, implement features, debug errors, improve the user interface, and prepare project documentation.

AI suggestions were treated as guidance rather than automatically accepted solutions. Changes were tested in the application, and incorrect or incomplete suggestions were corrected through code inspection and debugging.

## Key AI Interactions

### 1. Understanding Existing React Code

**Prompt / Interaction:** Asked AI to explain the existing React components and their code step by step.

**AI Contribution:** Explained React hooks such as `useState` and `useEffect`, component props, API requests using Axios, and conditional rendering.

**Verification:** Followed the explanations while examining the existing application code and checking its behaviour.

**Outcome:** Improved understanding of the frontend implementation.

### 2. Improving the Community Gallery Layout

**Prompt / Interaction:** Asked for a cleaner way to arrange community photographs with less scrolling while keeping each photograph clearly visible.

**AI Contribution:** Suggested adjusting the photo layout and reducing unnecessary visual elements.

**Verification:** Applied the changes and checked the gallery in the browser.

**Outcome:** Improved the gallery presentation while retaining individual photo visibility.

### 3. Debugging the Selected Photo in the Gallery

**Prompt / Interaction:** Reported that clicking a photograph opened the first photograph instead of the selected one.

**AI Contribution:** Helped investigate the photo-selection and display logic.

**Verification:** Tested the corrected behaviour by clicking different photographs.

**Outcome:** The selected photograph opened correctly.

### 4. AI Mistake: Incorrect Button Placement

**Prompt / Interaction:** Asked AI to add a Community Photo Gallery navigation button to the Shared Slideshow page.

**What AI Got Wrong:** The initial implementation guidance did not clearly distinguish the normal slideshow return from the loading-state return. The button was initially added to the loading screen instead of the normal slideshow screen.

**How the Mistake Was Identified:** The button did not appear when the slideshow was displayed. The component code was inspected, revealing that the button was inside the `if (loading)` condition.

**Correction:** Moved the Gallery button into the normal slideshow return, alongside the Back to Dashboard button.

**Verification:** Refreshed the application and confirmed that the button appeared in the correct location.

### 5. AI Mistake: Incomplete Navigation Logic

**Prompt / Interaction:** Reported that the Community Photo Gallery button appeared but did not navigate to the gallery.

**What AI Got Wrong:** The first navigation callback only changed `showGallery` to `true`. It did not reset `showSlideshow` to `false`.

**How the Mistake Was Identified:** Tested the button in the browser and observed that the slideshow remained visible.

**Correction:** Updated the callback in `App.jsx` to change both states:

- Set `showSlideshow` to `false`.
- Set `showGallery` to `true`.

**Verification:** Clicked the Gallery button again and confirmed that the Community Photo Gallery opened correctly.

### 6. Improving Navigation Button Appearance

**Prompt / Interaction:** Asked to make the Community Photo Gallery button match the Back to Dashboard button.

**AI Contribution:** Suggested matching the background and border colours.

**Verification:** Refreshed the slideshow and visually compared both buttons.

**Outcome:** Both navigation buttons used matching blue backgrounds and cream borders.

## Lessons Learned

- AI-generated code should always be checked before implementation.
- Understanding the existing component structure is important before modifying JSX.
- React state changes must be considered together when multiple conditional views are involved.
- Browser testing helps identify problems that may not be obvious from reading code.
- AI can accelerate development, but the developer must verify the final result.
