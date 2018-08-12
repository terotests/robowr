-- SQL statements for the change_field
CREATE TABLE change_field (
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
