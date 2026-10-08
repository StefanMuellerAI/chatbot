// Idempotentes DDL. Wird beim ersten DB-Zugriff ausgeführt und muss zu schema.ts passen.
export const BOOTSTRAP_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS models (
    id text PRIMARY KEY,
    provider text NOT NULL,
    model_id text NOT NULL,
    display_name text NOT NULL,
    description text NOT NULL DEFAULT '',
    enabled boolean NOT NULL DEFAULT true,
    is_default boolean NOT NULL DEFAULT false,
    sort_order integer NOT NULL DEFAULT 100,
    capabilities jsonb NOT NULL,
    effort_map jsonb NOT NULL,
    default_effort text NOT NULL DEFAULT 'medium',
    max_output_tokens integer NOT NULL DEFAULT 64000,
    price_in double precision NOT NULL DEFAULT 0,
    price_out double precision NOT NULL DEFAULT 0,
    price_cache_read double precision NOT NULL DEFAULT 0,
    price_cache_write double precision NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS presets (
    id text PRIMARY KEY,
    name text NOT NULL,
    icon text NOT NULL DEFAULT 'sparkles',
    description text NOT NULL DEFAULT '',
    prompt_addendum text NOT NULL DEFAULT '',
    default_model_id text,
    enabled boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 100,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS usage_log (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ts timestamptz NOT NULL DEFAULT now(),
    session_hash text NOT NULL,
    model_id text NOT NULL,
    feature text NOT NULL,
    input_tokens integer NOT NULL DEFAULT 0,
    output_tokens integer NOT NULL DEFAULT 0,
    cache_read_tokens integer NOT NULL DEFAULT 0,
    cache_write_tokens integer NOT NULL DEFAULT 0,
    units double precision NOT NULL DEFAULT 0,
    cost_usd double precision NOT NULL DEFAULT 0,
    saved_usd double precision NOT NULL DEFAULT 0,
    answer_cache_hit boolean NOT NULL DEFAULT false
  )`,
  `CREATE INDEX IF NOT EXISTS usage_log_ts_idx ON usage_log (ts)`,
  `CREATE TABLE IF NOT EXISTS file_cache (
    sha256 text PRIMARY KEY,
    kind text NOT NULL,
    mime text NOT NULL,
    extracted_text text NOT NULL,
    token_estimate integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS transcript_cache (
    sha256 text NOT NULL,
    model text NOT NULL,
    text text NOT NULL,
    duration_sec double precision NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (sha256, model)
  )`,
  `CREATE TABLE IF NOT EXISTS answer_cache (
    key_hash text PRIMARY KEY,
    model_id text NOT NULL,
    answer jsonb NOT NULL,
    usage jsonb NOT NULL,
    cost_usd double precision NOT NULL DEFAULT 0,
    hits integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS answer_cache_expires_idx ON answer_cache (expires_at)`,
  `CREATE TABLE IF NOT EXISTS transcription_jobs (
    id text PRIMARY KEY,
    sha256 text NOT NULL,
    model text NOT NULL,
    source_key text NOT NULL,
    chunk_keys jsonb NOT NULL,
    chunk_texts jsonb NOT NULL,
    duration_sec double precision NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS stored_files (
    key text PRIMARY KEY,
    kind text NOT NULL,
    mime text NOT NULL,
    size integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS stored_files_expires_idx ON stored_files (expires_at)`,
  `CREATE TABLE IF NOT EXISTS login_attempts (
    ip_hash text PRIMARY KEY,
    window_start timestamptz NOT NULL DEFAULT now(),
    count integer NOT NULL DEFAULT 0
  )`,
];
