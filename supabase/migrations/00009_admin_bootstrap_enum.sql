-- Admin Bootstrap — Enum Extension
-- Migration 00009: Add user.onboarded to audit_action enum
-- This must be in its own transaction so the new value is committed
-- before it is referenced in triggers (migration 00010).

alter type public.audit_action add value if not exists 'user.onboarded';
