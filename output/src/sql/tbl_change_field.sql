-- sample SQL statements for the tbl_change_field
CREATE TABLE tbl_change_field (
  id  int not null PRIMARY KEY,
  activityid  int,
  tablename  varchar(255),
  fieldname  varchar(255),
  int_value  int,
  str_value  text ,
  was_new  int,
  table_id  int,
  nodeid  int,
)
