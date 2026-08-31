# ADR-002: Adoption Next.js 16 (Divergence dari Master Prompt Next.js 14)

**Date:** 2026-08-31
**Status:** Accepted

## Context

Master prompt Section 14 sebutkan "Next.js 14+ (App Router)". Saat scaffold via `yarn create next-app`, versi terbaru yang di-install adalah **Next.js 16.3.3** (bukan 14 atau 15).

Ini menciptakan divergence antara dokumen master prompt (Next.js 14) dan reality (Next.js 16).

## Decision

**Adopt Next.js 16.3.3** sebagai baseline. Update rujukan master prompt seperlunya.

## Rationale

**Pro adopting Next.js 16:**
- Versi terbaru = bug fix terbaru, security patch terbaru
- Master prompt tulis "Next.js **14+**" (inclusive plus, jadi 16 valid interpretation)
- Downgrade ke 14 akan buang benefit performance Turbopack default
- React 19 support native (kalau paksa Next 14, harus pinning React 18)

**Con adopting Next.js 16:**
- Very fresh (rilis November 2025) — dokumentasi community masih tipis
- Breaking changes vs Next 14/15 (per warning `AGENTS.md` auto-generated)
- Training data LLM (termasuk Claude) mungkin outdated

**Mitigation:**
- Rujuk `node_modules/next/dist/docs/` (docs bundled sesuai versi actual)
- WebSearch atau WebFetch official Next.js docs sebelum implement pattern baru
- Kalau ada bug spesifik Next 16 yang blocking, opsi downgrade ke 15 tersedia (tidak sampai 14 karena React 19 compat)

## Consequences

**Positive:**
- Turbopack default → dev server ready dalam sub-second
- React 19 features tersedia (server component streaming, actions, dll)
- Future-proof: skema saat ini masih current 1-2 tahun ke depan

**Negative:**
- Perlu extra verification setiap pattern (jangan asumsi Next 14 syntax valid)
- Beberapa third-party library mungkin belum test Next 16 (mitigation: pilih library aktif maintained)
- Master prompt document reference Next 14 akan out-of-sync — perlu diupdate saat convenient

## Diff dari Master Prompt

| Aspek | Master Prompt Section 14 | Reality (post-scaffold) |
|-------|--------------------------|-------------------------|
| Next.js | 14+ | 16.3.3 |
| React | 18+ | 19.2.8 |
| Tailwind | (tidak spesifik) | 4 (major rewrite dari v3) |
| ESLint | (tidak spesifik) | 9 (flat config) |
| Bundler dev | webpack default | Turbopack default |

## Follow-up Actions

- [ ] Update master prompt Section 14 di file source Downloads (living document per Section 0.3)
- [ ] Update Section 15 kalau ada perubahan approach math karena React 19 features
- [ ] Monitor Next.js 16 issues dari community, siap adjust kalau ada gotcha

## References

- Master prompt Section 0.3 (update cycle — living document)
- Master prompt Section 14 (original tech stack)
- Next.js 16 changelog: https://nextjs.org/blog
- React 19 release: https://react.dev/blog
