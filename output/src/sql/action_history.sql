-- SQL statements for the action_history
CREATE TABLE action_history (
  id  int not null PRIMARY KEY,
  ctrl_name  text ,
  data_url  text ,
  server_ack  int,
  nodeid  int,
  process_time  int,
  field_update  int,
)
