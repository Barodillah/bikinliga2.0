# Notification System Plan

## 1. Notification Types & Triggers

Based on the code analysis, here are the proposed notification types:

### Tournament System
| Event | Trigger | Recipient | Type Code |
| :--- | :--- | :--- | :--- |
| **Join Request** | User requests to join a private tournament | Tournament Organizer | `tournament_join_request` |
| **Join Approved** | Organizer approves participant | Participant (User) | `tournament_join_approved` |
| **Join Rejected** | Organizer rejects participant | Participant (User) | `tournament_join_rejected` |
| **Tournament Start** | Tournament status changes to 'active' | All Participants | `tournament_started` |
| **Match Scheduled** | Match is created/scheduled | Home & Away Participants | `match_scheduled` |
| **Match Result** | Match is completed | Home & Away Participants | `match_completed` |
| **Tournament Invite** | User invited to a tournament | User | `tournament_invite` |
| **Tournament News** | Organizer publishes news/announcement | All Participants | `tournament_news` |

### Social (Community & Posts)
| Event | Trigger | Recipient | Type Code |
| :--- | :--- | :--- | :--- |
| **Community Join Request** | User requests to join private community | Community Admin | `community_join_request` |
| **Community Approved** | Admin approves join request | User | `community_join_approved` |
| **Post Like** | User likes a post | Post Author | `post_like` |
| **Post Comment** | User comments on a post | Post Author | `post_comment` |
| **Mention** | User mentioned in comment/post | Mentioned User | `mention` |
| **Admin Announcement** | Admin sends a broadcast or specific message | All Users / User | `admin_announcement` |

### System & Gamification
| Event | Trigger | Recipient | Type Code |
| :--- | :--- | :--- | :--- |
| **Achievement Unlocked** | User unlocks an achievement | User | `achievement_unlocked` |
| **Payment Success** | Top-up approved | User | `payment_success` |
| **Payment Failed** | Top-up rejected | User | `payment_failed` |
| **Coin Adjusted** | Admin manually adjusts user coin balance | User | `coin_adjustment` |
| **Complaint Update** | Complaint status changes (Open -> In Progress -> Resolved/Closed) | User | `complaint_update` |

## 2. Database Schema

We will use the existing proposed structure from `table_schema.md` with slight refinements for clarity.

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- e.g., 'tournament_join_request'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}', -- Stores reference_id, url, image_url, etc.
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Optional: Expiration for temporary notifications
    expires_at TIMESTAMP NULL
);

-- Index for faster queries
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
```

### JSON Data Structure Examples

**Tournament Invite:**
```json
{
  "tournament_id": "uuid",
  "slug": "tournament-slug",
  "action_url": "/t/tournament-slug"
}
```

**Post Like:**
```json
{
  "post_id": "uuid",
  "actor_id": "uuid", -- Who liked it
  "actor_name": "John Doe",
  "image_url": "url/to/avatar"
}
```

**Complaint Update:**
```json
{
  "complaint_id": "uuid",
  "old_status": "open",
  "new_status": "in_progress",
  "admin_note": "Sedang kami proses..."
}
```

## 3. API Endpoints

### `GET /api/notifications`
- **Auth:** Required
- **Query Params:** `limit`, `offset`, `unread_only`
- **Response:** List of notifications

### `PATCH /api/notifications/:id/read`
- **Auth:** Required
- **Action:** Mark specific notification as read

### `PATCH /api/notifications/read-all`
- **Auth:** Required
- **Action:** Mark all user's notifications as read

### `DELETE /api/notifications/:id`
- **Auth:** Required
- **Action:** Remove a notification
