# TECHNICAL ARCHITECTURE & IMPLEMENTATION PLAN

## SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │   USER APP       │              │  BRAND PORTAL    │        │
│  │   (Mobile)       │              │  (Web)           │        │
│  │                  │              │                  │        │
│  │  iOS / Android   │              │  React SPA       │        │
│  │  React Native    │              │  Dashboard       │        │
│  └────────┬─────────┘              └────────┬─────────┘        │
│           │                                 │                  │
└───────────┼─────────────────────────────────┼──────────────────┘
            │                                 │
            └────────────┬────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                             │
│                                                                 │
│  Authentication │ Rate Limiting │ Request Routing               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   USER       │  │  DISCOVERY   │  │   BRAND      │
│   SERVICE    │  │  ENGINE      │  │   SERVICE    │
│              │  │              │  │              │
│ • Profiles   │  │ • Feed Gen   │  │ • Campaigns  │
│ • Auth       │  │ • Matching   │  │ • Analytics  │
│ • Prefs      │  │ • Ranking    │  │ • Reports    │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └────────┬────────┴────────┬────────┘
                │                 │
                ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  PostgreSQL  │  │    Redis     │  │  S3/CDN      │         │
│  │              │  │              │  │              │         │
│  │ • Users      │  │ • Cache      │  │ • Images     │         │
│  │ • Products   │  │ • Sessions   │  │ • Videos     │         │
│  │ • Signals    │  │ • Real-time  │  │ • Assets     │         │
│  │ • Campaigns  │  │   metrics    │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐         │
│  │  Analytics Warehouse (BigQuery/Snowflake)         │         │
│  │  • Historical signals                             │         │
│  │  • Trend analysis                                 │         │
│  │  • ML training data                               │         │
│  └──────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   INTELLIGENCE LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────┐  ┌────────────────────┐               │
│  │  Taste Profiling   │  │  Signal Processing │               │
│  │  Engine            │  │  Pipeline          │               │
│  │                    │  │                    │               │
│  │  • User clustering │  │  • Intent scoring  │               │
│  │  • Authority calc  │  │  • Fraud detection │               │
│  │  • Coherence check │  │  • Trend detection │               │
│  └────────────────────┘  └────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

## CORE DATA MODELS

### User Table
```sql
users
├── id (uuid, primary key)
├── phone_number (string, unique)
├── created_at (timestamp)
├── onboarding_completed (boolean)
├── authority_score (float, 0-100)
├── taste_profile (jsonb)
│   ├── style_preferences
│   ├── coherence_score
│   └── segment_affinity
├── total_signals (integer)
├── consistent_signals (integer)
└── last_active (timestamp)

user_sessions
├── id (uuid)
├── user_id (foreign key)
├── started_at (timestamp)
├── ended_at (timestamp)
├── swipes_count (integer)
└── session_quality_score (float)
```

### Product & Campaign Table
```sql
products
├── id (uuid, primary key)
├── brand_id (foreign key)
├── campaign_id (foreign key)
├── name (string)
├── description (text)
├── category (string)
├── images (jsonb array)
├── video_url (string, nullable)
├── target_segments (jsonb)
├── status (enum: draft, live, completed)
├── created_at (timestamp)
└── launch_date (date, nullable)

campaigns
├── id (uuid, primary key)
├── brand_id (foreign key)
├── name (string)
├── type (enum: a_b_test, single_validation)
├── products (array of product_ids)
├── target_impressions (integer)
├── start_date (timestamp)
├── end_date (timestamp)
├── budget (integer)
├── status (enum: draft, running, completed)
└── settings (jsonb)
```

### Signals Table (Critical)
```sql
signals
├── id (uuid, primary key)
├── user_id (foreign key)
├── product_id (foreign key)
├── campaign_id (foreign key)
├── signal_type (enum: skip, interest, save, long_press)
├── timestamp (timestamp)
├── session_id (foreign key)
├── authority_weight (float)  -- user's authority at signal time
├── context (jsonb)
│   ├── position_in_session
│   ├── time_spent_viewing
│   └── previous_signals
└── processed (boolean)

-- Optimized for analytics
CREATE INDEX idx_signals_product ON signals(product_id, timestamp);
CREATE INDEX idx_signals_campaign ON signals(campaign_id, signal_type);
CREATE INDEX idx_signals_user ON signals(user_id, timestamp);
```

