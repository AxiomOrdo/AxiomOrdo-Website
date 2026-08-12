-- Recovery-only rollback for a failed first-time activation. Export account and
-- billing metadata before use. Never run this against an activated production
-- database without a separately reviewed recovery decision.
DROP TABLE IF EXISTS "WebhookEvent";
DROP TABLE IF EXISTS "UsageEvent";
DROP TABLE IF EXISTS "Subscription";
DROP TABLE IF EXISTS "Membership";
DROP TABLE IF EXISTS "Workspace";
DROP TABLE IF EXISTS "VerificationToken";
DROP TABLE IF EXISTS "Session";
DROP TABLE IF EXISTS "Account";
DROP TABLE IF EXISTS "User";
DROP TYPE IF EXISTS "WebhookState";
DROP TYPE IF EXISTS "SubscriptionState";
DROP TYPE IF EXISTS "MembershipRole";
