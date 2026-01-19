---
name: firebase-best-practices
description: Firebase and Firestore performance optimization guidelines. This skill should be used when writing, reviewing, or refactoring code that interacts with Firebase/Firestore to ensure optimal query patterns, minimize read/write costs, and prevent quota issues. Triggers on tasks involving Firestore queries, Firebase Authentication, data modeling, or performance optimization.
license: MIT
metadata:
  author: custom
  version: "1.0.0"
---

# Firebase & Firestore Best Practices

Comprehensive performance and cost optimization guide for Firebase and Firestore applications. Contains rules across 6 categories, prioritized by impact.

## When to Apply

Reference these guidelines when:
- Writing Firestore queries or data fetching logic
- Designing data models and collection structures
- Reviewing code for performance or cost issues
- Debugging quota exceeded or slow query errors
- Implementing caching strategies

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Query Optimization | CRITICAL | `query-` |
| 2 | Read/Write Minimization | CRITICAL | `rw-` |
| 3 | Data Structure Design | HIGH | `data-` |
| 4 | Caching Strategies | MEDIUM-HIGH | `cache-` |
| 5 | Security & Rules | MEDIUM | `security-` |
| 6 | Quota & Cost Management | MEDIUM | `quota-` |

## Quick Reference

### 1. Query Optimization (CRITICAL)

- `query-limit` - Always use `limit()` to restrict query results
- `query-index` - Create composite indexes for complex queries
- `query-avoid-inequality` - Avoid `!=` with `orderBy` (requires composite index)
- `query-pagination` - Use cursor-based pagination (`startAfter`, `endBefore`)
- `query-select-fields` - Select only needed fields when possible

### 2. Read/Write Minimization (CRITICAL)

- `rw-batch-writes` - Use batched writes for multiple operations (max 500)
- `rw-bulk-reader` - Use bulk reader for large read operations
- `rw-avoid-hotspots` - Avoid writing to same document frequently
- `rw-denormalize` - Denormalize data to reduce reads
- `rw-increment` - Use `FieldValue.increment()` instead of read-then-write

### 3. Data Structure Design (HIGH)

- `data-flat-collections` - Prefer flat collections over deep nesting
- `data-subcollections` - Use subcollections instead of large arrays
- `data-document-size` - Keep documents under 1MB, ideally under 100KB
- `data-reference-vs-embed` - Choose between references and embedded data wisely
- `data-timestamp` - Use `serverTimestamp()` for accurate timestamps

### 4. Caching Strategies (MEDIUM-HIGH)

- `cache-client-persistence` - Enable offline persistence for web/mobile
- `cache-server-lru` - Implement LRU cache for frequently accessed data
- `cache-react-query` - Use React Query or SWR for client-side caching
- `cache-static-data` - Cache static/rarely-changing data aggressively

### 5. Security & Rules (MEDIUM)

- `security-validate-input` - Validate data in Security Rules
- `security-rate-limit` - Implement rate limiting patterns
- `security-minimal-permissions` - Grant minimal required permissions
- `security-test-emulator` - Test rules with Firebase Emulator

### 6. Quota & Cost Management (MEDIUM)

- `quota-monitor` - Monitor usage in Firebase Console regularly
- `quota-dev-limits` - Set lower limits in development queries
- `quota-emulator-dev` - Use Firebase Emulator for development
- `quota-alert` - Set up budget alerts in Google Cloud Console

## Common Anti-Patterns to Avoid

### ❌ Fetching All Documents
```typescript
// BAD: Fetches entire collection
const snapshot = await db.collection('articles').get();
```

```typescript
// GOOD: Limit and paginate
const snapshot = await db.collection('articles')
  .orderBy('createdAt', 'desc')
  .limit(20)
  .get();
```

### ❌ Using != with orderBy (Requires Composite Index)
```typescript
// BAD: Requires composite index, may fail
const snapshot = await db.collection('articles')
  .where('status', '!=', 'rejected')
  .orderBy('pubDate', 'desc')
  .get();
```

```typescript
// GOOD: Filter in memory after simple query
const snapshot = await db.collection('articles')
  .orderBy('pubDate', 'desc')
  .limit(100)
  .get();

const filtered = snapshot.docs.filter(doc => doc.data().status !== 'rejected');
```

### ❌ Reading Document Before Incrementing
```typescript
// BAD: 1 read + 1 write
const doc = await docRef.get();
await docRef.update({ count: doc.data().count + 1 });
```

```typescript
// GOOD: 0 reads, 1 write (atomic)
await docRef.update({ count: FieldValue.increment(1) });
```

### ❌ Large Arrays in Documents
```typescript
// BAD: Document grows unboundedly
await docRef.update({
  comments: FieldValue.arrayUnion(newComment) // Array can grow too large
});
```

```typescript
// GOOD: Use subcollection
await docRef.collection('comments').add(newComment);
```

## Firestore Quota Limits (Free Tier - Spark Plan)

| Resource | Daily Limit |
|----------|-------------|
| Document Reads | 50,000 |
| Document Writes | 20,000 |
| Document Deletes | 20,000 |
| Stored Data | 1 GB |
| Network Egress | 10 GB/month |

## How to Use

Apply these rules when:
1. Writing new Firestore queries
2. Debugging `RESOURCE_EXHAUSTED` errors
3. Optimizing slow queries
4. Reducing Firebase costs
5. Designing new collections/documents