### Moodboards
```sql
moodboards
├── id (uuid, primary key)
├── user_id (foreign key)
├── name (string)
├── created_at (timestamp)
└── is_public (boolean)

moodboard_items
├── id (uuid)
├── moodboard_id (foreign key)
├── product_id (foreign key)
├── added_at (timestamp)
└── notes (text, nullable)
```

### Brand Analytics Cache
```sql
campaign_metrics
├── campaign_id (foreign key, primary key)
├── product_id (foreign key)
├── total_impressions (integer)
├── total_interests (integer)
├── total_saves (integer)
├── intent_rate (float)
├── segment_breakdown (jsonb)
├── hourly_stats (jsonb)
├── updated_at (timestamp)

-- Updated in real-time via Redis, persisted every 5 min
```

## RECOMMENDED TECH STACK

### MVP (Month 1-3)
```
FRONTEND
User App:
  - React Native (Expo) - Cross-platform speed
  - TailwindCSS via NativeWind
  - React Navigation
  - Async Storage for offline

Brand Portal:
  - Next.js 14 (App Router)
  - TailwindCSS
  - Recharts for analytics
  - Shadcn/ui components

BACKEND
  - Node.js + Express (or Fastify for performance)
  - PostgreSQL (Supabase for hosted solution)
  - Redis (Upstash for hosted, serverless)
  - JWT authentication

INFRASTRUCTURE
  - Vercel (frontend hosting)
  - Railway or Render (backend hosting)
  - Cloudinary (image/video CDN)
  - Supabase (database + auth)

ANALYTICS
  - Mixpanel (user behavior)
  - Segment (event pipeline)
  - Basic SQL queries for brand metrics

PAYMENT
  - Razorpay (Indian market focus)
```

### Scale Version (Month 6+)
```
FRONTEND
  - Same as MVP + PWA capabilities
  - Add: React Query for data management
  - Add: Framer Motion for animations

BACKEND
  - Migrate to microservices as needed
  - Add: GraphQL API (Apollo)
  - Add: Kafka/RabbitMQ for event streaming
  - Add: Elasticsearch for search

INFRASTRUCTURE
  - AWS/GCP for full control
  - CloudFront CDN
  - RDS for PostgreSQL
  - ElastiCache for Redis
  - S3 for object storage

ANALYTICS
  - BigQuery data warehouse
  - Looker/Metabase for brand dashboards
  - Custom ML models for:
    - Taste profiling
    - Fraud detection
    - Trend prediction

AI/ML
  - Python microservice for ML
  - TensorFlow/PyTorch for models
  - Vector DB (Pinecone) for similarity
```

## KEY ALGORITHMS & LOGIC

### 1. User Authority Score Calculation
```python
def calculate_authority_score(user):
    """
    Authority score determines signal weight
    Range: 0-100
    """
    
    # Base factors
    consistency_score = calculate_taste_consistency(user)
    # How coherent are their choices over time?
    
    engagement_quality = calculate_engagement_quality(user)
    # Do they use features thoughtfully? (saves, long-press)
    
    prediction_accuracy = calculate_prediction_accuracy(user)
    # Did items they liked actually succeed when launched?
    
    tenure_bonus = min(user.days_active / 90, 1.0) * 10
    # Time on platform (caps at 90 days for 10 points)
    
    # Weighted formula
    authority = (
        consistency_score * 0.40 +
        engagement_quality * 0.30 +
        prediction_accuracy * 0.20 +
        tenure_bonus * 0.10
    )
    
    return min(authority, 100)

def calculate_taste_consistency(user):
    """
    Measures how coherent user's taste profile is
    """
    user_signals = get_user_signals(user.id, limit=100)
    
    # Cluster signals by style attributes
    clusters = cluster_by_attributes(user_signals)
    
    # More concentrated clusters = higher consistency
    # Shannon entropy calculation
    entropy = calculate_entropy(clusters)
    
    # Invert: low entropy = high consistency
    consistency = (1 - normalize(entropy)) * 100
    
    return consistency
```

