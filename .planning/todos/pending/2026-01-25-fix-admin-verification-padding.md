---
created: 2026-01-25T22:47
title: Fix excessive padding in admin verification bottom sheet
area: ui
files:
  - components/admin/AdminVerificationBottomSheet.tsx:113-122
---

## Problem

The admin verification bottom sheet has excessive white space below the "Verify" button, making the UI feel unbalanced and wasting screen real estate. The bottom sheet is set to 50% height but the content only occupies ~60% of that space, leaving ~40% empty white space at the bottom.

User reported: "there is way too much padding still" after multiple reduction attempts.

Current state (after recent changes):
- Header: paddingTop xs, paddingBottom 0
- Content: paddingHorizontal md, paddingTop sm, paddingBottom md (THIS IS THE ISSUE)
- formContent: gap xs, marginBottom 0

The linter/user changed `paddingBottom` from 0 back to `Spacing.md` (16px), which is contributing to the issue.

## Solution

Further reduce spacing:
1. Set `content.paddingBottom` to 0 or Spacing.xs (4px max)
2. Consider reducing header padding even more if needed
3. Test with keyboard open to ensure KeyboardAvoidingView still works properly
4. May need to adjust bottom sheet snap points if content becomes too compact

Goal: Verify button should be close to the bottom of the sheet with minimal gap, similar to Instagram's chat input layout.
