-- PMOS content for the mobile app's Learn tab (learn_articles + learn-md storage bucket).
--
-- Two groups:
--  1. Seven articles ported from frontend/src/content/blog — already written, cited,
--     and live on the website. Bodies (frontmatter stripped) are at
--     supabase/content/learn-articles/*.md — upload each to the `learn-md` storage
--     bucket at the md_file_path below before running this seed, or the app will
--     show "Error loading article content." Set is_published = true since this
--     content is already vetted and live elsewhere.
--  2. Four new articles drafted to fill gaps the existing library didn't cover
--     (diagnosis, phenotypes, ovulation-induction medication, PMOS+TTC). Written to
--     match the existing voice and cross-reference the ported articles, but NOT
--     clinically reviewed — is_published = false until the clinical team signs off.
--     Their citations name real consensus documents/trials but don't include
--     specific PubMed links, which should be added during review.
--
-- image_path values reference the same filenames already used on the website
-- (frontend/public/blog/*.jpg, confirmed to exist) — upload those to whichever
-- storage bucket the app's image_path resolves against; not done here.

-- ============================================================================
-- 1. PORTED (already vetted, live on the website)
-- ============================================================================

INSERT INTO learn_articles (title, excerpt, category, md_file_path, image_path, read_time, author, published_date, is_published) VALUES
('The Indian Lean PMOS', 'You’re Not Overweight — So Why Does Your PMOS Still Act Up?', 'PMOS', 'pmos/the-indian-lean-pcos.md', 'the-indian-lean-pcos.jpg', '6 min read', 'Rove Health', '2024-10-01', true),
('Vitamin D and PMOS', 'You Live in the Sun — So Why Is Your Vitamin D Still Low?', 'PMOS', 'pmos/vitamin-d-and-pcos.md', 'vitamin-d-and-pcos.jpg', '6 min read', 'Rove Health', '2024-10-01', true),
('Inositol or Metformin for PMOS', 'Inositol or Metformin for PMOS? It’s Not a Battle — It’s About the Right Fit.', 'PMOS', 'pmos/inositol-or-metformin-for-pcos.md', 'inositol-or-metformin-for-pcos.jpg', '6 min read', 'Rove Health', '2024-10-01', true),
('PMOS or Thyroid', 'Is It PMOS - or Is Your Thyroid the Real Problem?', 'PMOS', 'pmos/pcos-or-thyroid.md', 'pcos-or-thyroid.jpg', '6 min read', 'Rove Health', '2024-10-01', true),
('Hair Loss Science', 'Why Hair Fall Starts Months After the Damage - Not When You Expect It', 'Skincare', 'pmos/hair-loss-science.md', 'hair-loss-science.jpg', '6 min read', 'Rove Health', '2024-10-01', true),
('Acne & Hormones', 'If Your Acne Lives on Your Jawline, Your Skin Is Talking to Your Hormones', 'Skincare', 'pmos/acne-hormones.md', 'acne-hormones.jpg', '6 min read', 'Rove Health', '2024-10-01', true),
('The Dark Neck', 'That Dark Neck Isn’t Dirt - It’s Your Body Asking for Help', 'PMOS', 'pmos/the-dark-neck.md', 'the-dark-neck.jpg', '6 min read', 'Rove Health', '2024-10-01', true);

-- ============================================================================
-- 2. NEW — DRAFTED, NOT YET CLINICALLY REVIEWED
-- ============================================================================

INSERT INTO learn_articles (title, excerpt, category, md_file_path, image_path, read_time, author, published_date, is_published) VALUES
('How PMOS Is Actually Diagnosed', 'The Rotterdam criteria, explained without the jargon.', 'PMOS', 'pmos/pmos-how-its-actually-diagnosed.md', NULL, '7 min read', 'Rove Health', CURRENT_DATE, false),
('The Four PMOS Phenotypes', 'Why the same advice doesn’t work for every kind of PMOS.', 'PMOS', 'pmos/the-four-pmos-phenotypes.md', NULL, '6 min read', 'Rove Health', CURRENT_DATE, false),
('Letrozole and Clomid: What to Expect', 'A guide to ovulation-induction medication — what to expect, not what to take.', 'PMOS', 'pmos/letrozole-and-clomid-what-to-expect.md', NULL, '7 min read', 'Rove Health', CURRENT_DATE, false),
('PMOS and Trying to Conceive', 'Why your tracking has to work differently — and why that’s a feature, not a bug.', 'PMOS', 'pmos/pmos-and-trying-to-conceive.md', NULL, '7 min read', 'Rove Health', CURRENT_DATE, false);