### 2. Feed Generation Algorithm
```python
def generate_feed(user, session):
    """
    Personalized discovery feed
    Balances: relevance, freshness, diversity, exploration
    """
    
    feed = []
    
    # Segment 1: High-match items (40% of feed)
    high_match = get_products_by_taste_match(
        user.taste_profile,
        match_threshold=0.75,
        limit=20
    )
    feed.extend(high_match)
    
    # Segment 2: Fresh drops (30% of feed)
    fresh = get_recent_products(
        days=7,
        exclude_seen=True,
        limit=15
    )
    feed.extend(fresh)
    
    # Segment 3: Exploratory (20% of feed)
    # Slightly outside comfort zone
    exploratory = get_products_by_taste_match(
        user.taste_profile,
        match_threshold=0.50,
        match_ceiling=0.74,
        limit=10
    )
    feed.extend(exploratory)
    
    # Segment 4: Trending (10% of feed)
    trending = get_trending_products(
        intent_threshold=0.40,
        limit=5
    )
    feed.extend(trending)
    
    # Shuffle within segments for freshness
    # But maintain segment proportions
    shuffle_within_segments(feed)
    
    # Remove already seen
    feed = filter_seen(feed, user.id)
    
    # Cap at 50 items per day
    return feed[:50]
```

### 3. Intent Signal Processing
```python
def process_signal(signal):
    """
    Processes a user signal and updates metrics
    """
    
    # Get user's current authority
    user = get_user(signal.user_id)
    authority_weight = user.authority_score / 100
    
    # Assign signal strength
    signal_weights = {
        'skip': 0,
        'interest': 1.0,
        'save': 2.0,
        'long_press': 3.0
    }
    
    base_weight = signal_weights[signal.signal_type]
    
    # Apply authority multiplier
    weighted_signal = base_weight * authority_weight
    
    # Update product metrics (real-time via Redis)
    update_product_metrics(
        product_id=signal.product_id,
        weighted_signal=weighted_signal,
        user_segment=user.segment
    )
    
    # Update user taste profile (async)
    queue_taste_profile_update(user.id, signal)
    
    # Check for fraud patterns
    if detect_suspicious_pattern(user.id, signal):
        flag_for_review(user.id)
    
    return weighted_signal

def detect_suspicious_pattern(user_id, signal):
    """
    Fraud detection
    """
    recent_signals = get_recent_signals(user_id, minutes=5)
    
    # Too many signals too fast
    if len(recent_signals) > 30:
        return True
    
    # All same type (bot-like)
    if all_same_type(recent_signals):
        return True
    
    # No variance in time spent
    if zero_variance_in_timing(recent_signals):
        return True
    
    return False
```

### 4. Campaign Performance Calculation
```python
def calculate_campaign_metrics(campaign_id):
    """
    Generate brand-facing analytics
    """
    
    campaign = get_campaign(campaign_id)
    products = get_campaign_products(campaign_id)
    
    metrics = {}
    
    for product in products:
        signals = get_product_signals(product.id)
        
        # Core metrics
        total_impressions = len(signals)
        interest_signals = filter_by_type(signals, ['interest', 'save', 'long_press'])
        
        # Intent rate (weighted)
        weighted_interests = sum([s.authority_weight for s in interest_signals])
        weighted_impressions = sum([s.authority_weight for s in signals])
        
        intent_rate = weighted_interests / weighted_impressions if weighted_impressions > 0 else 0
        
        # Segment breakdown
        segments = {}
        for segment in ['age_18_24', 'age_25_34', 'mumbai', 'delhi', 'bangalore']:
            segment_signals = filter_by_segment(signals, segment)
            segment_intent = calculate_intent_rate(segment_signals)
            segments[segment] = segment_intent
        
        # Confidence score
        confidence = calculate_confidence_score(
            intent_rate=intent_rate,
            sample_size=total_impressions,
            segment_consistency=calculate_segment_consistency(segments)
        )
        
        metrics[product.id] = {
            'impressions': total_impressions,
            'intent_rate': intent_rate,
            'confidence': confidence,
            'segments': segments,
            'trending': is_trending(product.id)
        }
    
    # Comparative analysis if A/B test
    if campaign.type == 'a_b_test':
        metrics['winner'] = determine_winner(products, metrics)
        metrics['statistical_significance'] = calculate_significance(metrics)
    
    return metrics

def calculate_confidence_score(intent_rate, sample_size, segment_consistency):
    """
    How confident should brand be in launching?
    Returns: 0-100
    """
    
    # Base confidence from intent rate
    base = intent_rate * 100
    
    # Sample size modifier
    if sample_size < 1000:
        sample_penalty = 0.7
    elif sample_size < 5000:
        sample_penalty = 0.85
    else:
        sample_penalty = 1.0
    
    # Segment consistency bonus
    # If all segments agree, higher confidence
    consistency_bonus = segment_consistency * 10
    
    confidence = (base * sample_penalty) + consistency_bonus
    
    return min(confidence, 100)
```

