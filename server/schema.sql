-- ==============================================================================
-- FLUX HOSTING - DATABASE SCHEMA (PostgreSQL / SQLite Compatible)
-- ==============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'owner' CHECK (role IN ('owner', 'member')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- 2. Servers (VDS / VPS) Table
CREATE TABLE IF NOT EXISTS servers (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    hostname VARCHAR(150) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    private_ip_address VARCHAR(45),
    ipv6_address VARCHAR(64),
    ssh_port INTEGER DEFAULT 22,
    ssh_user VARCHAR(50) DEFAULT 'root',
    auth_type VARCHAR(20) DEFAULT 'password' CHECK (auth_type IN ('password', 'ssh_key')),
    encrypted_credentials TEXT,
    os VARCHAR(50) DEFAULT 'ubuntu_24',
    region VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'online' CHECK (status IN ('online', 'offline', 'rebooting', 'starting', 'stopped')),
    vcpu INTEGER NOT NULL DEFAULT 2,
    ram_mb INTEGER NOT NULL DEFAULT 4096,
    disk_gb INTEGER NOT NULL DEFAULT 80,
    bandwidth_tb NUMERIC(5, 2) DEFAULT 5.0,
    uptime_start BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Server Members (Role-Based Access Control) Table
CREATE TABLE IF NOT EXISTS server_members (
    id VARCHAR(64) PRIMARY KEY,
    server_id VARCHAR(64) NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'member')),
    can_power BOOLEAN DEFAULT false,
    can_console BOOLEAN DEFAULT false,
    can_files BOOLEAN DEFAULT false,
    can_network BOOLEAN DEFAULT false,
    can_manage_members BOOLEAN DEFAULT false,
    view_only BOOLEAN DEFAULT true,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(server_id, user_id)
);

-- 4. Firewall Rules Table
CREATE TABLE IF NOT EXISTS firewall_rules (
    id VARCHAR(64) PRIMARY KEY,
    server_id VARCHAR(64) NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    action VARCHAR(10) NOT NULL CHECK (action IN ('ALLOW', 'DENY')),
    protocol VARCHAR(10) NOT NULL CHECK (protocol IN ('TCP', 'UDP', 'ANY', 'ICMP')),
    port VARCHAR(30) NOT NULL,
    source_ip VARCHAR(60) NOT NULL DEFAULT '0.0.0.0/0',
    comment VARCHAR(255),
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Port Forwarding / Allocation Table
CREATE TABLE IF NOT EXISTS port_allocations (
    id VARCHAR(64) PRIMARY KEY,
    server_id VARCHAR(64) NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    public_port INTEGER NOT NULL,
    internal_port INTEGER NOT NULL,
    protocol VARCHAR(10) DEFAULT 'TCP' CHECK (protocol IN ('TCP', 'UDP', 'BOTH')),
    description VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive'))
);

-- 6. DNS Records Table
CREATE TABLE IF NOT EXISTS dns_records (
    id VARCHAR(64) PRIMARY KEY,
    server_id VARCHAR(64) NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('A', 'AAAA', 'CNAME', 'TXT', 'MX')),
    name VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    ttl INTEGER DEFAULT 3600,
    priority INTEGER
);

-- 7. Virtual File System Index Table
CREATE TABLE IF NOT EXISTS server_files (
    id VARCHAR(64) PRIMARY KEY,
    server_id VARCHAR(64) NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    path VARCHAR(1024) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('file', 'directory')),
    size_bytes BIGINT DEFAULT 0,
    permissions VARCHAR(10) DEFAULT '0644',
    owner VARCHAR(50) DEFAULT 'root',
    group_name VARCHAR(50) DEFAULT 'root',
    content TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. SMTP Configuration Table
CREATE TABLE IF NOT EXISTS smtp_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL DEFAULT 587,
    secure BOOLEAN DEFAULT false,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    from_name VARCHAR(255) DEFAULT 'Flux Hosting',
    from_email VARCHAR(255) NOT NULL,
    is_configured BOOLEAN DEFAULT true
);

-- 9. Email Logs Table
CREATE TABLE IF NOT EXISTS email_logs (
    id VARCHAR(64) PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'failed')),
    error_message TEXT,
    preview_body TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Audit & Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(64) PRIMARY KEY,
    server_id VARCHAR(64) REFERENCES servers(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    username VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Password Reset Tokens Table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    email VARCHAR(255) NOT NULL,
    token VARCHAR(128) NOT NULL,
    expires_at BIGINT NOT NULL,
    PRIMARY KEY(email, token)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_servers_owner ON servers(owner_id);
CREATE INDEX IF NOT EXISTS idx_members_user ON server_members(user_id);
CREATE INDEX IF NOT EXISTS idx_files_path ON server_files(server_id, path);
CREATE INDEX IF NOT EXISTS idx_activity_server ON activity_logs(server_id);
