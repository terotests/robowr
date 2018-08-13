-- sample SQL statements for the tbl_change_activity
CREATE TABLE tbl_change_activity (
  id  int not null PRIMARY KEY,
  started  int,
  completed  int,
  created  int,
  name  varchar(255),
  errors  int,
  error_txt  text ,
)