## API ENDPOINTS DESIGN

### User API
```
POST   /api/auth/login              # Phone OTP
POST   /api/auth/verify             # OTP verification
GET    /api/user/profile            # User profile
PATCH  /api/user/profile            # Update profile
GET    /api/user/taste-profile      # Taste fingerprint

POST   /api/feed/generate           # Generate personalized feed
POST   /api/signal                  # Record user signal (swipe/save)
GET    /api/moodboards              # User's moodboards
POST   /api/moodboards              # Create moodboard
POST   /api/moodboards/:id/items    # Add item to moodboard

GET    /api/influence               # User's influence stats
GET    /api/launches                # Products user helped shape
```

### Brand API
```
POST   /api/brand/auth/login        # Email/password
POST   /api/brand/register          # Brand signup

GET    /api/brand/dashboard         # Overview stats
GET    /api/campaigns               # List campaigns
POST   /api/campaigns               # Create campaign
GET    /api/campaigns/:id           # Campaign details
PATCH  /api/campaigns/:id           # Update campaign
POST   /api/campaigns/:id/start     # Start campaign

POST   /api/products                # Upload product
GET    /api/products/:id/metrics    # Real-time metrics
GET    /api/campaigns/:id/report    # Final report

GET    /api/analytics/trends        # Trend data (subscription tier)
GET    /api/analytics/segments      # Segment insights
```

### Internal/Admin API
```
GET    /api/admin/users             # User management
POST   /api/admin/users/:id/flag    # Flag user
GET    /api/admin/metrics           # Platform health

POST   /api/internal/process-signals  # Batch signal processing
POST   /api/internal/update-authority # Recalculate authority scores
POST   /api/internal/detect-trends    # Trend detection job
```

## IMPLEMENTATION ROADMAP

### Phase 1: MVP (Weeks 1-8)

**Weeks 1-2: Foundation**
```
□ Setup development environment
□ Initialize repos (monorepo with Turborepo)
  - /apps/mobile
  - /apps/brand-portal
  - /packages/api
  - /packages/shared
□ Setup Supabase project
□ Define database schema
□ Setup CI/CD pipeline
□ Design system + component library
```

**Weeks 3-4: Core User App**
```
□ Authentication (phone OTP)
□ Onboarding flow (taste calibration)
□ Swipe feed (basic version)
  - Full-screen images
  - Right/left swipe
  - Basic animations
□ Signal recording
□ Simple moodboard
□ User profile page
```

**Weeks 5-6: Brand Portal**
```
□ Brand authentication
□ Campaign creation flow
  - Upload products
  - Set targets
  - Define questions
□ Basic dashboard
  - Real-time impression count
  - Intent rate
□ Product upload with images
```

**Weeks 7-8: Signal Processing & Launch**
```
□ Authority score calculation (v1)
□ Feed generation algorithm (basic)
□ Real-time metrics pipeline
□ Basic fraud detection
□ PDF report generation
□ Payment integration (Razorpay)
□ Beta testing with 3-5 brands
□ Closed beta with 200-500 users
```

### Phase 2: Platform (Weeks 9-16)

**Weeks 9-10: Enhanced Discovery**
```
□ Improved feed algorithm
  - Segment balancing
  - Diversity mechanisms
□ Long-press interactions
□ Video support
□ Enhanced moodboards
  - Multiple boards
  - Categories
□ Taste fingerprint visualization
```

**Weeks 11-12: Brand Intelligence**
```
□ Advanced campaign analytics
  - Segment breakdown
  - Creative comparison
  - Trend indicators
□ A/B testing framework
□ Confidence scoring
□ Automated insights
□ Competitor benchmarking
```

**Weeks 13-14: Retention Features**
```
□ Influence feedback system
  - "You helped shape this"
  - Launch notifications
□ Weekly fresh drops
□ Limited daily discovery (50 cap)
□ Push notifications strategy
```

