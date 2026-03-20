-- alignment_context_items: operator alignment / context notes (Approach B).
-- RLS matrix (documented):
--   anon: no policies → SELECT/INSERT/UPDATE/DELETE denied by RLS default.
--   authenticated: SELECT only (read via Supabase client with user JWT).
--   service_role: bypasses RLS (server API route with SUPABASE_SERVICE_ROLE_KEY).

CREATE TABLE alignment_context_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}',
    priority INTEGER,
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'active', 'archived')),
    linked_node_id TEXT,
    attendee_id UUID REFERENCES attendees(id) ON DELETE SET NULL,
    source TEXT NOT NULL CHECK (source IN ('ui', 'import', 'api')),
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_alignment_context_items_status ON alignment_context_items(status);
CREATE INDEX idx_alignment_context_items_created_at ON alignment_context_items(created_at DESC);
CREATE INDEX idx_alignment_context_items_linked_node_id ON alignment_context_items(linked_node_id)
    WHERE linked_node_id IS NOT NULL;

CREATE TRIGGER update_alignment_context_items_updated_at
    BEFORE UPDATE ON alignment_context_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE alignment_context_items ENABLE ROW LEVEL SECURITY;

-- Logged-in Supabase users may read (future UI / direct client).
CREATE POLICY "Authenticated users can read alignment_context_items"
    ON alignment_context_items FOR SELECT
    TO authenticated
    USING (true);
