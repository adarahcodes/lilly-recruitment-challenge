# Lilly Technical Challenge Documentation Template

*This documentation template serves as a place for you to discuss how you approached this challenge, any issues you faced & how you overcame them, or any other points that you feel would be relevant for the interviewers to know. The text in italics is here to guide you - feel free to remove it once you fill out each section!*

***Not every section in this document is required. This is just a template to help get you started. Feel free to add or remove sections as you feel necessary.***

## Approach
*How did you approach this challenge? Did you work through the objectives in any particular order? If so, why? Did you utilize any external resources, such as tutorials, guides, or other materials?*
I went in a chronological order, doing HTML,CSS first and then moving on to JavaScript. Using the HTML and CSS to make a wireframe of what i want the the webpage to look like and then moving on to the dynamic functionalities.
my JavaScript is still a work in progress in terms of skills as we are covering it within university and outside of university so I did frequent some resources such as w3schools as well as stack overflow if I were to look at specific functionalities that I could've added to the project (although I opted to keep it simple)
Python being my strong suit among the four languages I did spend quite a long time trying to tweak it, especially to get the average sum of the medicines on the website however I did not get that completed 
I didn't use video tutorials because I wanted to try make this as accurate to myself as I could however the lines may be slightly blurred with use of other external resources

## Objectives - Innovative Solutions
*For the challenge objectives, did you do anything in a particular way that you want to discuss? Is there anything you're particularly proud of that you want to highlight? Did you attempt some objectives multiple times, or go back and re-write particular sections of code? If so, why? Use this space to document any key points you'd like to tell us about.* 
I approached the objectives iteratively and intentionally kept the solution simple and easy to understand. I started with a clear static layout (HTML/CSS), then moved to JavaScript for interactivity, and finished with a small, file-backed FastAPI backend to keep the project beginner-friendly and easy to run.

Highlights:
- Focused on clarity: rewrote portions of the frontend and backend to remove accidental duplication and make DOM interactions robust.
- Pragmatic refactors: earlier iterations served as prototypes; I consolidated those into a single, maintainable implementation rather than layering complexity on top of the original code.
- Resilient data handling: the backend average calculation ignores null and non-numeric values and attempts safe numeric coercion so the UI never crashes when data is missing.
- Usability: added a simple edit/delete UI on the frontend and kept the overall interactions form-based and straightforward so reviewers can quickly verify functionality.

Overall, I rewrote sections when it made the code clearer or removed bugs (duplicate handlers, stray content). That tradeoff improved reliability and kept the final project easy to reason about for an interviewer or reviewer.

## Problems Faced
*Use this space to document and discuss any issues you faced while undertaking this challenge and how you solved them. We recommend doing this proactively as you experience and resolve the issues - make sure you don't forget! (Screenshots are helpful, though not required)*

During development I ran into a few small but important issues:

- Duplicate or stray content: early versions contained duplicated HTML and JavaScript blocks (and a few stray markdown fences). Those caused runtime errors and unpredictable DOM behaviour, so I removed the duplicates and consolidated the JS into a single, reliable `DOMContentLoaded` handler.
- Backend not running reliably: the provided `start.sh` sometimes failed in my environment (Exit Code 127), which made the frontend show "Average: N/A" because the API was unreachable. I documented alternative run steps (`python backend/main.py` or `uvicorn backend.main:app`) to help reviewers reproduce the app.
- Data robustness: the dataset included `null` values and non-numeric price strings. To prevent UI crashes I updated the backend average calculation to ignore `null` and non-numeric values and to attempt safe numeric coercion where appropriate.

How I solved them:

- Cleaned the frontend: removed duplicated markup, simplified event handlers, and added safer fetch/error handling so missing APIs fail gracefully.
- Hardened the backend: added simple read/write helpers for `data.json`, created clear CRUD endpoints (this was Googled), and made the average endpoint resilient to bad data.

These fixes kept the project simple and reliable while making the core functionality (list, add, edit, delete, average) easy to verify.
Although the average 



## Evaluation
*How did you feel about the challenge overall? Did some parts go better than others? Did you run out of time? If you were to do this again, and were given more time, what would you do differently?*
I definitely enjoyed this challenge, it came at a time where my focus in university is web page development so it pushed me to use what i know and taught me stuff that i am going to be using next semester. If I could do this again I would definitely want to come in more prepared, i spent a lot of time trying to figure out how I would do things rather than just doing them purely because my prioirty was making something functional and something that looked nice. In the end i would say i'm quite happy with how it went.