**Weeks 15-16: Scale Preparation**
```
□ Performance optimization
□ Load testing (1000+ concurrent users)
□ Monitoring & alerting
□ Data warehouse setup
□ ML pipeline foundation
□ Expand to 20-30 brands
□ Expand to 3,000-5,000 users
```

### Phase 3: Scale (Months 5-12)

**Months 5-6**
```
□ Social features
  - Taste matching
  - Shared moodboards
  - Squad swiping
□ Curator program
□ Brand takeovers
□ Subscription tier launch
```

**Months 7-9**
```
□ Advanced ML models
  - Taste clustering
  - Trend prediction
  - Fraud detection v2
□ Historical data access
□ API for enterprise brands
□ Expand to 60+ brands
□ Expand to 15,000+ users
```

**Months 10-12**
```
□ Category expansion beyond fashion
□ Creator economy features
□ Advanced analytics suite
□ White-label possibilities
□ International preparation
```

## CRITICAL TECHNICAL DECISIONS

### Decision 1: Real-time vs Batch Processing
```
DECISION: Hybrid approach

Real-time (Redis):
- Impression counts
- Live intent rates
- Dashboard metrics for brands

Batch (PostgreSQL + Jobs):
- Authority score updates (hourly)
- Trend detection (daily)
- Report generation (on-demand)

WHY: Balance freshness with cost
```

### Decision 2: Mobile Architecture
```
DECISION: React Native (not native)

PROS:
- Faster development
- Shared code
- Easier iteration in MVP phase

CONS:
- Performance ceiling
- Animation limitations

MITIGATION:
- Use Reanimated for smooth swipes
- Optimize images aggressively
- Plan native rewrite if PMF achieved
```

### Decision 3: Data Retention
```
DECISION: Infinite signal retention

Signals never deleted:
- Core product value
- Historical trends
- ML training data

Archived after 90 days:
- Moved to cold storage
- Still queryable
- Reduced cost

WHY: Data = moat
```

### Decision 4: Image/Video Handling
```
DECISION: CDN-first, aggressive optimization

Upload flow:
1. Brand uploads to S3
2. Lambda triggers processing
3. Generate multiple sizes:
   - Thumbnail (150x150)
   - Feed (1080x1920)
   - Detail (2160x3840)
4. WebP + JPEG formats
5. Push to CloudFront

Video:
- Max 15 seconds
- Compressed to <5MB
- HLS streaming for quality

WHY: Feed speed = retention
```

## MONITORING & METRICS

### System Health
```
- API response time (p50, p95, p99)
- Database query performance
- Redis hit rate
- CDN bandwidth
- Error rates by endpoint
- Mobile crash rate
```

### Product Metrics
```
User Side:
- DAU / WAU / MAU
- Avg session length
- Swipes per session
- Save rate
- Retention (D1, D7, D30)
- Feed scroll depth

Brand Side:
- Active campaigns
- Avg campaign value
- Report generation time
- Dashboard load time
- Repeat rate
```

### Business Metrics
```
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Churn rate
- Net Promoter Score (NPS)
```

---

## DEPLOYMENT STRATEGY

### MVP Deployment
```
Environment: Staging + Production

Staging:
- Auto-deploy from main branch
- Used for testing with team

Production:
- Manual promotion from staging
- Gradual rollout:
  - 10% of users first
  - Monitor for 24 hours
  - Roll out to 50%
  - Monitor for 24 hours
  - Full rollout

Rollback plan:
- Keep previous version running
- Database migrations reversible
- Feature flags for new features
```

### Database Migrations
```
Strategy: Zero-downtime migrations

Rules:
- Never drop columns (deprecate first)
- Add new columns as nullable
- Use transactions
- Test on staging with production data
- Automated backups before migration
```

---

## SECURITY CONSIDERATIONS

### User Data
```
- Phone numbers hashed
- No email required (privacy)
- Taste data anonymized for brands
- GDPR-compliant export/delete
```

### API Security
```
- JWT with short expiry (15 min)
- Refresh tokens (30 days)
- Rate limiting per user
- CORS restrictions
- Input validation
- SQL injection prevention
```

### Payment Security
```
- PCI compliance via Razorpay
- No card data stored
- Webhook signature verification
- Idempotency keys
```

This technical foundation supports the vision while remaining pragmatic for MVP execution.

