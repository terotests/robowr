-- sample SQL statements for the tbl_local_file
CREATE TABLE tbl_local_file (
  id  int not null PRIMARY KEY,
  type  text ,
  filepath  text ,
  time_created  int,
  size  int,
  nodeid  int,
)
