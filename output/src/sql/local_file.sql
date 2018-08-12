-- SQL statements for the local_file
CREATE TABLE local_file (
  id  int not null PRIMARY KEY,
  type  text ,
  filepath  text ,
  time_created  int,
  size  int,
  nodeid  int,
)
