SELECT s.sid, s.serial#, s.username, o.object_name
FROM v$session s
JOIN v$locked_object l ON s.sid = l.session_id
JOIN all_objects o ON l.object_id = o.object_id
WHERE s.username IS NOT NULL;
