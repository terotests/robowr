-- sample SQL statements for the change_upload_file
CREATE TABLE change_upload_file (
  id  int not null PRIMARY KEY,
  activityid  int,
  nodeid  int,
  local_path  text ,
  upload_progress  int,
  upload_done  int,
  upload_key  text ,
)
