-- Run this in Supabase SQL Editor before deploying contact/about features.

-- Contact messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert messages" ON contact_messages;
CREATE POLICY "Anyone can insert messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can read all messages" ON contact_messages;
CREATE POLICY "Admin can read all messages"
  ON contact_messages FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can update messages" ON contact_messages;
CREATE POLICY "Admin can update messages"
  ON contact_messages FOR UPDATE
  USING (true);

-- Editable site content
CREATE TABLE IF NOT EXISTS site_content (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read content" ON site_content;
CREATE POLICY "Anyone can read content"
  ON site_content FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can update content" ON site_content;
CREATE POLICY "Admin can update content"
  ON site_content FOR ALL
  USING (true);

INSERT INTO site_content (id, content) VALUES (
  'about',
  'Link Communications Center is Uganda''s trusted provider of surveillance cameras, communications equipment, and smart phones. We offer quality products at affordable prices with expert installation and support services.'
)
ON CONFLICT (id) DO NOTHING;

-- Brand logo storage (public read, upload for admin dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read brand assets" ON storage.objects;
CREATE POLICY "Public read brand assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'brand-assets');

DROP POLICY IF EXISTS "Upload brand assets" ON storage.objects;
CREATE POLICY "Upload brand assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'brand-assets');

DROP POLICY IF EXISTS "Update brand assets" ON storage.objects;
CREATE POLICY "Update brand assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'brand-assets');

DROP POLICY IF EXISTS "Overwrite brand assets" ON storage.objects;
CREATE POLICY "Overwrite brand assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'brand-assets');
