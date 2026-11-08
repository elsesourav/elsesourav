# 🎮 Game & App Rating Integration Guide

> How to integrate the ElseSourav centralized rating system into any game or application.

---

## Overview

ElseSourav uses a **centralized rating system** where all feedback is managed through the main website's API. Individual games and apps do **not** need their own rating UI — they simply redirect users to the website.

### Key Principles

| Principle                | Description                                                                                                 |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| **One Account**          | All apps share the same Supabase auth — if a user is logged into the website, they're logged into every app |
| **One Review Per App**   | Each user can leave exactly one review per app (upsert pattern)                                             |
| **Centralized API**      | All feedback goes through `/api/apps/[slug]/feedback`                                                       |
| **No Duplicate Ratings** | If a user has already rated, the form shows "Update Review"                                                 |

---

## Integration Methods

### Method 1: Redirect Back (Recommended for Games)

The simplest approach — after a play session, redirect the user to the app's detail page:

```javascript
// In your game's "Thanks for playing" screen or exit menu
const appSlug = 'your-game-slug'; // e.g., 'quantum-chess', 'pixel-builder'
const ratingUrl = `https://elsesourav.com/apps/${appSlug}`;

// Option A: Simple redirect
window.location.href = ratingUrl;

// Option B: Open in new tab
window.open(ratingUrl, '_blank');
```

The website handles everything — authentication check, existing review detection, and the rating form.

### Method 2: Same-Domain Iframe/Embedded

If your game is hosted on `elsesourav.com` (e.g., `/apps/[slug]/play`), the auth cookies are shared automatically. You can call the API directly:

```javascript
// Check if user has already rated
const res = await fetch(`/api/apps/${slug}/feedback`);
const data = await res.json();

if (data.userFeedback) {
  console.log('User already rated:', data.userFeedback.rating);
  // Don't show rating prompt
} else {
  // Show your custom "Rate this game" prompt
}

// Submit a rating
const submitRes = await fetch(`/api/apps/${slug}/feedback`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rating: 5, // 1-5 integer
    message: 'Amazing!', // optional, max 1000 chars
  }),
});
```

### Method 3: Post-Play Modal (for Embedded Web Apps)

If your game runs in an iframe on the app detail page, communicate with the parent using `postMessage`:

```javascript
// Inside the game iframe — trigger rating modal on parent
window.parent.postMessage({ type: 'SHOW_RATING', slug: 'your-game-slug' }, '*');
```

```javascript
// In the parent page — listen for the message
window.addEventListener('message', (event) => {
  if (event.data?.type === 'SHOW_RATING') {
    // Scroll to the rating section or open a modal
    document.getElementById('feedback-heading')?.scrollIntoView({ behavior: 'smooth' });
  }
});
```

---

## API Reference

### `GET /api/apps/[slug]/feedback`

Returns paginated reviews and the current user's own review.

**Query Parameters:**

| Param   | Type   | Default  | Description                             |
| ------- | ------ | -------- | --------------------------------------- |
| `page`  | number | 1        | Page number                             |
| `limit` | number | 10       | Reviews per page (max 50)               |
| `sort`  | string | `newest` | `newest`, `oldest`, `highest`, `lowest` |

**Response:**

```json
{
  "items": [
    {
      "id": "uuid",
      "userId": "uuid",
      "appId": "uuid",
      "rating": 5,
      "message": "Great game!",
      "status": "approved",
      "createdAt": 1696339200000,
      "updatedAt": 1696339200000,
      "user": {
        "displayName": "Sourav",
        "photoUrl": "/avatars/avatar-1.svg",
        "username": "sourav"
      }
    }
  ],
  "summary": {
    "averageRating": 4.5,
    "totalCount": 12,
    "distribution": { "1": 0, "2": 1, "3": 2, "4": 3, "5": 6 }
  },
  "userFeedback": null,
  "page": 1,
  "totalPages": 2,
  "hasMore": true
}
```

### `POST /api/apps/[slug]/feedback` (Authenticated)

Submit or update a review.

**Request Body:**

```json
{
  "rating": 4,
  "message": "Fun to play!"
}
```

**Rules:**

- `rating` is required (1–5 integer)
- `message` is optional (max 1000 characters)
- If the user already rated, their existing review is **updated**
- Rate limited: 10 requests per minute

### `DELETE /api/apps/[slug]/feedback` (Authenticated)

Deletes the current user's own review.

---

## Implementation Checklist for New Games

1. ✅ Know your app's `slug` (find it in the admin panel or URL)
2. ✅ Choose an integration method (redirect is easiest)
3. ✅ Add a "Rate This Game" button in your exit/completion screen
4. ✅ Link to `https://elsesourav.com/apps/[your-slug]`
5. ✅ The website handles the rest automatically

---

## FAQ

**Q: What if the user isn't logged in?**
A: The feedback section shows a "Sign In" button that redirects to login. After signing in, they can rate.

**Q: Can a user rate the same app twice?**
A: No. The system uses an upsert — submitting again updates their existing review.

**Q: How is the average calculated?**
A: Aggregated in a database transaction every time a review is submitted/deleted. Stored in `AppStat.ratingAverage`.

**Q: Do I need to add anything to my game's database?**
A: No. All feedback is stored centrally. Your game only needs to know its `slug`.
