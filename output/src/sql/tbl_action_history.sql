-- sample SQL statements for the tbl_action_history
CREATE TABLE tbl_action_history (
  id  int not null PRIMARY KEY,
  ctrl_name  text ,
  data_url  text ,
  server_ack  int,
  nodeid  int,
  process_time  int,
  field_update  int,
)
