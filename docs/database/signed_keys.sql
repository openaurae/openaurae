create table if not exists signed_keys
(
    user_id    varchar(64) not null primary key,
    key_id     uuid        not null default gen_random_uuid(),
    created_at timestamptz not null,
    expires_at timestamptz not null

);

create index signed_key_idx on signed_keys (key_id);
