ALTER TABLE complaints
ADD COLUMN chat_sessions_id VARCHAR(36) NULL AFTER source,
ADD CONSTRAINT fk_complaints_chat_sessions
FOREIGN KEY (chat_sessions_id) REFERENCES chat_sessions(id)
ON DELETE SET NULL;
